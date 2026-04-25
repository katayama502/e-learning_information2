-- Create Cyber Defense Progress table
create table if not exists public.cyber_defense_progress (
  user_id uuid references auth.users not null primary key,
  shards integer not null default 5000,
  meta_upgrades jsonb not null default '{
    "damageLevel": 0,
    "cooldownLevel": 0,
    "maxHpLevel": 0,
    "expGainLevel": 0,
    "rerollLevel": 0
  }'::jsonb,
  unlocked_weapon_ids text[] not null default '{}',
  selected_weapon_ids text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.cyber_defense_progress enable row level security;

-- Create policies
create policy "Users can view their own cyber defense progress"
  on public.cyber_defense_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own cyber defense progress"
  on public.cyber_defense_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own cyber defense progress"
  on public.cyber_defense_progress for update
  using ( auth.uid() = user_id );

-- Create trigger for updated_at
create trigger handle_cyber_defense_updated_at before update on public.cyber_defense_progress
  for each row execute procedure public.handle_updated_at();
