-- Modelo relacional previsto para Leo y Escribo.
-- Hoy la app guarda perfiles, progreso y material en app_state (JSON).
-- Este archivo no se ejecuta al arrancar. Sirve cuando cada tutor tenga su cuenta.

create table if not exists learning_worlds (
  id text primary key,
  title text not null,
  subtitle text not null,
  sort_order integer not null
);

create table if not exists skills (
  id text primary key,
  world_id text not null references learning_worlds (id),
  title text not null
);

create table if not exists skill_prerequisites (
  skill_id text not null references skills (id),
  prerequisite_id text not null references skills (id),
  primary key (skill_id, prerequisite_id)
);

create table if not exists lessons (
  id text primary key,
  world_id text not null references learning_worlds (id),
  title text not null,
  objective text not null,
  instructions text not null,
  published boolean not null default false
);

create table if not exists exercises (
  id text primary key,
  lesson_id text not null references lessons (id) on delete cascade,
  kind text not null,
  prompt text not null,
  answer text,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists skill_progress (
  child_id text not null,
  skill_id text not null references skills (id),
  independent_correct integer not null default 0,
  independent_total integer not null default 0,
  assisted_correct integer not null default 0,
  sessions integer not null default 0,
  status text not null default 'not_evaluated',
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  primary key (child_id, skill_id)
);

create index if not exists skill_progress_child_idx on skill_progress (child_id);
