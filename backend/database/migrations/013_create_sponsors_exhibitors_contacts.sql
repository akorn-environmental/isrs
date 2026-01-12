-- Migration 013: Sponsors, Exhibitors, Contacts, and Relationship Tracking
-- Supports tracking people/orgs with multiple roles across conferences

-- Sponsor tiers and packages
CREATE TABLE IF NOT EXISTS conference_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  organization_name VARCHAR(255) NOT NULL, -- In case org not in system yet

  -- Sponsor Level
  sponsor_level VARCHAR(50) NOT NULL, -- 'platinum', 'gold', 'silver', 'bronze', 'supporter', 'in_kind'
  sponsorship_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Contact Info
  primary_contact_id UUID REFERENCES attendee_profiles(id),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Benefits & Details
  benefits TEXT[], -- Array of benefits they get
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  booth_number VARCHAR(50), -- If they also have a booth

  -- Display
  display_on_website BOOLEAN DEFAULT TRUE,
  display_order INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'paid', 'cancelled'
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_date DATE,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_date DATE,

  -- Metadata
  internal_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exhibitors (booth/table at conference)
CREATE TABLE IF NOT EXISTS conference_exhibitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  organization_name VARCHAR(255) NOT NULL,

  -- Booth Details
  booth_number VARCHAR(50),
  booth_type VARCHAR(50), -- 'standard', 'premium', 'corner', 'island'
  booth_size VARCHAR(50), -- '10x10', '10x20', etc.
  booth_location TEXT,

  -- Contact Info
  primary_contact_id UUID REFERENCES attendee_profiles(id),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Exhibitor Details
  exhibitor_category VARCHAR(100), -- 'equipment', 'services', 'research', 'nonprofit', etc.
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  products_services TEXT,

  -- Staff/Representatives
  staff_count INTEGER DEFAULT 1,
  staff_names TEXT[], -- Names of people staffing the booth

  -- Payment
  booth_fee DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_date DATE,

  -- Special Needs
  electrical_outlet BOOLEAN DEFAULT FALSE,
  internet_needed BOOLEAN DEFAULT FALSE,
  special_requirements TEXT,

  -- Display
  display_on_website BOOLEAN DEFAULT TRUE,
  display_order INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact Form Submissions (inquiries, interest forms)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id), -- NULL if general inquiry

  -- Contact Info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(255),
  position VARCHAR(255),
  country VARCHAR(100),

  -- Inquiry Details
  inquiry_type VARCHAR(50), -- 'general', 'sponsorship', 'exhibition', 'speaking', 'registration', 'other'
  subject VARCHAR(255),
  message TEXT NOT NULL,

  -- Interests
  interested_in_sponsoring BOOLEAN DEFAULT FALSE,
  interested_in_exhibiting BOOLEAN DEFAULT FALSE,
  interested_in_presenting BOOLEAN DEFAULT FALSE,
  interested_in_attending BOOLEAN DEFAULT FALSE,
  interested_in_volunteering BOOLEAN DEFAULT FALSE,

  -- Follow-up
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'in_progress', 'responded', 'resolved', 'spam'
  assigned_to VARCHAR(255), -- Staff member handling
  responded_at TIMESTAMP,
  resolved_at TIMESTAMP,
  internal_notes TEXT,

  -- Source
  source VARCHAR(100), -- 'website', 'email', 'social_media', 'referral'
  referrer TEXT,

  -- Metadata
  ip_address VARCHAR(50),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Person Roles (track all roles a person has across conferences)
CREATE TABLE IF NOT EXISTS person_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES attendee_profiles(id) NOT NULL,
  conference_id UUID REFERENCES conference_editions(id), -- NULL if role is organization-wide

  -- Role
  role_type VARCHAR(50) NOT NULL,
  -- 'attendee', 'presenter', 'keynote_speaker', 'session_chair', 'moderator',
  -- 'reviewer', 'committee_member', 'board_member', 'advisory_panel',
  -- 'volunteer', 'organizer', 'sponsor_contact', 'exhibitor_rep', 'funder_rep'

  role_details TEXT,

  -- Related Entities
  organization_id UUID REFERENCES organizations(id), -- If role is on behalf of an org
  committee_id UUID REFERENCES committees(id), -- If committee role

  -- Dates
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Organization Roles (track org roles across conferences)
CREATE TABLE IF NOT EXISTS organization_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  conference_id UUID REFERENCES conference_editions(id), -- NULL if ongoing relationship

  -- Role
  role_type VARCHAR(50) NOT NULL,
  -- 'sponsor', 'exhibitor', 'partner', 'funder', 'venue', 'vendor',
  -- 'media_partner', 'supporting_organization', 'affiliated_society'

  role_details TEXT,

  -- Relationship Strength
  relationship_level VARCHAR(50), -- 'platinum', 'gold', 'silver', 'bronze', 'standard'

  -- Dates
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsors_conference ON conference_sponsors(conference_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_org ON conference_sponsors(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_level ON conference_sponsors(sponsor_level);
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON conference_sponsors(status);

CREATE INDEX IF NOT EXISTS idx_exhibitors_conference ON conference_exhibitors(conference_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_org ON conference_exhibitors(organization_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_status ON conference_exhibitors(status);

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON contact_inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_conference ON contact_inquiries(conference_id);

CREATE INDEX IF NOT EXISTS idx_person_roles_person ON person_roles(person_id);
CREATE INDEX IF NOT EXISTS idx_person_roles_conference ON person_roles(conference_id);
CREATE INDEX IF NOT EXISTS idx_person_roles_type ON person_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_person_roles_active ON person_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_org_roles_org ON organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_conference ON organization_roles(conference_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_type ON organization_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_org_roles_active ON organization_roles(is_active);

COMMENT ON TABLE conference_sponsors IS 'Tracks sponsor packages and benefits per conference';
COMMENT ON TABLE conference_exhibitors IS 'Tracks exhibitor booths and details per conference';
COMMENT ON TABLE contact_inquiries IS 'Contact form submissions and general inquiries';
COMMENT ON TABLE person_roles IS 'Tracks all roles a person has across conferences (attendee, presenter, sponsor contact, etc.)';
COMMENT ON TABLE organization_roles IS 'Tracks all roles an organization has across conferences (sponsor, exhibitor, partner, etc.)';
