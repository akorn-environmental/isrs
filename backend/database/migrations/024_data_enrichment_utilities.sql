-- Migration: Data Enrichment Utilities
-- Description: Add utilities for parsing emails and enriching contact/organization data
-- Created: 2025-01-21

-- =====================================================
-- EMAIL PARSING AND DATA ENRICHMENT FUNCTIONS
-- =====================================================

-- Function to extract potential first/last name from email local part
CREATE OR REPLACE FUNCTION parse_email_name(email_address TEXT)
RETURNS TABLE(first_name TEXT, last_name TEXT) AS $$
DECLARE
  local_part TEXT;
  parts TEXT[];
BEGIN
  -- Extract local part (before @)
  local_part := split_part(lower(email_address), '@', 1);

  -- Handle firstname.lastname pattern
  IF position('.' IN local_part) > 0 THEN
    parts := string_to_array(local_part, '.');
    IF array_length(parts, 1) >= 2 THEN
      first_name := initcap(parts[1]);
      last_name := initcap(parts[2]);
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Handle firstname_lastname pattern
  IF position('_' IN local_part) > 0 THEN
    parts := string_to_array(local_part, '_');
    IF array_length(parts, 1) >= 2 THEN
      first_name := initcap(parts[1]);
      last_name := initcap(parts[2]);
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- No recognizable pattern
  first_name := NULL;
  last_name := NULL;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to extract domain from email
CREATE OR REPLACE FUNCTION extract_email_domain(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN split_part(lower(email_address), '@', 2);
END;
$$ LANGUAGE plpgsql;

-- Function to generate organization name from domain
CREATE OR REPLACE FUNCTION domain_to_org_name(domain TEXT)
RETURNS TEXT AS $$
DECLARE
  domain_parts TEXT[];
  org_name TEXT;
BEGIN
  -- Known government domains
  IF domain = 'noaa.gov' THEN RETURN 'NOAA';
  ELSIF domain = 'usda.gov' THEN RETURN 'USDA';
  ELSIF domain = 'doi.gov' THEN RETURN 'Department of Interior';
  ELSIF domain = 'epa.gov' THEN RETURN 'EPA';
  ELSIF domain = 'nmfs.noaa.gov' THEN RETURN 'NMFS';
  ELSIF domain = 'fws.gov' THEN RETURN 'US Fish and Wildlife Service';
  END IF;

  -- Skip personal email domains
  IF domain IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com') THEN
    RETURN NULL;
  END IF;

  -- Parse organization from domain
  domain_parts := string_to_array(domain, '.');

  -- Get the second-to-last part (usually the organization name)
  IF array_length(domain_parts, 1) >= 2 THEN
    org_name := initcap(domain_parts[array_length(domain_parts, 1) - 1]);
    RETURN org_name;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate organization website from domain
CREATE OR REPLACE FUNCTION domain_to_website(domain TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Known mappings
  IF domain = 'noaa.gov' THEN RETURN 'https://www.noaa.gov';
  ELSIF domain = 'usda.gov' THEN RETURN 'https://www.usda.gov';
  ELSIF domain = 'doi.gov' THEN RETURN 'https://www.doi.gov';
  ELSIF domain = 'epa.gov' THEN RETURN 'https://www.epa.gov';
  END IF;

  -- Skip personal email domains
  IF domain IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com') THEN
    RETURN NULL;
  END IF;

  -- Generate likely website
  RETURN 'https://' || domain;
END;
$$ LANGUAGE plpgsql;

-- Function to determine organization type from domain
CREATE OR REPLACE FUNCTION domain_to_org_type(domain TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Government domains
  IF domain LIKE '%.gov' THEN RETURN 'Government';
  -- Educational domains
  ELSIF domain LIKE '%.edu' THEN RETURN 'University';
  -- Organization domains
  ELSIF domain LIKE '%.org' THEN RETURN 'Non-Profit';
  -- International domains
  ELSIF domain LIKE '%.ac.%' THEN RETURN 'University';
  -- Default
  ELSE RETURN 'Organization';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Force lowercase emails on insert/update
-- =====================================================

CREATE OR REPLACE FUNCTION lowercase_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to contacts table
DROP TRIGGER IF EXISTS lowercase_contacts_email ON contacts;
CREATE TRIGGER lowercase_contacts_email
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION lowercase_email();

-- =====================================================
-- ADD organization_name COLUMN (if not exists)
-- For backward compatibility with frontend
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN organization_name VARCHAR(255);
    COMMENT ON COLUMN contacts.organization_name IS 'Deprecated: Use organization_id with JOIN instead';
  END IF;
END $$;

-- =====================================================
-- VIEWS FOR DATA QUALITY ANALYSIS
-- =====================================================

-- Contacts missing names
CREATE OR REPLACE VIEW contacts_missing_names AS
SELECT
  id,
  email,
  first_name,
  last_name,
  full_name,
  organization_id
FROM contacts
WHERE (first_name IS NULL OR first_name = '')
   OR (last_name IS NULL OR last_name = '');

-- Contacts without organizations
CREATE OR REPLACE VIEW contacts_without_organizations AS
SELECT
  id,
  email,
  first_name,
  last_name,
  full_name,
  organization_id,
  organization_name
FROM contacts
WHERE organization_id IS NULL;

-- Organizations without websites
CREATE OR REPLACE VIEW organizations_missing_websites AS
SELECT
  id,
  name,
  type,
  country,
  website
FROM organizations
WHERE website IS NULL OR website = '';

-- =====================================================
-- DATA QUALITY REPORT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_data_quality_report()
RETURNS TABLE(
  metric_name TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_contacts BIGINT;
  total_orgs BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_contacts FROM contacts;
  SELECT COUNT(*) INTO total_orgs FROM organizations;

  -- Contacts missing first names
  RETURN QUERY
  SELECT
    'Contacts Missing First Name'::TEXT,
    COUNT(*),
    ROUND((COUNT(*) * 100.0 / NULLIF(total_contacts, 0)), 2)
  FROM contacts
  WHERE first_name IS NULL OR first_name = '';

  -- Contacts missing last names
  RETURN QUERY
  SELECT
    'Contacts Missing Last Name'::TEXT,
    COUNT(*),
    ROUND((COUNT(*) * 100.0 / NULLIF(total_contacts, 0)), 2)
  FROM contacts
  WHERE last_name IS NULL OR last_name = '';

  -- Contacts without organizations
  RETURN QUERY
  SELECT
    'Contacts Without Organizations'::TEXT,
    COUNT(*),
    ROUND((COUNT(*) * 100.0 / NULLIF(total_contacts, 0)), 2)
  FROM contacts
  WHERE organization_id IS NULL;

  -- Organizations without websites
  RETURN QUERY
  SELECT
    'Organizations Missing Websites'::TEXT,
    COUNT(*),
    ROUND((COUNT(*) * 100.0 / NULLIF(total_orgs, 0)), 2)
  FROM organizations
  WHERE website IS NULL OR website = '';

  -- Emails with uppercase characters
  RETURN QUERY
  SELECT
    'Contacts with Uppercase in Email'::TEXT,
    COUNT(*),
    ROUND((COUNT(*) * 100.0 / NULLIF(total_contacts, 0)), 2)
  FROM contacts
  WHERE email != lower(email);

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contacts_organization_name ON contacts(organization_name);
CREATE INDEX IF NOT EXISTS idx_contacts_lowercase_email ON contacts(lower(email));
CREATE INDEX IF NOT EXISTS idx_organizations_lowercase_name ON organizations(lower(name));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION parse_email_name IS 'Extracts potential first/last name from email local part';
COMMENT ON FUNCTION extract_email_domain IS 'Extracts domain from email address';
COMMENT ON FUNCTION domain_to_org_name IS 'Generates organization name from email domain';
COMMENT ON FUNCTION domain_to_website IS 'Generates likely website URL from domain';
COMMENT ON FUNCTION domain_to_org_type IS 'Determines organization type from domain';
COMMENT ON FUNCTION lowercase_email IS 'Trigger function to force lowercase emails';
COMMENT ON FUNCTION generate_data_quality_report IS 'Generates comprehensive data quality metrics';
