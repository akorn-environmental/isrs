-- Migration 040: Create Comprehensive RBAC (Role-Based Access Control) System
-- Replaces hardcoded admin users with database-driven role and permission system
-- Supports multiple stacking roles per user with temporal permissions

-- ============================================================================
-- PART 1: Core RBAC Tables
-- ============================================================================

-- Roles table: Defines all system roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,

  -- Role hierarchy and permissions
  permission_level INTEGER NOT NULL DEFAULT 0, -- Higher = more permissions (0-100)
  is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted
  is_temporal BOOLEAN DEFAULT FALSE, -- Role has time limits (e.g., conference roles)

  -- Role category for organization
  category VARCHAR(50) NOT NULL, -- 'system', 'board', 'conference', 'member', 'sponsor'

  -- Role-specific settings
  settings JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table: Defines granular permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,

  -- Permission categorization
  resource VARCHAR(100) NOT NULL, -- 'users', 'conferences', 'finances', 'content', etc.
  action VARCHAR(50) NOT NULL, -- 'view', 'create', 'edit', 'delete', 'manage'

  -- Permission scope
  scope VARCHAR(50) DEFAULT 'all', -- 'all', 'own', 'department', 'organization'

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(resource, action, scope)
);

-- Role-Permission mapping (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,

  -- Can override permission scope per role
  scope_override VARCHAR(50),

  granted_at TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (role_id, permission_id)
);

-- User-Role mapping (many-to-many with temporal support)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,

  -- Role status
  is_active BOOLEAN DEFAULT TRUE,

  -- Temporal permissions (for conference-specific roles)
  active_from TIMESTAMP,
  active_until TIMESTAMP,
  conference_year INTEGER, -- If this is a conference-specific role
  conference_id UUID REFERENCES conference_editions(id) ON DELETE SET NULL,

  -- Assignment metadata
  granted_by UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL,
  granted_reason TEXT,
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL,
  revoked_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, role_id, conference_id)
);

-- Achievement badges for gamification
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,

  badge_type VARCHAR(100) NOT NULL, -- 'conference_presenter', '5_year_attendee', etc.
  badge_name VARCHAR(150) NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,

  -- Badge metadata
  earned_at TIMESTAMP DEFAULT NOW(),
  conference_year INTEGER,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 2: Enhanced Session Management for RBAC
-- ============================================================================

-- Add user_id reference to sessions (in addition to attendee_id for backwards compat)
ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS roles_snapshot JSONB, -- Snapshot of active roles at session creation
ADD COLUMN IF NOT EXISTS permissions_snapshot JSONB; -- Cached permissions for performance

-- Create table for session activity log (security audit trail)
CREATE TABLE IF NOT EXISTS session_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE,

  activity_type VARCHAR(50) NOT NULL, -- 'login', 'permission_check', 'role_change', 'logout'
  resource_accessed VARCHAR(100),
  action_attempted VARCHAR(50),
  permission_granted BOOLEAN,

  -- Security metadata
  ip_address VARCHAR(50),
  user_agent TEXT,
  request_path TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 3: Seed System Roles
-- ============================================================================

INSERT INTO roles (name, display_name, description, permission_level, is_system_role, category, settings) VALUES
-- System Administration
('super_admin', 'Super Administrator', 'Full system access - ISRS staff only', 100, TRUE, 'system', '{"dashboard": "super_admin"}'::jsonb),
('developer', 'System Developer', 'Technical administration and development access', 95, TRUE, 'system', '{"dashboard": "developer"}'::jsonb),

-- Board Officers (governance hierarchy)
('board_president', 'Board President', 'ISRS Board President - highest governance authority', 90, TRUE, 'board', '{"dashboard": "board_officer", "can_override_votes": true}'::jsonb),
('board_vice_president', 'Board Vice President', 'ISRS Board Vice President', 85, TRUE, 'board', '{"dashboard": "board_officer"}'::jsonb),
('board_secretary', 'Board Secretary', 'ISRS Board Secretary - manages board records', 85, TRUE, 'board', '{"dashboard": "board_officer", "manages_minutes": true}'::jsonb),
('board_treasurer', 'Board Treasurer', 'ISRS Board Treasurer - manages finances', 85, TRUE, 'board', '{"dashboard": "board_officer", "manages_finances": true}'::jsonb),

-- Board & Committees
('board_member', 'Board Member', 'ISRS Board of Directors member', 80, TRUE, 'board', '{"dashboard": "board_member"}'::jsonb),
('advisory_panel', 'Advisory Panel Member', 'Limited admin access for abstracts and funding', 70, TRUE, 'board', '{"dashboard": "advisory"}'::jsonb),

-- General Membership
('member', 'General Member', 'Active ISRS member with base access', 50, TRUE, 'member', '{"dashboard": "member"}'::jsonb),
('member_past', 'Past Member', 'Former member with limited access', 30, TRUE, 'member', '{"dashboard": "member"}'::jsonb),

-- Conference-Specific Roles (temporal)
('conference_attendee', 'Conference Attendee', 'Registered conference attendee', 40, TRUE, 'conference', '{"dashboard": "conference", "is_temporal": true}'::jsonb),
('conference_presenter', 'Conference Presenter', 'Oral presentation speaker', 45, TRUE, 'conference', '{"dashboard": "conference", "is_temporal": true}'::jsonb),
('poster_presenter', 'Poster Presenter', 'Poster presentation presenter', 45, TRUE, 'conference', '{"dashboard": "conference", "is_temporal": true}'::jsonb),
('conference_student', 'Student Attendee', 'Student conference participant', 40, TRUE, 'conference', '{"dashboard": "conference", "is_temporal": true}'::jsonb),
('field_trip_organizer', 'Field Trip Organizer', 'Temporal event admin for field trips', 60, TRUE, 'conference', '{"dashboard": "event_admin", "is_temporal": true}'::jsonb),
('special_event_coordinator', 'Special Event Coordinator', 'Temporal event admin for special events', 60, TRUE, 'conference', '{"dashboard": "event_admin", "is_temporal": true}'::jsonb),

-- Sponsors & Exhibitors
('sponsor', 'Sponsor/Funder', 'Organization sponsor with analytics access', 55, TRUE, 'sponsor', '{"dashboard": "sponsor", "analytics_access": true}'::jsonb),
('exhibitor', 'Exhibitor', 'Conference exhibitor with booth management', 50, TRUE, 'sponsor', '{"dashboard": "exhibitor"}'::jsonb)

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  permission_level = EXCLUDED.permission_level,
  category = EXCLUDED.category,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- ============================================================================
-- PART 4: Seed Permissions (64 granular permissions across 8 feature areas)
-- ============================================================================

-- USER MANAGEMENT PERMISSIONS
INSERT INTO permissions (name, display_name, description, resource, action, scope) VALUES
('users.view.all', 'View All Users', 'View all user profiles and data', 'users', 'view', 'all'),
('users.view.own', 'View Own Profile', 'View own user profile', 'users', 'view', 'own'),
('users.edit.all', 'Edit All Users', 'Edit any user profile', 'users', 'edit', 'all'),
('users.edit.own', 'Edit Own Profile', 'Edit own user profile', 'users', 'edit', 'own'),
('users.delete.all', 'Delete Users', 'Delete user accounts', 'users', 'delete', 'all'),
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create', 'all'),
('users.manage_roles', 'Manage User Roles', 'Assign and revoke user roles', 'users', 'manage', 'all'),
('users.export_data', 'Export User Data', 'Export user data (GDPR)', 'users', 'export', 'all'),

-- FINANCIAL PERMISSIONS
('finances.view.summary', 'View Financial Summary', 'View financial overview and reports', 'finances', 'view', 'all'),
('finances.view.detailed', 'View Detailed Finances', 'View detailed financial records', 'finances', 'view', 'all'),
('finances.edit', 'Edit Finances', 'Edit financial records', 'finances', 'edit', 'all'),
('finances.approve_expenses', 'Approve Expenses', 'Approve expense requests', 'finances', 'approve', 'all'),
('finances.manage_budget', 'Manage Budget', 'Manage organizational budget', 'finances', 'manage', 'all'),

-- CONTENT MANAGEMENT PERMISSIONS
('content.view', 'View Content', 'View website content', 'content', 'view', 'all'),
('content.create', 'Create Content', 'Create new content', 'content', 'create', 'all'),
('content.edit.all', 'Edit All Content', 'Edit any content', 'content', 'edit', 'all'),
('content.edit.own', 'Edit Own Content', 'Edit own content', 'content', 'edit', 'own'),
('content.delete', 'Delete Content', 'Delete content', 'content', 'delete', 'all'),
('content.publish', 'Publish Content', 'Publish content to website', 'content', 'publish', 'all'),

-- BOARD & GOVERNANCE PERMISSIONS
('board.view_documents', 'View Board Documents', 'Access board meeting documents', 'board', 'view', 'all'),
('board.edit_documents', 'Edit Board Documents', 'Edit board documents', 'board', 'edit', 'all'),
('board.manage_meetings', 'Manage Board Meetings', 'Schedule and manage board meetings', 'board', 'manage', 'all'),
('board.vote', 'Vote on Board Matters', 'Participate in board votes', 'board', 'vote', 'all'),
('board.view_minutes', 'View Meeting Minutes', 'Access board meeting minutes', 'board', 'view', 'all'),
('board.edit_minutes', 'Edit Meeting Minutes', 'Edit board meeting minutes', 'board', 'edit', 'all'),

-- CONFERENCE MANAGEMENT PERMISSIONS
('conference.view.all', 'View All Conferences', 'View all conference data', 'conference', 'view', 'all'),
('conference.view.registered', 'View Registered Conferences', 'View conferences user is registered for', 'conference', 'view', 'own'),
('conference.manage', 'Manage Conferences', 'Full conference management access', 'conference', 'manage', 'all'),
('conference.edit_schedule', 'Edit Conference Schedule', 'Modify conference schedule', 'conference', 'edit', 'all'),
('conference.view_attendees', 'View Conference Attendees', 'View attendee list', 'conference', 'view', 'all'),
('conference.manage_registrations', 'Manage Registrations', 'Manage conference registrations', 'conference', 'manage', 'all'),
('conference.manage_abstracts', 'Manage Abstract Submissions', 'Review and manage abstracts', 'conference', 'manage', 'all'),
('conference.submit_abstract', 'Submit Abstract', 'Submit conference abstract', 'conference', 'create', 'own'),

-- FUNDING MANAGEMENT PERMISSIONS
('funding.view.all', 'View All Funding', 'View all funding opportunities and grants', 'funding', 'view', 'all'),
('funding.view.own', 'View Own Funding', 'View own funding applications', 'funding', 'view', 'own'),
('funding.create', 'Create Funding Opportunities', 'Create funding opportunities', 'funding', 'create', 'all'),
('funding.edit', 'Edit Funding', 'Edit funding opportunities', 'funding', 'edit', 'all'),
('funding.review_applications', 'Review Funding Applications', 'Review and approve funding applications', 'funding', 'review', 'all'),
('funding.apply', 'Apply for Funding', 'Submit funding applications', 'funding', 'apply', 'own'),

-- ANALYTICS & REPORTING PERMISSIONS
('analytics.view.basic', 'View Basic Analytics', 'View basic analytics and reports', 'analytics', 'view', 'all'),
('analytics.view.advanced', 'View Advanced Analytics', 'View detailed analytics and insights', 'analytics', 'view', 'all'),
('analytics.export', 'Export Analytics', 'Export analytics data', 'analytics', 'export', 'all'),
('analytics.view.sponsor', 'View Sponsor Analytics', 'View sponsor-specific analytics', 'analytics', 'view', 'sponsor'),

-- SELF-SERVICE PERMISSIONS
('profile.edit.own', 'Edit Own Profile', 'Edit personal profile', 'profile', 'edit', 'own'),
('profile.export.own', 'Export Own Data', 'Export personal data', 'profile', 'export', 'own'),
('profile.delete.own', 'Delete Own Account', 'Request account deletion', 'profile', 'delete', 'own'),
('directory.opt_in', 'Opt Into Directory', 'Manage directory visibility', 'directory', 'manage', 'own'),
('directory.view', 'View Member Directory', 'View public member directory', 'directory', 'view', 'all'),
('events.register', 'Register for Events', 'Register for conferences and events', 'events', 'register', 'own'),
('events.manage.own', 'Manage Own Event Registrations', 'Manage personal event registrations', 'events', 'manage', 'own'),

-- SYSTEM PERMISSIONS
('system.view_logs', 'View System Logs', 'Access system activity logs', 'system', 'view', 'all'),
('system.manage_settings', 'Manage System Settings', 'Modify system configuration', 'system', 'manage', 'all'),
('system.manage_integrations', 'Manage Integrations', 'Configure third-party integrations', 'system', 'manage', 'all')

ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- PART 5: Assign Permissions to Roles
-- ============================================================================

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Board President: All except system management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'board_president'
  AND p.resource != 'system'
ON CONFLICT DO NOTHING;

-- Board Officers (VP, Secretary, Treasurer): Board + Conference + Content
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('board_vice_president', 'board_secretary', 'board_treasurer')
  AND p.resource IN ('board', 'conference', 'content', 'users', 'analytics')
  AND p.action IN ('view', 'edit', 'manage')
ON CONFLICT DO NOTHING;

-- Treasurer: Full financial access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'board_treasurer'
  AND p.resource = 'finances'
ON CONFLICT DO NOTHING;

-- Board Members: View board docs, vote, view conferences/finances
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'board_member'
  AND (
    (p.resource = 'board' AND p.action IN ('view', 'vote'))
    OR (p.resource = 'conference' AND p.action = 'view')
    OR (p.resource = 'finances' AND p.name = 'finances.view.summary')
  )
ON CONFLICT DO NOTHING;

-- Advisory Panel: Abstract and funding management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'advisory_panel'
  AND (
    (p.resource = 'conference' AND p.name IN ('conference.manage_abstracts', 'conference.view.all'))
    OR (p.resource = 'funding' AND p.action IN ('view', 'review', 'create', 'edit'))
  )
ON CONFLICT DO NOTHING;

-- General Members: Self-service + directory + event registration
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'member'
  AND (
    p.scope = 'own'
    OR (p.resource = 'directory' AND p.action = 'view')
    OR (p.resource = 'events' AND p.action IN ('register', 'manage'))
    OR (p.resource = 'conference' AND p.name = 'conference.submit_abstract')
  )
ON CONFLICT DO NOTHING;

-- Conference Roles: Event-specific permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('conference_attendee', 'conference_presenter', 'poster_presenter', 'conference_student')
  AND (
    (p.resource = 'conference' AND p.name = 'conference.view.registered')
    OR (p.resource = 'events' AND p.scope = 'own')
    OR (p.resource = 'directory' AND p.action = 'view')
  )
ON CONFLICT DO NOTHING;

-- Sponsors: Analytics access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sponsor'
  AND (
    (p.resource = 'analytics' AND p.name IN ('analytics.view.sponsor', 'analytics.view.basic'))
    OR (p.resource = 'conference' AND p.action = 'view')
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 6: Migrate Existing Admin Users to RBAC
-- ============================================================================

-- Migrate existing admin_users to user_roles
INSERT INTO user_roles (user_id, role_id, is_active, granted_reason, created_at)
SELECT
  au.attendee_id,
  r.id,
  TRUE,
  'Migrated from legacy admin_users table',
  au.created_at
FROM admin_users au
JOIN roles r ON (
  CASE
    WHEN au.role = 'super_admin' THEN r.name = 'super_admin'
    WHEN au.role = 'admin' THEN r.name = 'board_member'
    ELSE r.name = 'member'
  END
)
WHERE au.attendee_id IS NOT NULL
ON CONFLICT (user_id, role_id, conference_id) DO NOTHING;

-- All admin users should also have 'member' role
INSERT INTO user_roles (user_id, role_id, is_active, granted_reason, created_at)
SELECT
  au.attendee_id,
  r.id,
  TRUE,
  'Base member role',
  au.created_at
FROM admin_users au
JOIN roles r ON r.name = 'member'
WHERE au.attendee_id IS NOT NULL
ON CONFLICT (user_id, role_id, conference_id) DO NOTHING;

-- ============================================================================
-- PART 7: Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);
CREATE INDEX IF NOT EXISTS idx_roles_permission_level ON roles(permission_level DESC);

CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_temporal ON user_roles(active_from, active_until) WHERE active_from IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_conference ON user_roles(conference_id) WHERE conference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);

CREATE INDEX IF NOT EXISTS idx_session_activity_user_id ON session_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_type ON session_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_session_activity_created ON session_activity_log(created_at DESC);

-- ============================================================================
-- PART 8: Helper Functions
-- ============================================================================

-- Function to get all active roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (
  role_id UUID,
  role_name VARCHAR,
  role_display_name VARCHAR,
  permission_level INTEGER,
  is_temporal BOOLEAN,
  active_until TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.display_name,
    r.permission_level,
    r.is_temporal,
    ur.active_until
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
    AND ur.is_active = TRUE
    AND (ur.active_from IS NULL OR ur.active_from <= NOW())
    AND (ur.active_until IS NULL OR ur.active_until >= NOW())
  ORDER BY r.permission_level DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all permissions for a user (flattened)
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE (
  permission_name VARCHAR,
  resource VARCHAR,
  action VARCHAR,
  scope VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.name,
    p.resource,
    p.action,
    COALESCE(rp.scope_override, p.scope) as scope
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = user_uuid
    AND ur.is_active = TRUE
    AND (ur.active_from IS NULL OR ur.active_from <= NOW())
    AND (ur.active_until IS NULL OR ur.active_until >= NOW())
  ORDER BY p.resource, p.action;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_uuid UUID,
  permission_to_check VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid
      AND ur.is_active = TRUE
      AND (ur.active_from IS NULL OR ur.active_from <= NOW())
      AND (ur.active_until IS NULL OR ur.active_until >= NOW())
      AND p.name = permission_to_check
  ) INTO has_perm;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql;

-- Function to get highest permission level for a user
CREATE OR REPLACE FUNCTION get_user_max_permission_level(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  max_level INTEGER;
BEGIN
  SELECT COALESCE(MAX(r.permission_level), 0) INTO max_level
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
    AND ur.is_active = TRUE
    AND (ur.active_from IS NULL OR ur.active_from <= NOW())
    AND (ur.active_until IS NULL OR ur.active_until >= NOW());

  RETURN max_level;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 9: Views for Easy Querying
-- ============================================================================

-- View of all users with their primary role
CREATE OR REPLACE VIEW user_primary_roles AS
SELECT
  ap.id as user_id,
  ap.user_email,
  ap.first_name,
  ap.last_name,
  ap.first_name || ' ' || ap.last_name as full_name,
  r.name as primary_role,
  r.display_name as primary_role_display,
  r.permission_level,
  r.category as role_category,
  ur.created_at as role_granted_at
FROM attendee_profiles ap
LEFT JOIN LATERAL (
  SELECT ur.role_id, ur.created_at
  FROM user_roles ur
  WHERE ur.user_id = ap.id
    AND ur.is_active = TRUE
    AND (ur.active_from IS NULL OR ur.active_from <= NOW())
    AND (ur.active_until IS NULL OR ur.active_until >= NOW())
  ORDER BY (
    SELECT r2.permission_level
    FROM roles r2
    WHERE r2.id = ur.role_id
  ) DESC
  LIMIT 1
) ur ON TRUE
LEFT JOIN roles r ON ur.role_id = r.id;

-- View of all active user-role assignments with details
CREATE OR REPLACE VIEW active_user_roles AS
SELECT
  ur.id,
  ur.user_id,
  ap.user_email,
  ap.first_name || ' ' || ap.last_name as user_name,
  ur.role_id,
  r.name as role_name,
  r.display_name as role_display_name,
  r.permission_level,
  r.category,
  r.is_temporal,
  ur.active_from,
  ur.active_until,
  ur.conference_year,
  ce.name as conference_name,
  ur.granted_by,
  granter.first_name || ' ' || granter.last_name as granted_by_name,
  ur.created_at
FROM user_roles ur
JOIN attendee_profiles ap ON ur.user_id = ap.id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN conference_editions ce ON ur.conference_id = ce.id
LEFT JOIN attendee_profiles granter ON ur.granted_by = granter.id
WHERE ur.is_active = TRUE
  AND (ur.active_from IS NULL OR ur.active_from <= NOW())
  AND (ur.active_until IS NULL OR ur.active_until >= NOW());

-- ============================================================================
-- PART 10: Comments
-- ============================================================================

COMMENT ON TABLE roles IS 'System roles with permission levels and settings (RBAC)';
COMMENT ON TABLE permissions IS 'Granular permissions for resource access control';
COMMENT ON TABLE role_permissions IS 'Many-to-many mapping of roles to permissions';
COMMENT ON TABLE user_roles IS 'User role assignments with temporal support for conference roles';
COMMENT ON TABLE user_badges IS 'Achievement badges for user gamification';
COMMENT ON TABLE session_activity_log IS 'Security audit log of session activities and permission checks';

COMMENT ON FUNCTION get_user_roles IS 'Returns all active roles for a user';
COMMENT ON FUNCTION get_user_permissions IS 'Returns flattened list of all permissions for a user';
COMMENT ON FUNCTION user_has_permission IS 'Checks if user has a specific permission';
COMMENT ON FUNCTION get_user_max_permission_level IS 'Returns highest permission level among user''s roles';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Display summary
SELECT '=== RBAC System Migration Complete ===' as status;
SELECT COUNT(*) as total_roles FROM roles;
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT COUNT(*) as total_role_permission_assignments FROM role_permissions;
SELECT COUNT(*) as total_user_role_assignments FROM user_roles;
SELECT COUNT(*) as migrated_admin_users FROM admin_users WHERE attendee_id IS NOT NULL;
