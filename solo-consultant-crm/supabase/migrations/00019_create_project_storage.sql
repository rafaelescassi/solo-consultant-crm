INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

CREATE POLICY "Admin can upload project deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can view project deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can delete project deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
