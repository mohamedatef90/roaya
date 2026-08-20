/**
 * Test Data Fixtures: Leads
 *
 * Centralized test data for lead-related tests.
 * Use these fixtures for consistent, realistic test data across all test files.
 */

import { faker } from '@faker-js/faker';

// ============================================================
// Contact Form Data
// ============================================================

export const validContactFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+201234567890',
  company: 'Acme Corporation',
  service: 'cloud',
  message: 'I am interested in learning more about your cloud migration services for our growing business.',
  language: 'en' as const,
};

export const completeContactFormData = {
  ...validContactFormData,
  utmParams: {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'cloud-migration-2026',
    utm_term: 'cloud services egypt',
    utm_content: 'ad-variant-a',
  },
};

export const minimalContactFormData = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  message: 'Quick inquiry about your services.',
  language: 'en' as const,
};

export const arabicContactFormData = {
  name: 'محمد أحمد علي',
  email: 'mohammed.ahmed@example.com',
  phone: '+201987654321',
  company: 'شركة التكنولوجيا المتقدمة',
  service: 'security',
  message: 'مرحبا، أنا مهتم بخدمات الأمن السيبراني لشركتنا. نحتاج إلى تقييم شامل للأمان.',
  language: 'ar' as const,
};

// ============================================================
// Pricing Quote Data
// ============================================================

export const validPricingQuoteData = {
  companyName: 'Tech Innovations Ltd',
  industry: 'technology',
  email: 'procurement@techinnovations.com',
  phone: '+201234567890',
  employees: '51-200' as const,
  services: ['cloud', 'security', 'email'],
  requirements: 'We need a comprehensive enterprise IT solution including cloud migration, enhanced cybersecurity, and managed email services.',
  language: 'en' as const,
};

export const pricingQuoteSmallBusiness = {
  companyName: 'Small Startup Inc',
  industry: 'technology',
  email: 'founder@smallstartup.com',
  phone: '+201234567890',
  employees: '1-50' as const,
  services: ['cloud'],
  requirements: 'Looking for basic cloud hosting solution.',
  language: 'en' as const,
};

export const pricingQuoteEnterprise = {
  companyName: 'Global Enterprises Corp',
  industry: 'finance',
  email: 'it-director@globalenterprises.com',
  phone: '+201234567890',
  employees: '500+' as const,
  services: ['cloud', 'security', 'email', 'sap', 'managed'],
  requirements: 'Enterprise-scale digital transformation including SAP implementation, cloud migration for 500+ users, comprehensive security audit, and 24/7 managed IT services.',
  language: 'en' as const,
};

export const pricingQuoteArabic = {
  companyName: 'المجموعة الصناعية',
  industry: 'manufacturing',
  email: 'info@industrial-group.com',
  phone: '+201234567890',
  employees: '201-500' as const,
  services: ['cloud', 'security', 'backup'],
  requirements: 'نحتاج إلى حلول سحابية شاملة مع نسخ احتياطي وأمن سيبراني للبيانات الحساسة.',
  language: 'ar' as const,
};

// ============================================================
// ROI Calculator Data
// ============================================================

export const validROICalculatorData = {
  calculatorType: 'cloud' as const,
  inputs: {
    currentSpend: 10000,
    employees: 50,
    serverCount: 10,
    storageGB: 1000,
    bandwidth: 500,
  },
  results: {
    estimatedSavings: 3000,
    roi: 30,
    paybackPeriod: 12,
    monthlyCloudCost: 7000,
    annualSavings: 36000,
  },
  contactInfo: {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+201234567890',
    company: 'Johnson & Associates',
  },
  language: 'en' as const,
};

export const highROICalculatorData = {
  calculatorType: 'cloud' as const,
  inputs: {
    currentSpend: 50000,
    employees: 200,
    serverCount: 50,
    storageGB: 10000,
    bandwidth: 5000,
  },
  results: {
    estimatedSavings: 20000,
    roi: 150,
    paybackPeriod: 6,
    monthlyCloudCost: 30000,
    annualSavings: 240000,
  },
  contactInfo: {
    name: 'Sarah Williams',
    email: 'sarah.williams@bigcorp.com',
    phone: '+201234567890',
    company: 'Big Corporation',
  },
  language: 'en' as const,
};

export const negativeROICalculatorData = {
  calculatorType: 'security' as const,
  inputs: {
    currentSecuritySpend: 2000,
    breachRisk: 5, // 5% risk
    averageBreachCost: 100000,
    employeeCount: 20,
  },
  results: {
    estimatedSavings: -1000, // More expensive initially
    roi: -20,
    paybackPeriod: 0,
    preventedBreachSavings: 95000,
  },
  contactInfo: {
    name: 'Michael Brown',
    email: 'michael.brown@smallbiz.com',
    phone: '+201234567890',
    company: 'Small Business LLC',
  },
  language: 'en' as const,
};

// ============================================================
// Admin User Data
// ============================================================

export const adminUser = {
  email: 'admin@roaya.co',
  password: 'TestPassword123!',
  name: 'Test Admin User',
  role: 'admin' as const,
};

export const salesUser = {
  email: 'sales@roaya.co',
  password: 'SalesPassword123!',
  name: 'Sales Manager',
  role: 'sales' as const,
};

export const viewerUser = {
  email: 'viewer@roaya.co',
  password: 'ViewerPassword123!',
  name: 'View Only User',
  role: 'viewer' as const,
};

// ============================================================
// Invalid/Malicious Data (for negative testing)
// ============================================================

export const invalidEmailData = {
  name: 'Test User',
  email: 'not-a-valid-email',
  message: 'Test message',
  language: 'en' as const,
};

export const xssAttemptData = {
  name: '<script>alert("XSS")</script>',
  email: 'hacker@example.com',
  phone: '+201234567890',
  company: 'Evil Corp',
  message: 'Hello <script>alert("XSS")</script> World <img src=x onerror=alert("XSS")>',
  language: 'en' as const,
};

export const sqlInjectionAttemptData = {
  name: "Robert'; DROP TABLE leads;--",
  email: 'test@example.com',
  phone: '+201234567890',
  company: "'; DELETE FROM leads WHERE '1'='1",
  message: "Test message'; UPDATE leads SET contact_email='hacker@evil.com' WHERE '1'='1",
  language: 'en' as const,
};

export const oversizedMessageData = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'a'.repeat(2001), // Exceeds 2000 char limit
  language: 'en' as const,
};

export const missingRequiredFieldsData = {
  name: 'Test User',
  // email missing
  message: 'Test message',
  language: 'en' as const,
};

export const invalidLanguageData = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'Test message',
  language: 'fr' as const, // Invalid - only 'en' or 'ar' allowed
};

export const invalidEmployeeRangeData = {
  companyName: 'Test Company',
  email: 'test@example.com',
  services: ['cloud'],
  employees: '9999' as const, // Invalid range
  language: 'en' as const,
};

export const emptyServicesArrayData = {
  companyName: 'Test Company',
  email: 'test@example.com',
  services: [], // Should have at least one service
  language: 'en' as const,
};

export const invalidServiceCodeData = {
  companyName: 'Test Company',
  email: 'test@example.com',
  services: ['cloud', 'nonexistent-service', 'invalid'],
  language: 'en' as const,
};

// ============================================================
// Boundary Test Data
// ============================================================

export const boundaryTestData = {
  // Exactly at limits
  nameMinLength: {
    name: 'AB', // Minimum 2 characters
    email: 'test@example.com',
    message: 'Test message',
    language: 'en' as const,
  },

  nameMaxLength: {
    name: 'a'.repeat(100), // Maximum 100 characters
    email: 'test@example.com',
    message: 'Test message',
    language: 'en' as const,
  },

  messageMinLength: {
    name: 'Test User',
    email: 'test@example.com',
    message: 'a'.repeat(10), // Minimum 10 characters
    language: 'en' as const,
  },

  messageMaxLength: {
    name: 'Test User',
    email: 'test@example.com',
    message: 'a'.repeat(2000), // Maximum 2000 characters
    language: 'en' as const,
  },

  // Just beyond limits
  nameTooShort: {
    name: 'A', // 1 character (below minimum)
    email: 'test@example.com',
    message: 'Test message',
    language: 'en' as const,
  },

  nameTooLong: {
    name: 'a'.repeat(101), // 101 characters (above maximum)
    email: 'test@example.com',
    message: 'Test message',
    language: 'en' as const,
  },

  messageTooShort: {
    name: 'Test User',
    email: 'test@example.com',
    message: 'short', // 5 characters (below minimum of 10)
    language: 'en' as const,
  },

  messageTooLong: {
    name: 'Test User',
    email: 'test@example.com',
    message: 'a'.repeat(2001), // 2001 characters (above maximum)
    language: 'en' as const,
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate a random lead with realistic data
 */
export function generateRandomLead() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+20##########'),
    company: faker.company.name(),
    message: faker.lorem.paragraph(),
    language: faker.helpers.arrayElement(['en', 'ar'] as const),
  };
}

/**
 * Generate multiple random leads
 */
export function generateRandomLeads(count: number) {
  return Array.from({ length: count }, () => generateRandomLead());
}

/**
 * Generate a unique email for test isolation
 */
export function generateUniqueEmail(prefix: string = 'test') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Generate test lead with custom overrides
 */
export function createTestLead(overrides: Partial<typeof validContactFormData> = {}) {
  return {
    ...validContactFormData,
    email: generateUniqueEmail('test-lead'),
    ...overrides,
  };
}

/**
 * Generate pricing quote with unique data
 */
export function createTestPricingQuote(overrides: Partial<typeof validPricingQuoteData> = {}) {
  return {
    ...validPricingQuoteData,
    email: generateUniqueEmail('pricing'),
    companyName: faker.company.name(),
    ...overrides,
  };
}

/**
 * Generate ROI calculator data with unique contact
 */
export function createTestROICalculator(overrides: Partial<typeof validROICalculatorData> = {}) {
  return {
    ...validROICalculatorData,
    contactInfo: {
      ...validROICalculatorData.contactInfo,
      email: generateUniqueEmail('roi'),
      name: faker.person.fullName(),
      company: faker.company.name(),
    },
    ...overrides,
  };
}

/**
 * Generate Arabic test data
 */
export function generateArabicLead() {
  const arabicNames = [
    'محمد أحمد',
    'فاطمة حسن',
    'علي محمود',
    'نور الدين',
    'ياسمين عبدالله',
  ];

  const arabicCompanies = [
    'شركة التكنولوجيا المتقدمة',
    'المجموعة الصناعية',
    'مؤسسة الخدمات الرقمية',
    'شركة الحلول التقنية',
  ];

  return {
    name: faker.helpers.arrayElement(arabicNames),
    email: generateUniqueEmail('arabic'),
    phone: faker.phone.number('+20##########'),
    company: faker.helpers.arrayElement(arabicCompanies),
    message: 'مرحبا، أنا مهتم بخدماتكم وأرغب في الحصول على مزيد من المعلومات.',
    language: 'ar' as const,
  };
}

/**
 * Wait for a specified duration (for timing-based tests)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Database seed data helpers
 */
export const seedData = {
  leadSources: [
    { id: 1, code: 'contact', name: 'Contact Form' },
    { id: 2, code: 'pricing_quote', name: 'Pricing Quote' },
    { id: 3, code: 'roi_calculator', name: 'ROI Calculator' },
  ],

  leadStatuses: [
    { id: 1, code: 'new', name: 'New', color: '#3B82F6', sort_order: 1 },
    { id: 2, code: 'contacted', name: 'Contacted', color: '#8B5CF6', sort_order: 2 },
    { id: 3, code: 'qualified', name: 'Qualified', color: '#10B981', sort_order: 3 },
    { id: 4, code: 'proposal', name: 'Proposal Sent', color: '#F59E0B', sort_order: 4 },
    { id: 5, code: 'won', name: 'Won', color: '#059669', sort_order: 6, is_terminal: true },
    { id: 6, code: 'lost', name: 'Lost', color: '#EF4444', sort_order: 7, is_terminal: true },
  ],

  industries: [
    { id: 1, code: 'technology', name_en: 'Technology', name_ar: 'التكنولوجيا' },
    { id: 2, code: 'healthcare', name_en: 'Healthcare', name_ar: 'الرعاية الصحية' },
    { id: 3, code: 'finance', name_en: 'Finance & Banking', name_ar: 'المالية والمصارف' },
    { id: 4, code: 'manufacturing', name_en: 'Manufacturing', name_ar: 'التصنيع' },
    { id: 5, code: 'retail', name_en: 'Retail & E-commerce', name_ar: 'التجزئة والتجارة الإلكترونية' },
  ],

  services: [
    { id: 1, code: 'cloud', name_en: 'Cloud Solutions', name_ar: 'الحلول السحابية' },
    { id: 2, code: 'security', name_en: 'Cybersecurity', name_ar: 'الأمن السيبراني' },
    { id: 3, code: 'email', name_en: 'Email & Collaboration', name_ar: 'البريد الإلكتروني والتعاون' },
    { id: 4, code: 'managed', name_en: 'Managed IT Services', name_ar: 'خدمات تقنية المعلومات المُدارة' },
    { id: 5, code: 'backup', name_en: 'Backup & Recovery', name_ar: 'النسخ الاحتياطي والاسترداد' },
    { id: 6, code: 'sap', name_en: 'SAP Solutions', name_ar: 'حلول SAP' },
  ],
};

// ============================================================
// Export all fixtures
// ============================================================

export const leadFixtures = {
  // Valid data
  validContactFormData,
  completeContactFormData,
  minimalContactFormData,
  arabicContactFormData,
  validPricingQuoteData,
  pricingQuoteSmallBusiness,
  pricingQuoteEnterprise,
  pricingQuoteArabic,
  validROICalculatorData,
  highROICalculatorData,
  negativeROICalculatorData,

  // Admin users
  adminUser,
  salesUser,
  viewerUser,

  // Invalid/malicious data
  invalidEmailData,
  xssAttemptData,
  sqlInjectionAttemptData,
  oversizedMessageData,
  missingRequiredFieldsData,
  invalidLanguageData,
  invalidEmployeeRangeData,
  emptyServicesArrayData,
  invalidServiceCodeData,

  // Boundary data
  boundaryTestData,

  // Helper functions
  generateRandomLead,
  generateRandomLeads,
  generateUniqueEmail,
  createTestLead,
  createTestPricingQuote,
  createTestROICalculator,
  generateArabicLead,
  wait,

  // Seed data
  seedData,
};

export default leadFixtures;
