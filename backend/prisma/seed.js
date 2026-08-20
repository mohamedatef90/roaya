"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    // Create admin users
    const adminPassword = await bcryptjs_1.default.hash('Admin@123456', 12);
    const superAdmin = await prisma.adminUser.upsert({
        where: { email: 'admin@roaya.ai' },
        update: {},
        create: {
            email: 'admin@roaya.ai',
            passwordHash: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: client_1.UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });
    const salesManager = await prisma.adminUser.upsert({
        where: { email: 'sales@roaya.ai' },
        update: {},
        create: {
            email: 'sales@roaya.ai',
            passwordHash: adminPassword,
            firstName: 'Sales',
            lastName: 'Manager',
            role: client_1.UserRole.SALES_MANAGER,
            isActive: true,
        },
    });
    console.log('Created admin users:', { superAdmin: superAdmin.email, salesManager: salesManager.email });
    // Create tags
    const tags = await Promise.all([
        prisma.tag.upsert({
            where: { name: 'Hot Lead' },
            update: {},
            create: { name: 'Hot Lead', color: '#EF4444' },
        }),
        prisma.tag.upsert({
            where: { name: 'Enterprise' },
            update: {},
            create: { name: 'Enterprise', color: '#8B5CF6' },
        }),
        prisma.tag.upsert({
            where: { name: 'SMB' },
            update: {},
            create: { name: 'SMB', color: '#3B82F6' },
        }),
        prisma.tag.upsert({
            where: { name: 'Follow Up' },
            update: {},
            create: { name: 'Follow Up', color: '#F59E0B' },
        }),
        prisma.tag.upsert({
            where: { name: 'Demo Requested' },
            update: {},
            create: { name: 'Demo Requested', color: '#10B981' },
        }),
    ]);
    console.log('Created tags:', tags.map(t => t.name));
    // Create email templates
    const templates = await Promise.all([
        prisma.emailTemplate.upsert({
            where: { name: 'lead_confirmation' },
            update: {},
            create: {
                name: 'lead_confirmation',
                subject: 'Thank you for contacting Roaya AI',
                bodyHtml: `
          <h1>Thank you, {{firstName}}!</h1>
          <p>We have received your inquiry and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to explore our <a href="https://roaya.ai">website</a>.</p>
          <p>Best regards,<br>The Roaya AI Team</p>
        `,
                bodyText: `Thank you, {{firstName}}!\n\nWe have received your inquiry and will get back to you within 24 hours.\n\nBest regards,\nThe Roaya AI Team`,
                variables: ['firstName', 'email'],
                isActive: true,
            },
        }),
        prisma.emailTemplate.upsert({
            where: { name: 'admin_new_lead' },
            update: {},
            create: {
                name: 'admin_new_lead',
                subject: 'New Lead: {{firstName}} {{lastName}} from {{source}}',
                bodyHtml: `
          <h2>New Lead Received</h2>
          <table>
            <tr><td><strong>Name:</strong></td><td>{{firstName}} {{lastName}}</td></tr>
            <tr><td><strong>Email:</strong></td><td>{{email}}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>{{phone}}</td></tr>
            <tr><td><strong>Company:</strong></td><td>{{company}}</td></tr>
            <tr><td><strong>Source:</strong></td><td>{{source}}</td></tr>
            <tr><td><strong>Message:</strong></td><td>{{message}}</td></tr>
          </table>
          <p><a href="{{adminUrl}}">View in Admin Panel</a></p>
        `,
                bodyText: `New Lead Received\n\nName: {{firstName}} {{lastName}}\nEmail: {{email}}\nPhone: {{phone}}\nCompany: {{company}}\nSource: {{source}}\nMessage: {{message}}`,
                variables: ['firstName', 'lastName', 'email', 'phone', 'company', 'source', 'message', 'adminUrl'],
                isActive: true,
            },
        }),
        prisma.emailTemplate.upsert({
            where: { name: 'roi_calculator_results' },
            update: {},
            create: {
                name: 'roi_calculator_results',
                subject: 'Your ROI Calculation Results - Roaya AI',
                bodyHtml: '<h1>Your ROI Calculation Results</h1><p>Hi {{firstName}},</p><p>Based on your inputs, here are your estimated results:</p><div style="background: #f5f5f5; padding: 20px; border-radius: 8px;"><h3>Estimated Annual Savings: ${{estimatedValue}}</h3></div><p>Would you like to discuss how Roaya AI can help you achieve these results?</p><p><a href="{{bookingUrl}}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Book a Demo</a></p>',
                bodyText: 'Your ROI Calculation Results\n\nHi {{firstName}},\n\nEstimated Annual Savings: ${{estimatedValue}}\n\nBook a demo: {{bookingUrl}}',
                variables: ['firstName', 'estimatedValue', 'bookingUrl'],
                isActive: true,
            },
        }),
    ]);
    console.log('Created email templates:', templates.map(t => t.name));
    // Create system settings
    const settings = await Promise.all([
        prisma.systemSetting.upsert({
            where: { key: 'lead_assignment_mode' },
            update: {},
            create: {
                key: 'lead_assignment_mode',
                value: { mode: 'round_robin', enabled: true },
                category: 'leads',
            },
        }),
        prisma.systemSetting.upsert({
            where: { key: 'notification_settings' },
            update: {},
            create: {
                key: 'notification_settings',
                value: {
                    emailOnNewLead: true,
                    emailOnStatusChange: true,
                    slackEnabled: false
                },
                category: 'notifications',
            },
        }),
        prisma.systemSetting.upsert({
            where: { key: 'sla_settings' },
            update: {},
            create: {
                key: 'sla_settings',
                value: {
                    firstResponseHours: 24,
                    followUpDays: 3,
                    escalationDays: 7
                },
                category: 'sla',
            },
        }),
    ]);
    console.log('Created system settings:', settings.map(s => s.key));
    // Create sample leads
    const leads = await Promise.all([
        prisma.lead.create({
            data: {
                firstName: 'Ahmed',
                lastName: 'Al-Rashid',
                email: 'ahmed.rashid@techcorp.sa',
                phone: '+966501234567',
                company: 'TechCorp Saudi',
                jobTitle: 'CTO',
                source: client_1.LeadSource.CONTACT_FORM,
                status: client_1.LeadStatus.NEW,
                priority: client_1.LeadPriority.HIGH,
                message: 'Interested in AI automation for our customer service department.',
                utmSource: 'google',
                utmMedium: 'cpc',
                utmCampaign: 'ai-automation-ksa',
            },
        }),
        prisma.lead.create({
            data: {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.j@globalretail.com',
                phone: '+12025551234',
                company: 'Global Retail Inc',
                jobTitle: 'VP of Operations',
                source: client_1.LeadSource.ROI_CALCULATOR,
                status: client_1.LeadStatus.QUALIFIED,
                priority: client_1.LeadPriority.URGENT,
                estimatedValue: 150000,
                formData: {
                    currentEmployees: 50,
                    monthlyCalls: 10000,
                    avgHandleTime: 8,
                },
                assignedToId: salesManager.id,
            },
        }),
        prisma.lead.create({
            data: {
                firstName: 'Mohammad',
                lastName: 'Hassan',
                email: 'mhassan@startuphub.ae',
                phone: '+971501234567',
                company: 'StartupHub UAE',
                jobTitle: 'Founder',
                source: client_1.LeadSource.PRICING_PAGE,
                status: client_1.LeadStatus.CONTACTED,
                priority: client_1.LeadPriority.MEDIUM,
                message: 'Looking for AI solutions for our accelerator program.',
            },
        }),
    ]);
    console.log('Created sample leads:', leads.map(l => `${l.firstName} ${l.lastName}`));
    // Add tags to leads
    await prisma.leadTag.createMany({
        data: [
            { leadId: leads[0].id, tagId: tags[0].id }, // Hot Lead
            { leadId: leads[0].id, tagId: tags[1].id }, // Enterprise
            { leadId: leads[1].id, tagId: tags[0].id }, // Hot Lead
            { leadId: leads[1].id, tagId: tags[4].id }, // Demo Requested
            { leadId: leads[2].id, tagId: tags[2].id }, // SMB
        ],
        skipDuplicates: true,
    });
    console.log('Added tags to leads');
    // Add activities to leads
    await prisma.leadActivity.createMany({
        data: [
            {
                leadId: leads[0].id,
                type: 'NOTE',
                description: 'Initial contact form submission received.',
                performedById: superAdmin.id,
            },
            {
                leadId: leads[1].id,
                type: 'STATUS_CHANGE',
                description: 'Status changed from NEW to QUALIFIED',
                performedById: salesManager.id,
                metadata: { from: 'NEW', to: 'QUALIFIED' },
            },
            {
                leadId: leads[1].id,
                type: 'EMAIL_SENT',
                description: 'Sent ROI calculation results email',
                performedById: salesManager.id,
            },
        ],
    });
    console.log('Added activities to leads');
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map