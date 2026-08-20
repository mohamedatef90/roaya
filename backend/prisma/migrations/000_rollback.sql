-- =============================================================================
-- Roaya Lead Management System - ROLLBACK Migration
-- =============================================================================
-- Migration: 000_rollback
-- Version: 1.0.0
-- Database: PostgreSQL 16+
-- Created: 2026-01-21
--
-- WARNING: This script DESTROYS ALL DATA in the lead management system tables!
-- Only use this for:
--   - Development/testing reset
--   - Complete system reinstallation
--   - Disaster recovery (after restoring from backup)
--
-- This script does NOT:
--   - Backup your data (do that first!)
--   - Drop the database (only drops LMS tables)
--   - Affect other schemas or tables
-- =============================================================================

-- Safety check: Require explicit confirmation
DO $$
BEGIN
    -- Uncomment the line below to enable the rollback
    -- RAISE EXCEPTION 'ROLLBACK_CONFIRMED';

    RAISE EXCEPTION '
    ============================================================
    ROLLBACK SAFETY CHECK FAILED
    ============================================================
    This rollback script will DELETE ALL DATA in the lead
    management system tables.

    To proceed:
    1. Make sure you have a database backup
    2. Edit this file and uncomment the RAISE EXCEPTION line above
    3. Run the script again

    Tables that will be dropped:
    - refresh_tokens
    - lead_activities
    - email_notifications
    - lead_services
    - leads
    - admin_users
    - services
    - industries
    - lead_statuses
    - lead_sources

    Enums that will be dropped:
    - performer_type
    - activity_type
    - email_status
    - notification_type
    - lead_priority
    - admin_role
    ============================================================
    ';
END $$;

-- If you've confirmed, comment out the safety check above and run this:

BEGIN;

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS lead_activities CASCADE;
DROP TABLE IF EXISTS email_notifications CASCADE;
DROP TABLE IF EXISTS lead_services CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS lead_statuses CASCADE;
DROP TABLE IF EXISTS lead_sources CASCADE;

-- ============================================================================
-- DROP ENUMS
-- ============================================================================

DROP TYPE IF EXISTS performer_type CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS lead_priority CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'lead_sources', 'lead_statuses', 'industries', 'services',
          'admin_users', 'leads', 'lead_services', 'email_notifications',
          'lead_activities', 'refresh_tokens'
      );

    IF table_count > 0 THEN
        RAISE EXCEPTION 'Rollback incomplete: % lead management tables still exist', table_count;
    END IF;

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'ROLLBACK COMPLETE';
    RAISE NOTICE 'All lead management system tables have been dropped.';
    RAISE NOTICE 'Run 001_initial_schema.sql to recreate the schema.';
    RAISE NOTICE '============================================================';
END $$;

COMMIT;
