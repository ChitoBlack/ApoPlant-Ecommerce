alter table public.plantas
  add column if not exists luz text check (luz is null or luz in ('directa', 'indirecta', 'sombra')),
  add column if not exists riego text check (riego is null or riego in ('bajo', 'moderado', 'frecuente')),
  add column if not exists dificultad text check (dificultad is null or dificultad in ('facil', 'intermedia', 'avanzada')),
  add column if not exists apta_mascotas boolean;
