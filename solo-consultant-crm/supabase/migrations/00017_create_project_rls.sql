-- ═══ PROJECTS ═══
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can create projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Client can view their projects"
  ON projects FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE portal_user_id = auth.uid())
  );

-- ═══ PROJECT PHASES ═══
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project phases"
  ON project_phases FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can update project phases"
  ON project_phases FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view their project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

-- ═══ PROJECT COMMENTS ═══
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project comments"
  ON project_comments FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project comments"
  ON project_comments FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete project comments"
  ON project_comments FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible comments"
  ON project_comments FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

-- ═══ PROJECT DELIVERABLES ═══
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project deliverables"
  ON project_deliverables FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can upload deliverables"
  ON project_deliverables FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete deliverables"
  ON project_deliverables FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible deliverables"
  ON project_deliverables FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );
