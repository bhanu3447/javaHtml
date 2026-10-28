-- Course lock: run this once in Supabase → SQL Editor → New query → Run.
-- Roles: owner (you, one person), admin (people you choose), learner (everyone else).
-- A learner opens a course only after an owner/admin approves it. Docs: kb/access-lock.md

create table public.profiles(
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  role text not null default 'learner' check (role in ('owner','admin','learner')),
  created_at timestamptz not null default now());

create table public.courses(id text primary key, title text not null);
insert into public.courses values
  ('java','Java: Zero to Advanced'),('sql','SQL: Zero to Advanced'),
  ('spring','Spring Boot: Annotations Lab'),('patterns','Design Patterns, Beginner to Expert');

-- An approved person: the face embedding of the photo you uploaded (the photo itself is never stored).
create table public.invites(
  id bigint generated always as identity primary key,
  email text not null unique,
  name text not null,
  embedding float8[] not null,
  attempts int not null default 0,          -- failed selfie checks; 5 locks the invite
  used_at timestamptz,                      -- set when the person registers
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now());

create table public.course_access(
  user_id uuid references public.profiles(id) on delete cascade,
  course_id text references public.courses(id),
  status text not null check (status in ('pending','approved','rejected')),
  requested_at timestamptz not null default now(),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  primary key(user_id, course_id));

-- helpers
create function public.my_role() returns text language sql stable security definer set search_path=public as
$$ select role from profiles where id = auth.uid() $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select coalesce((select role in ('owner','admin') from profiles where id = auth.uid()), false) $$;

-- every new auth user gets a profile (name comes from the register function)
create function public.on_new_user() returns trigger language plpgsql security definer set search_path=public as
$$ begin insert into profiles(id,email,name) values(new.id, new.email, new.raw_user_meta_data->>'name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.on_new_user();

-- row level security: reads only; every write goes through the functions below or the edge functions
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.invites enable row level security;
alter table public.course_access enable row level security;
create policy "own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "everyone" on public.courses for select using (true);
create policy "admin reads" on public.invites for select using (public.is_admin());
create policy "admin deletes" on public.invites for delete using (public.is_admin());
create policy "own or admin" on public.course_access for select using (user_id = auth.uid() or public.is_admin());

-- a learner asks for a course (again after a rejection)
create function public.request_course(p_course text) returns text language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'log in first'; end if;
  insert into course_access(user_id, course_id, status) values(auth.uid(), p_course, 'pending')
  on conflict (user_id, course_id) do update set status='pending', requested_at=now(), decided_by=null, decided_at=null
    where course_access.status = 'rejected';
  return (select status from course_access where user_id = auth.uid() and course_id = p_course);
end $$;

-- owner/admin: approve, reject or remove ('none') one person's access to one course
create function public.decide_access(p_user uuid, p_course text, p_status text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_admin() then raise exception 'admins only'; end if;
  if p_status = 'none' then delete from course_access where user_id = p_user and course_id = p_course; return; end if;
  if p_status not in ('approved','rejected') then raise exception 'bad status'; end if;
  insert into course_access(user_id, course_id, status, decided_by, decided_at) values(p_user, p_course, p_status, auth.uid(), now())
  on conflict (user_id, course_id) do update set status = p_status, decided_by = auth.uid(), decided_at = now();
end $$;

-- owner only: make someone an admin or a learner again
create function public.set_role(p_user uuid, p_role text) returns void language plpgsql security definer set search_path=public as $$
begin
  if my_role() is distinct from 'owner' then raise exception 'owner only'; end if;
  if p_role not in ('admin','learner') then raise exception 'bad role'; end if;
  if p_user = auth.uid() then raise exception 'cannot change your own role'; end if;
  update profiles set role = p_role where id = p_user and role <> 'owner';
end $$;

revoke execute on function public.request_course(text), public.decide_access(uuid,text,text), public.set_role(uuid,text) from public, anon;
grant execute on function public.request_course(text), public.decide_access(uuid,text,text), public.set_role(uuid,text) to authenticated;

-- the private bucket that holds the lesson pages and lesson data files
insert into storage.buckets(id, name, public) values ('site', 'site', false);

-- AFTER you create your own user (Authentication → Users → Add user), make yourself the owner:
-- update public.profiles set role = 'owner' where email = 'you@example.com';
