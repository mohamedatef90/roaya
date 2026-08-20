-- =============================================================================
-- Roaya Lead Management System - Seed Data
-- =============================================================================
-- Migration: 002_seed_data
-- Version: 1.0.0
-- Database: PostgreSQL 16+
-- Created: 2026-01-21
--
-- This script populates lookup tables with initial reference data.
-- Run this AFTER the initial schema migration (001_initial_schema.sql).
--
-- Tables seeded:
--   - lead_sources (3 records)
--   - lead_statuses (8 records)
--   - industries (10 records)
--   - services (9 records)
--   - admin_users (1 initial admin)
-- =============================================================================

BEGIN;

-- ============================================================================
-- LEAD SOURCES
-- The three main lead capture forms on the website
-- ============================================================================

INSERT INTO lead_sources (code, name, description, form_endpoint, is_active) VALUES
    ('contact', 'Contact Form',
     'General inquiry form on the contact page. Used for general questions, partnership inquiries, and support requests.',
     '/api/v1/leads/contact', TRUE),

    ('pricing_quote', 'Pricing Quote Request',
     'Pricing page quote request form. Captures service-specific pricing inquiries with company details.',
     '/api/v1/leads/pricing-quote', TRUE),

    ('roi_calculator', 'ROI Calculator',
     'ROI calculator lead capture form. Captures calculated results and contact info for follow-up.',
     '/api/v1/leads/roi-calculator', TRUE);

-- Verify: SELECT * FROM lead_sources;

-- ============================================================================
-- LEAD STATUSES
-- Pipeline stages with colors for UI and workflow logic
-- ============================================================================

INSERT INTO lead_statuses (code, name, description, color, is_terminal, is_active, sort_order) VALUES
    ('new', 'New',
     'Newly submitted lead, not yet reviewed by sales team. Requires initial qualification.',
     '#3B82F6', FALSE, TRUE, 1),  -- Blue

    ('contacted', 'Contacted',
     'Initial outreach has been made via email or phone. Awaiting response.',
     '#8B5CF6', FALSE, TRUE, 2),  -- Purple

    ('qualified', 'Qualified',
     'Lead meets qualification criteria: budget, authority, need, timeline (BANT).',
     '#10B981', FALSE, TRUE, 3),  -- Green

    ('proposal', 'Proposal Sent',
     'Formal proposal or quote has been sent to the prospect.',
     '#F59E0B', FALSE, TRUE, 4),  -- Amber

    ('negotiation', 'Negotiation',
     'Active negotiation on terms, pricing, or scope. High engagement.',
     '#EC4899', FALSE, TRUE, 5),  -- Pink

    ('won', 'Won',
     'Deal closed successfully. Customer has signed or confirmed.',
     '#059669', TRUE, TRUE, 6),   -- Dark Green (terminal)

    ('lost', 'Lost',
     'Deal lost or lead disqualified. Document reason in notes.',
     '#EF4444', TRUE, TRUE, 7),   -- Red (terminal)

    ('nurture', 'Nurture',
     'Not ready to buy now. Add to nurture campaign for future follow-up.',
     '#6B7280', FALSE, TRUE, 8);  -- Gray

-- Verify: SELECT * FROM lead_statuses ORDER BY sort_order;

-- ============================================================================
-- INDUSTRIES
-- Industry categories matching Saudi Arabia and MENA market focus
-- ============================================================================

INSERT INTO industries (code, name_en, name_ar, sort_order, is_active) VALUES
    ('healthcare', 'Healthcare & Medical', 'الرعاية الصحية والطبية', 1, TRUE),
    ('finance', 'Finance & Banking', 'المالية والمصارف', 2, TRUE),
    ('retail', 'Retail & E-commerce', 'التجزئة والتجارة الإلكترونية', 3, TRUE),
    ('manufacturing', 'Manufacturing & Industrial', 'التصنيع والصناعة', 4, TRUE),
    ('real_estate', 'Real Estate & Construction', 'العقارات والبناء', 5, TRUE),
    ('education', 'Education & Training', 'التعليم والتدريب', 6, TRUE),
    ('government', 'Government & Public Sector', 'الحكومة والقطاع العام', 7, TRUE),
    ('technology', 'Technology & Software', 'التكنولوجيا والبرمجيات', 8, TRUE),
    ('energy', 'Energy & Utilities', 'الطاقة والمرافق', 9, TRUE),
    ('hospitality', 'Hospitality & Tourism', 'الضيافة والسياحة', 10, TRUE),
    ('logistics', 'Logistics & Transportation', 'اللوجستيات والنقل', 11, TRUE),
    ('telecom', 'Telecommunications', 'الاتصالات', 12, TRUE),
    ('other', 'Other', 'أخرى', 100, TRUE);

-- Verify: SELECT * FROM industries ORDER BY sort_order;

-- ============================================================================
-- SERVICES
-- IT services offered by Roaya (matching website frontend)
-- ============================================================================

INSERT INTO services (code, name_en, name_ar, description_en, description_ar, category, sort_order, is_active) VALUES
    ('cloud', 'Cloud Solutions', 'الحلول السحابية',
     'Cloud migration, infrastructure, and managed cloud services including AWS, Azure, and Google Cloud.',
     'خدمات الترحيل إلى السحابة والبنية التحتية وإدارة الخدمات السحابية بما في ذلك AWS وAzure وGoogle Cloud.',
     'infrastructure', 1, TRUE),

    ('security', 'Cybersecurity', 'الأمن السيبراني',
     'Comprehensive cybersecurity solutions including threat detection, incident response, and security audits.',
     'حلول الأمن السيبراني الشاملة بما في ذلك اكتشاف التهديدات والاستجابة للحوادث والتدقيق الأمني.',
     'security', 2, TRUE),

    ('email', 'Email & Collaboration', 'البريد الإلكتروني والتعاون',
     'Microsoft 365, Google Workspace deployment and migration with collaboration tools.',
     'نشر وترحيل Microsoft 365 وGoogle Workspace مع أدوات التعاون.',
     'productivity', 3, TRUE),

    ('managed', 'Managed IT Services', 'خدمات تقنية المعلومات المُدارة',
     '24/7 IT support, monitoring, and maintenance services for your infrastructure.',
     'دعم تقنية المعلومات على مدار الساعة طوال أيام الأسبوع وخدمات المراقبة والصيانة للبنية التحتية.',
     'managed', 4, TRUE),

    ('backup', 'Backup & Recovery', 'النسخ الاحتياطي والاسترداد',
     'Enterprise backup solutions, disaster recovery planning, and business continuity.',
     'حلول النسخ الاحتياطي للمؤسسات وتخطيط التعافي من الكوارث واستمرارية الأعمال.',
     'infrastructure', 5, TRUE),

    ('sap', 'SAP Solutions', 'حلول SAP',
     'SAP implementation, customization, support, and migration services.',
     'خدمات تنفيذ SAP والتخصيص والدعم والترحيل.',
     'enterprise', 6, TRUE),

    ('consulting', 'IT Consulting', 'استشارات تقنية المعلومات',
     'Strategic IT consulting, digital transformation, and technology roadmap planning.',
     'الاستشارات الاستراتيجية لتقنية المعلومات والتحول الرقمي وتخطيط خارطة الطريق التقنية.',
     'consulting', 7, TRUE),

    ('devops', 'DevOps Services', 'خدمات DevOps',
     'CI/CD pipeline setup, containerization, Kubernetes, and infrastructure as code.',
     'إعداد خطوط أنابيب CI/CD والحاويات وKubernetes والبنية التحتية كرمز.',
     'development', 8, TRUE),

    ('ai', 'AI Solutions', 'حلول الذكاء الاصطناعي',
     'AI and machine learning solutions, chatbots, intelligent automation, and data analytics.',
     'حلول الذكاء الاصطناعي وتعلم الآلة وروبوتات الدردشة والأتمتة الذكية وتحليلات البيانات.',
     'ai', 9, TRUE),

    ('networking', 'Networking & Infrastructure', 'الشبكات والبنية التحتية',
     'Network design, implementation, SD-WAN, and infrastructure optimization.',
     'تصميم الشبكات والتنفيذ وSD-WAN وتحسين البنية التحتية.',
     'infrastructure', 10, TRUE),

    ('support', 'Technical Support', 'الدعم الفني',
     'Help desk, on-site support, and remote technical assistance services.',
     'مكتب المساعدة والدعم في الموقع وخدمات المساعدة الفنية عن بعد.',
     'managed', 11, TRUE);

-- Verify: SELECT * FROM services ORDER BY sort_order;

-- ============================================================================
-- INITIAL ADMIN USER
-- ============================================================================
-- IMPORTANT: Change this password immediately after deployment!
--
-- Default credentials:
--   Email: admin@roaya.co
--   Password: AdminPassword123!
--
-- Password hash generated with bcrypt, cost factor 12
-- To generate a new hash:
--   const bcrypt = require('bcrypt');
--   bcrypt.hashSync('YourPassword', 12);
-- ============================================================================

INSERT INTO admin_users (
    email,
    password_hash,
    name,
    role,
    is_active
) VALUES (
    'admin@roaya.co',
    -- Hash for "AdminPassword123!" with bcrypt cost 12
    -- CHANGE THIS PASSWORD IMMEDIATELY AFTER DEPLOYMENT
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VYx.IqXki',
    'System Administrator',
    'admin',
    TRUE
);

-- Verify: SELECT id, email, name, role, is_active FROM admin_users;

-- ============================================================================
-- SEED DATA VERIFICATION
-- ============================================================================

DO $$
DECLARE
    source_count INTEGER;
    status_count INTEGER;
    industry_count INTEGER;
    service_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count FROM lead_sources;
    SELECT COUNT(*) INTO status_count FROM lead_statuses;
    SELECT COUNT(*) INTO industry_count FROM industries;
    SELECT COUNT(*) INTO service_count FROM services;
    SELECT COUNT(*) INTO admin_count FROM admin_users;

    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SEED DATA VERIFICATION';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Lead Sources:  % records', source_count;
    RAISE NOTICE 'Lead Statuses: % records', status_count;
    RAISE NOTICE 'Industries:    % records', industry_count;
    RAISE NOTICE 'Services:      % records', service_count;
    RAISE NOTICE 'Admin Users:   % records', admin_count;
    RAISE NOTICE '===========================================';

    -- Validate minimum expected counts
    IF source_count < 3 THEN
        RAISE EXCEPTION 'Lead sources seed failed: expected >= 3, got %', source_count;
    END IF;

    IF status_count < 8 THEN
        RAISE EXCEPTION 'Lead statuses seed failed: expected >= 8, got %', status_count;
    END IF;

    IF industry_count < 10 THEN
        RAISE EXCEPTION 'Industries seed failed: expected >= 10, got %', industry_count;
    END IF;

    IF service_count < 9 THEN
        RAISE EXCEPTION 'Services seed failed: expected >= 9, got %', service_count;
    END IF;

    IF admin_count < 1 THEN
        RAISE EXCEPTION 'Admin users seed failed: expected >= 1, got %', admin_count;
    END IF;

    RAISE NOTICE 'All seed data verified successfully!';
END $$;

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================

COMMIT;

-- ============================================================================
-- POST-SEED NOTES
-- ============================================================================
--
-- CRITICAL SECURITY STEPS:
-- 1. Change the admin password immediately after first login
-- 2. Consider adding additional admin users with appropriate roles
-- 3. Review and update industry/service lists for your market
--
-- To add more admin users:
-- INSERT INTO admin_users (email, password_hash, name, role)
-- VALUES ('user@roaya.co', '$2b$12$<hash>', 'User Name', 'sales');
--
-- To add industry sub-categories:
-- UPDATE industries SET parent_id = (SELECT id FROM industries WHERE code = 'technology')
-- WHERE code = 'some_sub_industry';
-- ============================================================================
