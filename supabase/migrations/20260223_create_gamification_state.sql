-- Create Gamification State table
create table if not exists public.gamification_state (
  user_id uuid references auth.users not null primary key,
  state jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.gamification_state enable row level security;

-- Create policies
create policy "Users can view their own gamification state"
  on public.gamification_state for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own gamification state"
  on public.gamification_state for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own gamification state"
  on public.gamification_state for update
  using ( auth.uid() = user_id );

-- Create trigger for updated_at
create trigger handle_updated_at before update on public.gamification_state
  for each row execute procedure public.handle_updated_at();
