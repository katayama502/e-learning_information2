-- Create rpg_maps table
create table if not exists rpg_maps (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  name text not null,
  width integer not null default 20,
  height integer not null default 20,
  base_image_url text,
  encounters_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rpg_map_collisions table
create table if not exists rpg_map_collisions (
  id uuid default gen_random_uuid() primary key,
  map_id uuid references rpg_maps(id) on delete cascade not null,
  x integer not null,
  y integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(map_id, x, y)
);

-- Create rpg_map_objects table
create type rpg_object_type as enum ('npc', 'portal', 'item', 'company');

create table if not exists rpg_map_objects (
  id uuid default gen_random_uuid() primary key,
  map_id uuid references rpg_maps(id) on delete cascade not null,
  type text not null, -- using text to allow flexibility, but logic handles enum-like values
  x integer not null,
  y integer not null,
  name text,
  sprite_url text,
  scenario_id text,
  target_map_id text, -- storing key/id of target map
  target_x integer,
  target_y integer,
  json_data jsonb, -- for any extra properties
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table rpg_maps enable row level security;
alter table rpg_map_collisions enable row level security;
alter table rpg_map_objects enable row level security;

-- Policies
-- Public Read
create policy "Public maps are viewable by everyone" on rpg_maps
  for select using (true);
create policy "Public collisions are viewable by everyone" on rpg_map_collisions
  for select using (true);
create policy "Public objects are viewable by everyone" on rpg_map_objects
  for select using (true);

-- Admin Write (Assuming simple authenticated write for now, or refine later)
create policy "Authenticated users can insert maps" on rpg_maps
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update maps" on rpg_maps
  for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete maps" on rpg_maps
  for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can insert collisions" on rpg_map_collisions
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can delete collisions" on rpg_map_collisions
  for delete using (auth.role() = 'authenticated');

create policy "Authenticated users can insert objects" on rpg_map_objects
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update objects" on rpg_map_objects
  for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete objects" on rpg_map_objects
  for delete using (auth.role() = 'authenticated');
