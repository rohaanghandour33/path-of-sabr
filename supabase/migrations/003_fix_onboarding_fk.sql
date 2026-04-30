-- Fix onboarding_responses FK to reference auth.users directly.
-- The profiles trigger can be delayed or missing for some sign-up flows,
-- which caused the insert to fail with a FK violation and silently stuck the survey.
-- Run this if you already ran 002_onboarding.sql.

alter table public.onboarding_responses
  drop constraint if exists onboarding_responses_user_id_fkey;

alter table public.onboarding_responses
  add constraint onboarding_responses_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
