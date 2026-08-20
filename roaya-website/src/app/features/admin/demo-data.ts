/**
 * Demo Data for Admin Panel
 * 
 * ⚠️ TEMPORARY FILE - This contains mock data for development/demo purposes.
 * TODO: Remove this file and replace with dynamic data from backend in production.
 * 
 * @deprecated This file should be removed before production deployment
 */

// =============================================================================
// LEADS DATA
// =============================================================================

export const DEMO_LEADS = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@techcorp.com',
    phone: '+20 100 123 4567',
    company: 'TechCorp Egypt',
    jobTitle: 'IT Director',
    status: 'NEW',
    source: 'WEBSITE',
    notes: 'Interested in cybersecurity solutions for their banking operations.',
    tags: ['enterprise', 'banking', 'cybersecurity'],
    createdAt: '2026-01-25T10:30:00Z',
    updatedAt: '2026-01-25T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Sara',
    lastName: 'Mohamed',
    email: 'sara.m@innovate.sa',
    phone: '+966 50 987 6543',
    company: 'Innovate Solutions',
    jobTitle: 'CTO',
    status: 'CONTACTED',
    source: 'REFERRAL',
    notes: 'Looking for cloud migration services. Budget approved for Q2.',
    tags: ['cloud', 'migration', 'saudi'],
    createdAt: '2026-01-24T14:15:00Z',
    updatedAt: '2026-01-26T09:00:00Z',
  },
  {
    id: '3',
    firstName: 'Omar',
    lastName: 'Al-Rashid',
    email: 'omar@petrogas.ae',
    phone: '+971 55 111 2222',
    company: 'PetroGas Industries',
    jobTitle: 'Head of IT',
    status: 'QUALIFIED',
    source: 'LINKEDIN',
    notes: 'Enterprise deal. Needs SAP integration with existing systems.',
    tags: ['sap', 'enterprise', 'oil-gas'],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-26T11:30:00Z',
  },
  {
    id: '4',
    firstName: 'Fatima',
    lastName: 'Khalil',
    email: 'f.khalil@healthplus.eg',
    phone: '+20 111 222 3333',
    company: 'HealthPlus Medical',
    jobTitle: 'Operations Manager',
    status: 'PROPOSAL',
    source: 'WEBSITE',
    notes: 'Proposal sent for managed IT services. Following up next week.',
    tags: ['healthcare', 'managed-services'],
    createdAt: '2026-01-18T16:45:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
  },
  {
    id: '5',
    firstName: 'Khalid',
    lastName: 'Abdullah',
    email: 'khalid@financegroup.com',
    phone: '+973 3344 5566',
    company: 'Finance Group Bahrain',
    jobTitle: 'CEO',
    status: 'NEGOTIATION',
    source: 'EVENT',
    notes: 'Met at GITEX. Very interested. Negotiating contract terms.',
    tags: ['finance', 'bahrain', 'vip'],
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-27T10:00:00Z',
  },
  {
    id: '6',
    firstName: 'Layla',
    lastName: 'Nasser',
    email: 'layla@edutech.jo',
    phone: '+962 79 888 9999',
    company: 'EduTech Jordan',
    jobTitle: 'Technical Lead',
    status: 'WON',
    source: 'GOOGLE',
    notes: 'Signed 2-year contract for DevOps services.',
    tags: ['education', 'devops', 'jordan'],
    createdAt: '2026-01-10T09:30:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
  {
    id: '7',
    firstName: 'Youssef',
    lastName: 'Mahmoud',
    email: 'youssef@retail.eg',
    phone: '+20 122 333 4444',
    company: 'RetailMax Egypt',
    jobTitle: 'IT Manager',
    status: 'LOST',
    source: 'COLD_CALL',
    notes: 'Went with competitor due to pricing.',
    tags: ['retail', 'lost-deal'],
    createdAt: '2026-01-05T13:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: '8',
    firstName: 'Nadia',
    lastName: 'Ibrahim',
    email: 'nadia@govtech.eg',
    phone: '+20 100 555 6666',
    company: 'Government Tech Authority',
    jobTitle: 'Project Director',
    status: 'NEW',
    source: 'WEBSITE',
    notes: 'Government tender opportunity. Large scale project.',
    tags: ['government', 'tender', 'large-scale'],
    createdAt: '2026-01-27T08:00:00Z',
    updatedAt: '2026-01-27T08:00:00Z',
  },
];

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export const DEMO_DASHBOARD_STATS = {
  totalLeads: 156,
  newLeadsToday: 8,
  newLeadsThisWeek: 34,
  newLeadsThisMonth: 89,
  leadsByStatus: {
    NEW: 42,
    CONTACTED: 28,
    QUALIFIED: 35,
    PROPOSAL: 18,
    NEGOTIATION: 12,
    WON: 15,
    LOST: 4,
    ARCHIVED: 2,
  },
  leadsBySource: {
    WEBSITE: 45,
    REFERRAL: 28,
    LINKEDIN: 22,
    GOOGLE: 18,
    EVENT: 15,
    COLD_CALL: 12,
    EMAIL: 10,
    PARTNER: 6,
  },
};

// =============================================================================
// ANALYTICS DATA
// =============================================================================

export const DEMO_ANALYTICS = {
  overview: {
    totalVisitors: 12450,
    uniqueVisitors: 8320,
    pageViews: 45600,
    avgSessionDuration: '3m 45s',
    bounceRate: 42.5,
    conversionRate: 3.8,
  },
  trafficSources: [
    { source: 'Organic Search', visitors: 4500, percentage: 36.1 },
    { source: 'Direct', visitors: 3200, percentage: 25.7 },
    { source: 'Social Media', visitors: 2100, percentage: 16.9 },
    { source: 'Referral', visitors: 1800, percentage: 14.5 },
    { source: 'Email', visitors: 850, percentage: 6.8 },
  ],
  topPages: [
    { page: '/services/cybersecurity', views: 8500, avgTime: '4m 20s' },
    { page: '/services/cloud', views: 6200, avgTime: '3m 55s' },
    { page: '/about', views: 5100, avgTime: '2m 30s' },
    { page: '/contact', views: 4800, avgTime: '1m 45s' },
    { page: '/services/sap', views: 3900, avgTime: '3m 10s' },
  ],
  conversionFunnel: [
    { stage: 'Visitors', count: 12450, rate: 100 },
    { stage: 'Engaged', count: 7150, rate: 57.4 },
    { stage: 'Interested', count: 2860, rate: 23.0 },
    { stage: 'Contact Form', count: 715, rate: 5.7 },
    { stage: 'Qualified Lead', count: 286, rate: 2.3 },
  ],
  weeklyTrend: [
    { day: 'Mon', visitors: 1850, leads: 12 },
    { day: 'Tue', visitors: 2100, leads: 15 },
    { day: 'Wed', visitors: 1950, leads: 11 },
    { day: 'Thu', visitors: 2250, leads: 18 },
    { day: 'Fri', visitors: 1680, leads: 9 },
    { day: 'Sat', visitors: 1420, leads: 6 },
    { day: 'Sun', visitors: 1200, leads: 4 },
  ],
};

// =============================================================================
// TEAM MEMBERS
// =============================================================================

export const DEMO_TEAM = [
  {
    id: '1',
    name: 'Mohamed Ali',
    email: 'mohamed.ali@roaya.ai',
    role: 'Sales Manager',
    avatar: null,
    phone: '+20 100 111 2222',
    department: 'Sales',
    status: 'active',
    leadsAssigned: 28,
    dealsWon: 12,
    performance: 92,
  },
  {
    id: '2',
    name: 'Aisha Rahman',
    email: 'aisha.rahman@roaya.ai',
    role: 'Account Executive',
    avatar: null,
    phone: '+20 111 222 3333',
    department: 'Sales',
    status: 'active',
    leadsAssigned: 22,
    dealsWon: 8,
    performance: 85,
  },
  {
    id: '3',
    name: 'Hassan Youssef',
    email: 'hassan.y@roaya.ai',
    role: 'Technical Consultant',
    avatar: null,
    phone: '+20 122 333 4444',
    department: 'Technical',
    status: 'active',
    leadsAssigned: 15,
    dealsWon: 10,
    performance: 88,
  },
  {
    id: '4',
    name: 'Mariam Saleh',
    email: 'mariam.s@roaya.ai',
    role: 'Business Developer',
    avatar: null,
    phone: '+20 100 444 5555',
    department: 'Business Development',
    status: 'active',
    leadsAssigned: 18,
    dealsWon: 6,
    performance: 78,
  },
  {
    id: '5',
    name: 'Karim Farouk',
    email: 'karim.f@roaya.ai',
    role: 'Senior Sales Rep',
    avatar: null,
    phone: '+20 111 555 6666',
    department: 'Sales',
    status: 'on-leave',
    leadsAssigned: 20,
    dealsWon: 9,
    performance: 82,
  },
];

// =============================================================================
// USERS (Admin Panel Users)
// =============================================================================

export const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@roaya.ai',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-01-27T09:30:00Z',
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Mohamed Ali',
    email: 'mohamed.ali@roaya.ai',
    role: 'manager',
    status: 'active',
    lastLogin: '2026-01-27T08:45:00Z',
    createdAt: '2025-08-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Aisha Rahman',
    email: 'aisha.rahman@roaya.ai',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-01-26T16:20:00Z',
    createdAt: '2025-09-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Hassan Youssef',
    email: 'hassan.y@roaya.ai',
    role: 'viewer',
    status: 'active',
    lastLogin: '2026-01-25T14:00:00Z',
    createdAt: '2025-11-10T00:00:00Z',
  },
  {
    id: '5',
    name: 'Test User',
    email: 'test@roaya.ai',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2026-01-10T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// =============================================================================
// SESSION RECORDINGS
// =============================================================================

export const DEMO_RECORDINGS = [
  {
    id: '1',
    sessionId: 'sess_abc123',
    visitorId: 'visitor_001',
    country: 'Egypt',
    city: 'Cairo',
    device: 'Desktop',
    browser: 'Chrome 120',
    os: 'Windows 11',
    duration: 245, // seconds
    pages: 8,
    startTime: '2026-01-27T10:15:00Z',
    status: 'completed',
    watched: false,
    events: ['click', 'scroll', 'form_interaction'],
  },
  {
    id: '2',
    sessionId: 'sess_def456',
    visitorId: 'visitor_002',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    device: 'Mobile',
    browser: 'Safari 17',
    os: 'iOS 17',
    duration: 180,
    pages: 5,
    startTime: '2026-01-27T09:45:00Z',
    status: 'completed',
    watched: true,
    events: ['click', 'scroll'],
  },
  {
    id: '3',
    sessionId: 'sess_ghi789',
    visitorId: 'visitor_003',
    country: 'UAE',
    city: 'Dubai',
    device: 'Desktop',
    browser: 'Firefox 122',
    os: 'macOS',
    duration: 0,
    pages: 2,
    startTime: '2026-01-27T11:00:00Z',
    status: 'live',
    watched: false,
    events: ['click'],
  },
  {
    id: '4',
    sessionId: 'sess_jkl012',
    visitorId: 'visitor_004',
    country: 'Jordan',
    city: 'Amman',
    device: 'Tablet',
    browser: 'Chrome 120',
    os: 'Android 14',
    duration: 320,
    pages: 12,
    startTime: '2026-01-26T14:30:00Z',
    status: 'completed',
    watched: true,
    events: ['click', 'scroll', 'form_submission'],
  },
  {
    id: '5',
    sessionId: 'sess_mno345',
    visitorId: 'visitor_005',
    country: 'Egypt',
    city: 'Alexandria',
    device: 'Desktop',
    browser: 'Edge 120',
    os: 'Windows 10',
    duration: 95,
    pages: 3,
    startTime: '2026-01-26T11:20:00Z',
    status: 'error',
    watched: false,
    events: ['click'],
  },
];

// =============================================================================
// CONTENT - BLOG POSTS
// =============================================================================

export const DEMO_BLOG_POSTS = [
  {
    id: '1',
    title: 'Top 10 Cybersecurity Trends for 2026',
    slug: 'cybersecurity-trends-2026',
    excerpt: 'Discover the latest cybersecurity trends that will shape the industry in 2026.',
    content: '<p>Content here...</p>',
    author: 'Mohamed Ali',
    category: 'Cybersecurity',
    tags: ['security', 'trends', '2026'],
    status: 'published',
    featuredImage: '/assets/images/blog/cybersecurity.jpg',
    publishedAt: '2026-01-20T10:00:00Z',
    views: 1250,
  },
  {
    id: '2',
    title: 'Cloud Migration Best Practices',
    slug: 'cloud-migration-best-practices',
    excerpt: 'A comprehensive guide to migrating your infrastructure to the cloud.',
    content: '<p>Content here...</p>',
    author: 'Aisha Rahman',
    category: 'Cloud',
    tags: ['cloud', 'migration', 'aws', 'azure'],
    status: 'published',
    featuredImage: '/assets/images/blog/cloud.jpg',
    publishedAt: '2026-01-15T14:00:00Z',
    views: 890,
  },
  {
    id: '3',
    title: 'SAP S/4HANA Implementation Guide',
    slug: 'sap-s4hana-implementation',
    excerpt: 'Everything you need to know about implementing SAP S/4HANA.',
    content: '<p>Content here...</p>',
    author: 'Hassan Youssef',
    category: 'SAP',
    tags: ['sap', 's4hana', 'erp'],
    status: 'draft',
    featuredImage: '/assets/images/blog/sap.jpg',
    publishedAt: null,
    views: 0,
  },
];

// =============================================================================
// CONTENT - CASE STUDIES
// =============================================================================

export const DEMO_CASE_STUDIES = [
  {
    id: '1',
    title: 'Bank of Alexandria - Digital Transformation',
    slug: 'bank-alexandria-digital-transformation',
    client: 'Bank of Alexandria',
    industry: 'Banking & Finance',
    services: ['Digital Transformation', 'Cybersecurity', 'Cloud'],
    challenge: 'Legacy systems and security vulnerabilities',
    solution: 'Complete digital overhaul with modern security stack',
    results: ['50% faster transactions', '99.9% uptime', 'Zero security breaches'],
    testimonial: 'Roaya IT transformed our digital infrastructure completely.',
    status: 'published',
    featuredImage: '/assets/images/case-studies/bank.jpg',
  },
  {
    id: '2',
    title: 'PetroGas Industries - SAP Implementation',
    slug: 'petrogas-sap-implementation',
    client: 'PetroGas Industries',
    industry: 'Oil & Gas',
    services: ['SAP', 'ERP', 'Integration'],
    challenge: 'Disconnected systems across multiple facilities',
    solution: 'SAP S/4HANA implementation with custom integrations',
    results: ['30% efficiency increase', 'Real-time reporting', 'Unified operations'],
    testimonial: 'The SAP implementation exceeded our expectations.',
    status: 'published',
    featuredImage: '/assets/images/case-studies/petrogas.jpg',
  },
];

// =============================================================================
// TESTIMONIALS
// =============================================================================

export const DEMO_TESTIMONIALS = [
  {
    id: '1',
    name: 'Dr. Ahmed Mostafa',
    position: 'CIO',
    company: 'Bank of Alexandria',
    content: 'Roaya IT has been an exceptional partner in our digital transformation journey. Their expertise and dedication are unmatched.',
    rating: 5,
    avatar: null,
    status: 'published',
  },
  {
    id: '2',
    name: 'Eng. Fatima Hassan',
    position: 'IT Director',
    company: 'Ministry of Health',
    content: 'The cybersecurity solutions provided by Roaya IT have significantly improved our security posture.',
    rating: 5,
    avatar: null,
    status: 'published',
  },
  {
    id: '3',
    name: 'Mohamed El-Sayed',
    position: 'CEO',
    company: 'TechStart Egypt',
    content: 'Professional, responsive, and highly skilled team. We recommend Roaya IT for any IT project.',
    rating: 4,
    avatar: null,
    status: 'published',
  },
];

// =============================================================================
// SERVICE PACKAGES
// =============================================================================

export const DEMO_PACKAGES = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 999,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      '24/7 Support',
      'Basic Security Monitoring',
      'Cloud Backup (100GB)',
      'Email Support',
    ],
    isPopular: false,
    status: 'active',
  },
  {
    id: '2',
    name: 'Professional',
    description: 'Ideal for growing businesses',
    price: 2499,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Everything in Starter',
      'Advanced Security Suite',
      'Cloud Backup (1TB)',
      'Priority Support',
      'Monthly Reports',
    ],
    isPopular: true,
    status: 'active',
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: null, // Custom pricing
    currency: 'USD',
    billingCycle: 'custom',
    features: [
      'Everything in Professional',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Guarantee',
      'On-site Support',
      'Unlimited Cloud Storage',
    ],
    isPopular: false,
    status: 'active',
  },
];

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    type: 'lead',
    title: 'New Lead Received',
    message: 'Ahmed Hassan from TechCorp Egypt submitted a contact form.',
    read: false,
    createdAt: '2026-01-27T10:30:00Z',
  },
  {
    id: '2',
    type: 'deal',
    title: 'Deal Won!',
    message: 'Layla Nasser from EduTech Jordan signed the contract.',
    read: false,
    createdAt: '2026-01-27T09:15:00Z',
  },
  {
    id: '3',
    type: 'system',
    title: 'System Update',
    message: 'The system will undergo maintenance tonight at 2:00 AM.',
    read: true,
    createdAt: '2026-01-26T16:00:00Z',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Security Alert',
    message: 'Unusual login attempt detected from IP 192.168.1.100',
    read: true,
    createdAt: '2026-01-26T14:30:00Z',
  },
];

// =============================================================================
// ACTIVITY LOG
// =============================================================================

export const DEMO_ACTIVITY_LOG = [
  {
    id: '1',
    user: 'Mohamed Ali',
    action: 'created',
    target: 'Lead',
    targetName: 'Ahmed Hassan',
    timestamp: '2026-01-27T10:30:00Z',
  },
  {
    id: '2',
    user: 'Aisha Rahman',
    action: 'updated',
    target: 'Lead',
    targetName: 'Sara Mohamed',
    details: 'Status changed from NEW to CONTACTED',
    timestamp: '2026-01-27T09:45:00Z',
  },
  {
    id: '3',
    user: 'Admin User',
    action: 'published',
    target: 'Blog Post',
    targetName: 'Top 10 Cybersecurity Trends for 2026',
    timestamp: '2026-01-26T15:00:00Z',
  },
  {
    id: '4',
    user: 'Hassan Youssef',
    action: 'closed',
    target: 'Deal',
    targetName: 'EduTech Jordan - DevOps Services',
    details: 'Deal won - $45,000',
    timestamp: '2026-01-26T12:00:00Z',
  },
];

// =============================================================================
// QUICK STATS FOR WIDGETS
// =============================================================================

export const DEMO_QUICK_STATS = {
  revenue: {
    current: 125000,
    previous: 98000,
    currency: 'USD',
    trend: 27.5,
  },
  activeDeals: {
    count: 18,
    totalValue: 245000,
    currency: 'USD',
  },
  customerSatisfaction: {
    score: 4.8,
    maxScore: 5,
    totalReviews: 156,
  },
  supportTickets: {
    open: 12,
    resolved: 145,
    avgResponseTime: '2.5 hours',
  },
};

// =============================================================================
// HELPER: Get Demo Data by Type
// =============================================================================

export type DemoDataType = 
  | 'leads' 
  | 'dashboardStats' 
  | 'analytics' 
  | 'team' 
  | 'users' 
  | 'recordings'
  | 'blogPosts'
  | 'caseStudies'
  | 'testimonials'
  | 'packages'
  | 'notifications'
  | 'activityLog'
  | 'quickStats';

export function getDemoData(type: DemoDataType): any {
  const dataMap: Record<DemoDataType, any> = {
    leads: DEMO_LEADS,
    dashboardStats: DEMO_DASHBOARD_STATS,
    analytics: DEMO_ANALYTICS,
    team: DEMO_TEAM,
    users: DEMO_USERS,
    recordings: DEMO_RECORDINGS,
    blogPosts: DEMO_BLOG_POSTS,
    caseStudies: DEMO_CASE_STUDIES,
    testimonials: DEMO_TESTIMONIALS,
    packages: DEMO_PACKAGES,
    notifications: DEMO_NOTIFICATIONS,
    activityLog: DEMO_ACTIVITY_LOG,
    quickStats: DEMO_QUICK_STATS,
  };
  
  return dataMap[type];
}

/**
 * Check if demo mode is enabled
 * In production, this should return false
 */
export function isDemoMode(): boolean {
  // TODO: Replace with environment variable check in production
  // return environment.demoMode;
  return true;
}
