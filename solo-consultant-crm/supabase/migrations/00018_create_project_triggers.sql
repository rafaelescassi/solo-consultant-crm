CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create 7 phases when a project is inserted
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
DECLARE
  phase_names text[] := ARRAY['Research', 'Planning', 'Design', 'Frontend', 'Backend', 'Testing', 'Deployment'];
  i integer;
BEGIN
  FOR i IN 1..7 LOOP
    INSERT INTO project_phases (project_id, phase_number, phase_name)
    VALUES (NEW.id, i, phase_names[i]);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();
