import { supabase } from './supabase';

// ── Checks if the user has active tasks; generates them if not.
// Returns { generated: boolean }
export async function checkAndGenerateTasks(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .gte('due_date', today)
      .limit(1);

    if (existing && existing.length > 0) return { generated: false };

    // No active tasks — generate a fresh week
    return await generateTasks(userId);
  } catch (e) {
    console.error('[taskUtils] checkAndGenerateTasks error:', e);
    return { generated: false };
  }
}

// ── Generates and inserts a fresh set of weekly tasks for a user.
// Returns { generated: boolean }
export async function generateTasks(userId) {
  try {
    // Fetch user's onboarding context
    const { data: onboarding } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Determine difficulty from onboarding (TODO: map exact column once known)
    // For now check if any column value contains 'gentle' or 'challenging'
    let difficulty = 'moderate';
    if (onboarding) {
      const raw = JSON.stringify(onboarding).toLowerCase();
      if (raw.includes('gentle') || raw.includes('fragile')) difficulty = 'gentle';
      else if (raw.includes('challenging') || raw.includes('push me hard')) difficulty = 'challenging';
    }

    // Fetch templates matching difficulty
    const { data: templates } = await supabase
      .from('task_templates')
      .select('*')
      .eq('difficulty_level', difficulty);

    const shuffled = (templates || []).sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 5);

    // Build a lean context string for Claude
    const contextStr = onboarding
      ? JSON.stringify(onboarding).slice(0, 400)
      : '';

    // Call serverless function for 2 personalised tasks
    let personalisedTasks = [];
    try {
      const apiRes = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingContext: contextStr }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        personalisedTasks = Array.isArray(json.tasks) ? json.tasks.slice(0, 2) : [];
      }
    } catch (e) {
      console.warn('[taskUtils] Personalised task generation skipped:', e.message);
    }

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 6);
    const due = dueDate.toISOString().split('T')[0];

    const allTasks = [
      ...picked.map((t) => ({
        user_id: userId,
        task_title: t.task_title,
        task_description: t.task_description,
        task_type: t.task_type,
        frequency_per_week: t.frequency_per_week,
        assigned_date: today,
        due_date: due,
        completed: false,
        is_personalised: false,
      })),
      ...personalisedTasks.map((t) => ({
        user_id: userId,
        task_title: t.task_title || 'Reflect on your intentions today',
        task_description: t.task_description || 'Take a moment to check your niyyah and realign with your goals.',
        task_type: t.task_type || 'character',
        frequency_per_week: 7,
        assigned_date: today,
        due_date: due,
        completed: false,
        is_personalised: true,
      })),
    ];

    if (allTasks.length > 0) {
      const { error } = await supabase.from('user_tasks').insert(allTasks);
      if (error) {
        console.error('[taskUtils] Insert error:', error.message);
        return { generated: false };
      }
    }

    return { generated: true };
  } catch (e) {
    console.error('[taskUtils] generateTasks error:', e);
    return { generated: false };
  }
}
