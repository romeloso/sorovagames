-- Modelo relacional previsto para las cinco materias.
-- La aplicación en producción guarda un documento JSON en app_state.
-- Este archivo no se ejecuta al arrancar y no sustituye las políticas de un tutor autenticado.
-- Cuando exista una cuenta por familia, cada tutor solo debe leer los perfiles que administra.

create table if not exists subjects (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  color text not null,
  sort_order integer not null
);

create table if not exists learning_worlds (
  id text primary key,
  subject_id text not null references subjects (id),
  title text not null,
  subtitle text not null,
  sort_order integer not null
);

create table if not exists skills (
  id text primary key,
  subject_id text not null references subjects (id),
  world_id text references learning_worlds (id),
  title text not null,
  description text not null default ''
);

create table if not exists skill_prerequisites (
  skill_id text not null references skills (id),
  prerequisite_id text not null references skills (id),
  primary key (skill_id, prerequisite_id)
);

create table if not exists lessons (
  id text primary key,
  subject_id text not null references subjects (id),
  world_id text not null references learning_worlds (id),
  title text not null,
  objective text not null,
  instructions text not null,
  difficulty text not null default 'inicial',
  published boolean not null default true
);

create table if not exists lesson_skills (
  lesson_id text not null references lessons (id) on delete cascade,
  skill_id text not null references skills (id),
  primary key (lesson_id, skill_id)
);

create table if not exists activities (
  id text primary key,
  lesson_id text not null references lessons (id) on delete cascade,
  kind text not null,
  prompt text not null,
  answer text,
  payload jsonb not null default '{}'::jsonb,
  sort_order integer not null
);

create table if not exists learning_attempts (
  id text primary key,
  child_id text not null,
  activity_id text not null references activities (id),
  correct boolean not null,
  attempts integer not null,
  hints_used integer not null default 0,
  duration_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists learning_attempts_child_idx on learning_attempts (child_id, created_at);

-- El progreso por materia sigue en el documento de la app hasta tener cuentas de tutor.
-- No aplicar este script sobre la base de producción sin una migración de datos.
