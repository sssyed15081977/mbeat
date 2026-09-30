-- Shared storage bucket for post photos across post types (first user: the
-- deceased's photo on death_announcement). Public bucket so published posts'
-- photos are viewable without auth; uploads are scoped to the uploader's own
-- folder (post-photos/<user_id>/...), not to the post itself, keeping the
-- RLS check simple regardless of which post type is uploading.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "post-photos: authenticated users upload to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "post-photos: owners can replace their own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "post-photos: owners can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
