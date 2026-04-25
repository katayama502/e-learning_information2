-- Create RPG progress table
create table if not exists public.rpg_progress (
  user_id uuid references auth.users not null primary key,
  name text not null default '新人就活生',
  level integer not null default 1,
  exp integer not null default 0,
  hp integer not null default 100,
  max_hp integer not null default 100,
  mp integer not null default 50,
  max_mp integer not null default 50,
  attack integer not null default 10,
  defense integer not null default 10,
  coins integer not null default 0,
  current_map_id text not null default 'town_start',
  position_x integer not null default 10,
  position_y integer not null default 10,
  inventory jsonb default '[]'::jsonb,
  equipment jsonb default '{}'::jsonb,
  flags jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.rpg_progress enable row level security;

-- Create policies
create policy "Users can view their own rpg progress"
  on public.rpg_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own rpg progress"
  on public.rpg_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own rpg progress"
  on public.rpg_progress for update
  using ( auth.uid() = user_id );

-- Create trigger for updated_at
create trigger handle_updated_at before update on public.rpg_progress
  for each row execute procedure public.handle_updated_at();
