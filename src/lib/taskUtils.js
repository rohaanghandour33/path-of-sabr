import { supabase } from './supabase';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getMondayOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Find next date (from today inclusive) that falls on one of freeDays
function getNextFreeDayDate(freeDays) {
  if (!freeDays || freeDays.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (freeDays.includes(DAY_NAMES[d.getDay()])) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
}

// ── Fetch this week's schedule for a user ─────────────────────────────────────
export async function getUserSchedule(userId) {
  const weekOf = getMondayOfWeek();
  const { data } = await supabase
    .from('user_schedule')
    .select('free_days')
    .eq('user_id', userId)
    .eq('week_of', weekOf)
    .maybeSingle();
  return data?.free_days || null; // null = no schedule set, [] = "don't know"
}

// ── Check if a task needs generating; generate if so ─────────────────────────
export async function checkAndGenerateTasks(userId) {
  try {
    // Fetch schedule for this week
    const freeDays = await getUserSchedule(userId);
    if (!freeDays || freeDays.length === 0) return { generated: false }; // no schedule or don't know

    // Is there already an incomplete task for the next free day?
    const nextFreeDay = getNextFreeDayDate(freeDays);
    if (!nextFreeDay) return { generated: false };

    const { data: existing } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', false)
      .eq('due_date', nextFreeDay)
      .limit(1);

    if (existing && existing.length > 0) return { generated: false };

    // No task for next free day — generate one
    return await generateTasks(userId, freeDays);
  } catch (e) {
    console.error('[taskUtils] checkAndGenerateTasks error:', e);
    return { generated: false };
  }
}

// ── Generate 1 task for the user's next free day ──────────────────────────────
export async function generateTasks(userId, freeDays) {
  try {
    // ── 1. Gather context ──────────────────────────────────────────────────
    const [
      { data: onboarding },
      { data: prayerRows },
      { data: conversations },
    ] = await Promise.all([
      supabase.from('onboarding_responses').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('prayers').select('*').eq('user_id', userId)
        .order('date', { ascending: false }).limit(7),
      supabase.from('ai_conversations').select('role,content').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(20),
    ]);

    // ── 2. Build context strings ──────────────────────────────────────────
    const onboardingStr = onboarding
      ? JSON.stringify(onboarding).slice(0, 500)
      : '';

    // Summarise recent prayer consistency
    let prayerSummary = '';
    if (prayerRows && prayerRows.length > 0) {
      const keys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const missed = {};
      keys.forEach(k => { missed[k] = 0; });
      prayerRows.forEach(r => {
        keys.forEach(k => { if (r[k] === 'missed') missed[k]++; });
      });
      const missedPrayers = keys.filter(k => missed[k] > 0)
        .map(k => `${k} (missed ${missed[k]}x in last 7 days)`);
      if (missedPrayers.length > 0)
        prayerSummary = `Recently missed: ${missedPrayers.join(', ')}.`;
      else
        prayerSummary = 'All 5 prayers consistent in last 7 days.';
    }

    // Last 10 AI messages for context (user messages only to keep it concise)
    const recentConvStr = (conversations || [])
      .filter(m => m.role === 'user')
      .slice(0, 5)
      .map(m => m.content.slice(0, 120))
      .join(' | ') || '';

    const fullContext = [onboardingStr, prayerSummary].filter(Boolean).join('\n');

    // ── 3. Try to get tasks already assigned (avoid repeats) ─────────────
    const { data: usedRows } = await supabase
      .from('user_tasks')
      .select('task_title')
      .eq('user_id', userId);
    const usedTitles = new Set((usedRows || []).map(r => r.task_title));

    // ── 4. Determine difficulty ───────────────────────────────────────────
    let difficulty = 'moderate';
    if (onboarding) {
      const raw = JSON.stringify(onboarding).toLowerCase();
      if (raw.includes('gentle') || raw.includes('fragile') || raw.includes('just starting'))
        difficulty = 'gentle';
      else if (raw.includes('challenging') || raw.includes('push me') || raw.includes('ambitious'))
        difficulty = 'challenging';
    }

    // ── 5. Due date = next free day ───────────────────────────────────────
    const nextFreeDay = getNextFreeDayDate(freeDays || []);
    if (!nextFreeDay) return { generated: false };

    const today = new Date().toISOString().split('T')[0];

    // ── 6. Call Claude for personalised task ──────────────────────────────
    let task = null;
    try {
      const apiRes = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingContext: fullContext,
          recentConversations: recentConvStr,
        }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        const t = Array.isArray(json.tasks) ? json.tasks[0] : null;
        if (t?.task_title && !usedTitles.has(t.task_title)) {
          task = {
            user_id:            userId,
            task_title:         t.task_title,
            task_description:   t.task_description || '',
            task_type:          t.task_type || 'character',
            frequency_per_week: 1,
            assigned_date:      today,
            due_date:           nextFreeDay,
            completed:          false,
            is_personalised:    true,
          };
        }
      }
    } catch (e) {
      console.warn('[taskUtils] AI task generation skipped:', e.message);
    }

    // ── 7. Fall back to template if AI failed ────────────────────────────
    if (!task) {
      const { data: templates } = await supabase
        .from('task_templates')
        .select('*')
        .eq('difficulty_level', difficulty);

      const candidates = (templates || []).filter(t => !usedTitles.has(t.task_title));

      // Prefer task types matching their struggles
      let preferredTypes = [];
      if (onboarding) {
        const raw = JSON.stringify(onboarding).toLowerCase();
        if (raw.includes('fajr') || raw.includes('prayer') || raw.includes('salah'))
          preferredTypes.push('prayer');
        if (raw.includes('quran') || raw.includes('reading'))
          preferredTypes.push('quran');
        if (raw.includes('distract') || raw.includes('phone'))
          preferredTypes.push('dhikr');
        if (raw.includes('character') || raw.includes('patience'))
          preferredTypes.push('character');
      }
      if (preferredTypes.length === 0) preferredTypes = ['prayer', 'quran', 'dhikr'];

      const picked =
        candidates.filter(t => preferredTypes.includes(t.task_type)).sort(() => Math.random() - 0.5)[0]
        || candidates.sort(() => Math.random() - 0.5)[0]
        || null;

      if (picked) {
        task = {
          user_id:            userId,
          task_title:         picked.task_title,
          task_description:   picked.task_description,
          task_type:          picked.task_type,
          frequency_per_week: picked.frequency_per_week,
          assigned_date:      today,
          due_date:           nextFreeDay,
          completed:          false,
          is_personalised:    false,
        };
      }
    }

    if (!task) return { generated: false };

    const { error } = await supabase.from('user_tasks').insert([task]);
    if (error) {
      console.error('[taskUtils] Insert error:', error.message);
      return { generated: false };
    }

    return { generated: true, task };
  } catch (e) {
    console.error('[taskUtils] generateTasks error:', e);
    return { generated: false };
  }
}
