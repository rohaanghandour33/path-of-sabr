-- Enable RLS on all tables
-- Run this in the Supabase SQL Editor

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'premium')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prayers table
create table if not exists public.prayers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  fajr text default 'missed' check (fajr in ('on_time', 'late', 'missed')),
  dhuhr text default 'missed' check (dhuhr in ('on_time', 'late', 'missed')),
  asr text default 'missed' check (asr in ('on_time', 'late', 'missed')),
  maghrib text default 'missed' check (maghrib in ('on_time', 'late', 'missed')),
  isha text default 'missed' check (isha in ('on_time', 'late', 'missed')),
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.prayers enable row level security;

create policy "Users can manage own prayers"
  on public.prayers for all
  using (auth.uid() = user_id);

-- Moods table
create table if not exists public.moods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  mood_score integer not null check (mood_score between 1 and 10),
  mood_label text,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.moods enable row level security;

create policy "Users can manage own moods"
  on public.moods for all
  using (auth.uid() = user_id);
