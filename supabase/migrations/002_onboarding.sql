-- Onboarding responses table
create table if not exists public.onboarding_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  q1 text,
  q2 text,
  q2b text[],
  q3 text[],
  q4 text[],
  q5 text,
  q6 text,
  q7 text,
  q8 text,
  completed_at timestamptz default now()
);

alter table public.onboarding_responses enable row level security;

create policy "Users can manage own onboarding"
  on public.onboarding_responses for all
  using (auth.uid() = user_id);

-- Remove default 'missed' from prayers so NULL = not yet logged
alter table public.prayers alter column fajr drop default;
alter table public.prayers alter column dhuhr drop default;
alter table public.prayers alter column asr drop default;
alter table public.prayers alter column maghrib drop default;
alter table public.prayers alter column isha drop default;
