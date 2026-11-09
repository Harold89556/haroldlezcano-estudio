-- Documentación del esquema EXISTENTE verificado en fbeihokebuekvqsfvnjv.
-- Solo estudio Harold Lezcano. No ejecutar como migración ni en otros proyectos.
-- Metadata de galería en Firestore; no existe una tabla de galería en Supabase.
create table public.admins (
 email text primary key check (email = lower(email)),
 creado timestamptz not null default now()
);
alter table public.admins enable row level security;
insert into public.admins (email) values ('henro89@gmail.com');

create or replace function public.es_admin()
returns boolean language sql stable security definer
set search_path to public, pg_temp
as $$
 select coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
    and exists (select 1 from public.admins a
                where a.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated, service_role;
-- Los grants de tabla predeterminados existen, pero RLS no tiene políticas
-- de escritura: ningún cliente puede agregarse a admins ni modificar la lista.
grant all on public.admins to anon, authenticated, service_role;
create policy admins_solo_admin on public.admins
 for select to authenticated using (public.es_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 8388608,
 array['image/webp','image/jpeg','image/png','image/gif','image/avif']);
-- URLs /storage/v1/object/public/fotos/... públicas; listado/operaciones con RLS.
-- El cliente restringe además la ruta a galeria/ y nunca usa upsert.
create policy fotos_storage_admin_leer on storage.objects
 for select to authenticated using (bucket_id = 'fotos' and public.es_admin());
create policy fotos_storage_admin_subir on storage.objects
 for insert to authenticated with check (bucket_id = 'fotos' and public.es_admin());
create policy fotos_storage_admin_modificar on storage.objects
 for update to authenticated using (bucket_id = 'fotos' and public.es_admin())
 with check (bucket_id = 'fotos' and public.es_admin());
create policy fotos_storage_admin_borrar on storage.objects
 for delete to authenticated using (bucket_id = 'fotos' and public.es_admin());

create or replace function public.preparar_admin_estudio()
returns trigger language plpgsql security definer
set search_path to public, pg_temp
as $$
begin
 if new.email is null or lower(new.email) <> 'henro89@gmail.com' then
  raise exception 'Solo la cuenta del estudio puede registrarse';
 end if;
 new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
 return new;
end;
$$;
revoke execute on function public.preparar_admin_estudio() from public, anon, authenticated;
grant execute on function public.preparar_admin_estudio() to service_role;
create trigger preparar_admin_estudio before insert on auth.users
 for each row execute function public.preparar_admin_estudio();


-- Bucket público de referencias del cotizador (migración referencias_bucket_public_upload).
-- Anon puede INSERT en pedidos/{uuid}/{1-5}.webp|jpg|png; sin update/delete/list.
-- Lectura pública solo por URL directa. Admin (es_admin) puede SELECT y DELETE.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('referencias','referencias',true,8388608,array['image/webp','image/jpeg','image/png','image/gif','image/avif']);
