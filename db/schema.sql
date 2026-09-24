CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('PLATFORM_ADMIN','FIRM_ADMIN','PREPARER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE account_status AS ENUM ('ACTIVE','SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE client_type AS ENUM ('INDIVIDUAL','BUSINESS'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $tag$ BEGIN CREATE TYPE workspace_status AS ENUM ('NOT_STARTED','COLLECTING','MISSING_ITEMS','READY_FOR_PREPARATION','IN_PREPARATION','ADDITIONAL_INFO_REQUESTED','READY_TO_FILE','FILED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $tag$;
DO $tag$ BEGIN CREATE TYPE checklist_status AS ENUM ('EXPECTED','RECEIVED','NOT_APPLICABLE','REQUESTED','REVIEW_REQUIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $tag$;
DO $$ BEGIN CREATE TYPE invite_status AS ENUM ('PENDING','OPENED','COMPLETED','EXPIRED','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $tag$ BEGIN CREATE TYPE document_review_status AS ENUM ('AUTO_MATCHED','REVIEW_REQUIRED','CONFIRMED','REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $tag$;

CREATE TABLE IF NOT EXISTS firms(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,slug text NOT NULL UNIQUE,logo_url text,contact_email text,dek_ciphertext bytea,dek_key_id text,dek_destroyed_at timestamptz,status account_status NOT NULL DEFAULT 'ACTIVE',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),firm_id uuid REFERENCES firms(id) ON DELETE CASCADE,email text NOT NULL UNIQUE,name text NOT NULL,role user_role NOT NULL,password_hash text,totp_secret_enc text,totp_last_counter integer,failed_login_count integer NOT NULL DEFAULT 0,locked_until timestamptz,status account_status NOT NULL DEFAULT 'ACTIVE',last_login_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS clients(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),firm_id uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,type client_type NOT NULL,display_name text NOT NULL,primary_email text NOT NULL,phone text,external_id text,assigned_staff_user_id uuid REFERENCES users(id) ON DELETE SET NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS workspaces(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),firm_id uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,tax_year integer NOT NULL,client_type client_type NOT NULL,status workspace_status NOT NULL DEFAULT 'NOT_STARTED',price_cents integer NOT NULL,activated_at timestamptz,assigned_staff_user_id uuid REFERENCES users(id) ON DELETE SET NULL,ready_at timestamptz,filed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),CONSTRAINT workspace_client_year_uq UNIQUE(client_id,tax_year));
CREATE TABLE IF NOT EXISTS checklist_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,key text NOT NULL,label text NOT NULL,expected_document_type text,status checklist_status NOT NULL DEFAULT 'EXPECTED',requested_at text,received_document_id uuid,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS documents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,storage_key text NOT NULL,original_file_name text NOT NULL,display_name text NOT NULL,mime_type text NOT NULL,encrypted_size_bytes integer,sha256 text,document_type text NOT NULL DEFAULT 'OTHER',tax_year integer,issuer text,confidence real,review_status document_review_status NOT NULL DEFAULT 'REVIEW_REQUIRED',wrong_year_flag boolean NOT NULL DEFAULT false,encryption_iv bytea,encryption_tag bytea,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS invites(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,email text NOT NULL,token_hash text NOT NULL,status invite_status NOT NULL DEFAULT 'PENDING',expires_at timestamptz NOT NULL,opened_at timestamptz,completed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS document_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,checklist_item_id uuid REFERENCES checklist_items(id) ON DELETE SET NULL,requested_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,message text,sent_at timestamptz NOT NULL DEFAULT now(),fulfilled_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),firm_id uuid REFERENCES firms(id) ON DELETE SET NULL,actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,workspace_id uuid,action text NOT NULL,target_type text,target_id uuid,metadata jsonb,created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS clients_firm_idx ON clients(firm_id);
CREATE INDEX IF NOT EXISTS workspaces_firm_year_idx ON workspaces(firm_id,tax_year);
CREATE INDEX IF NOT EXISTS documents_workspace_idx ON documents(workspace_id);

CREATE TABLE IF NOT EXISTS staff_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,token_hash text NOT NULL UNIQUE,totp_verified_at timestamptz,totp_failures integer NOT NULL DEFAULT 0,expires_at timestamptz NOT NULL,absolute_expires_at timestamptz NOT NULL,last_seen_at timestamptz NOT NULL DEFAULT now(),ip text,user_agent text,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS staff_sessions_user_idx ON staff_sessions(user_id);
CREATE INDEX IF NOT EXISTS staff_sessions_expiry_idx ON staff_sessions(expires_at);
CREATE TABLE IF NOT EXISTS login_attempts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),identifier text NOT NULL,ip text,succeeded boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS login_attempts_identifier_idx ON login_attempts(identifier,created_at);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_last_counter integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE staff_sessions ADD COLUMN IF NOT EXISTS totp_failures integer NOT NULL DEFAULT 0;


CREATE TABLE IF NOT EXISTS staff_invites(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 firm_id uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
 email text NOT NULL,
 role user_role NOT NULL DEFAULT 'PREPARER',
 token_hash text NOT NULL UNIQUE,
 status invite_status NOT NULL DEFAULT 'PENDING',
 expires_at timestamptz NOT NULL,
 invited_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
 completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS staff_invites_firm_idx ON staff_invites(firm_id);
CREATE INDEX IF NOT EXISTS staff_invites_email_idx ON staff_invites(email);


-- Bring enum values from early TaxBox builds forward without destructive migrations.
DO $$ BEGIN
  ALTER TYPE workspace_status ADD VALUE IF NOT EXISTS 'COLLECTING';
  ALTER TYPE checklist_status ADD VALUE IF NOT EXISTS 'NOT_APPLICABLE';
  ALTER TYPE checklist_status ADD VALUE IF NOT EXISTS 'REVIEW_REQUIRED';
  ALTER TYPE document_review_status ADD VALUE IF NOT EXISTS 'AUTO_MATCHED';
  ALTER TYPE document_review_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
END $$;
