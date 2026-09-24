-- TaxBox tenant isolation baseline.
-- Run as the database owner via ADMIN_DATABASE_URL.
-- The application executes tenant queries with SET LOCAL ROLE app_firm.

DO $$ BEGIN
  CREATE ROLE app_firm NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT app_firm TO CURRENT_USER;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items FORCE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites FORCE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_firm_isolation ON clients;
CREATE POLICY clients_firm_isolation ON clients
  USING (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid)
  WITH CHECK (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid);

DROP POLICY IF EXISTS workspaces_firm_isolation ON workspaces;
CREATE POLICY workspaces_firm_isolation ON workspaces
  USING (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid)
  WITH CHECK (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid);

DROP POLICY IF EXISTS checklist_firm_isolation ON checklist_items;
CREATE POLICY checklist_firm_isolation ON checklist_items
  USING (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = checklist_items.workspace_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = checklist_items.workspace_id));

DROP POLICY IF EXISTS documents_firm_isolation ON documents;
CREATE POLICY documents_firm_isolation ON documents
  USING (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = documents.workspace_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = documents.workspace_id));

DROP POLICY IF EXISTS invites_firm_isolation ON invites;
CREATE POLICY invites_firm_isolation ON invites
  USING (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = invites.workspace_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = invites.workspace_id));

DROP POLICY IF EXISTS requests_firm_isolation ON document_requests;
CREATE POLICY requests_firm_isolation ON document_requests
  USING (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = document_requests.workspace_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces w WHERE w.id = document_requests.workspace_id));

DROP POLICY IF EXISTS audit_firm_isolation ON audit_events;
CREATE POLICY audit_firm_isolation ON audit_events
  USING (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid)
  WITH CHECK (firm_id = NULLIF(current_setting('app.firm_id', true), '')::uuid);

GRANT USAGE ON SCHEMA public TO app_firm;
GRANT SELECT, INSERT, UPDATE, DELETE ON clients, workspaces, checklist_items, documents, invites, document_requests TO app_firm;
GRANT SELECT, INSERT ON audit_events TO app_firm;
