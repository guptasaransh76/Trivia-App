-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor) to create the table and bucket.

-- Table: quizzes (Option B - questions stored as JSONB)
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  sender_name text not null,
  final_message text,
  final_image_url text,
  questions jsonb not null,
  created_at timestamptz default now()
);

-- Allow public read by quiz id (for share links)
alter table public.quizzes enable row level security;

create policy "Allow public read on quizzes"
  on public.quizzes for select
  using (true);

-- Allow insert (anon or service role) for creating new quizzes
create policy "Allow insert on quizzes"
  on public.quizzes for insert
  with check (true);

-- Storage bucket for quiz images (create via Dashboard: Storage -> New bucket -> "quiz-images", set Public)
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('quiz-images', 'quiz-images', true)
on conflict (id) do nothing;

-- Allow public read for bucket objects
create policy "Allow public read quiz-images"
  on storage.objects for select
  using (bucket_id = 'quiz-images');

-- Allow insert for uploads (service role or anon; restrict in app if needed)
create policy "Allow insert quiz-images"
  on storage.objects for insert
  with check (bucket_id = 'quiz-images');
