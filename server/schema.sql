-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  password text not null,
  pic text default 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CHATS TABLE
create table if not exists chats (
  id uuid default uuid_generate_v4() primary key,
  chat_name text,
  is_group_chat boolean default false,
  group_admin_id uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  latest_message_id uuid -- Will add foreign key constraint later to avoid circular dependency
);

-- CHAT_USERS JUNCTION TABLE (Many-to-Many)
create table if not exists chat_users (
  chat_id uuid references chats(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  primary key (chat_id, user_id)
);

-- MESSAGES TABLE
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references users(id),
  content text,
  chat_id uuid references chats(id) on delete cascade,
  file_url text,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add delayed foreign key for latest_message_id in chats
alter table chats 
add constraint fk_latest_message 
foreign key (latest_message_id) 
references messages(id);

-- Enable Row Level Security (RLS) - Optional for now as we use Service Key in backend, but good practice
alter table users enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;
