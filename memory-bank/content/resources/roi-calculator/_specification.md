# ROI Calculator - SPECIFICATION (CRITICAL PRIORITY)

**Status:** TODO - Requires development (HIGHEST PRIORITY FEATURE)
**Priority:** CRITICAL - Key differentiator
**Created:** 2025-12-05

---

## Overview

The ROI Calculator is Roaya IT's **PRIMARY DIFFERENTIATOR** and most important lead generation tool. It allows potential clients to calculate their cost savings and ROI from adopting Roaya IT services.

### Why This Matters
- **Unique in Egyptian market** - No competitor offers this
- **Lead magnet** - Requires email to see full results
- **Demonstrates transparency** - Shows we're confident in our value
- **Sales tool** - Sales team can use results in proposals

---

## Calculator Types (3 Calculators)

### 1. Cloud Infrastructure ROI Calculator
**Purpose:** Calculate cost savings from cloud migration

**Inputs (User provides):**
1. Current monthly server/hosting costs (EGP)
2. Number of servers
3. Current maintenance hours per month
4. Average hourly IT staff cost (EGP)
5. Current downtime hours per year
6. Revenue loss per hour of downtime (EGP)

**Calculations:**
- Infrastructure cost savings (vs. current costs)
- Maintenance time savings (reduced by 60%)
- Downtime reduction savings (99.9% uptime)
- Total monthly savings
- Total annual savings
- ROI payback period (months)

**Outputs:**
- Monthly savings: EGP [X,XXX]
- Annual savings: EGP [XX,XXX]
- ROI payback: [X] months
- 3-year total savings: EGP [XXX,XXX]

---

### 2. Email Services ROI Calculator
**Purpose:** Calculate savings from migrating to managed Exchange

**Inputs:**
1. Number of mailboxes
2. Current email hosting cost per mailbox (EGP)
3. Current email-related IT hours per month
4. Average hourly IT staff cost (EGP)
5. Current email downtime hours per year
6. Security incidents related to email (per year)

**Calculations:**
- Hosting cost comparison
- IT time savings (managed service reduces by 70%)
- Downtime reduction (99.99% uptime)
- Security incident cost savings
- Total monthly savings
- ROI payback period

**Outputs:**
- Monthly savings per mailbox: EGP [XX]
- Annual savings: EGP [XX,XXX]
- ROI payback: [X] months
- Security risk reduction: [XX]%

---

### 3. Cybersecurity ROI Calculator
**Purpose:** Calculate value of SOC services vs. breach costs

**Inputs:**
1. Annual revenue (EGP)
2. Current security tools cost (EGP/month)
3. Security staff count and average salary
4. Previous security incidents (count)
5. Industry (dropdown: Finance, Healthcare, Retail, etc.)

**Calculations:**
- Average breach cost for industry (% of revenue)
- SOC service cost vs. in-house security cost
- Breach prevention value
- Compliance cost reduction
- Total annual value

**Outputs:**
- Potential breach cost: EGP [X,XXX,XXX]
- SOC service cost: EGP [XX,XXX]/year
- Net protection value: EGP [XXX,XXX]/year
- Compliance cost savings: EGP [XX,XXX]/year

---

## User Experience Flow

### Step 1: Landing on Calculator
- Headline: "Calculate Your IT Infrastructure Savings"
- Subheadline: "See how much you can save with transparent pricing and proven efficiency"
- Select calculator type (3 tabs: Cloud, Email, Cybersecurity)

### Step 2: Input Form
- Clear field labels with tooltips
- Input validation (numbers only, reasonable ranges)
- Progress indicator (Step 1 of 2)
- "Calculate My Savings" CTA button

### Step 3: Lead Capture (Gate)
- Show partial results (tease the numbers)
- Form to get full report:
  - Name (required)
  - Email (required)
  - Company name (optional)
  - Phone (optional)
  - Industry (dropdown, required)
  - "Send Me Full Report" CTA
- Privacy notice: "We respect your privacy. No spam, ever."

### Step 4: Full Results Display
- Hero metric: "You Could Save EGP [XX,XXX] per Year"
- Breakdown chart (visual)
- Detailed calculations table
- Comparison: Current Costs vs. Roaya IT Costs
- ROI timeline (graph showing payback period)
- CTAs:
  - Primary: "Schedule Consultation"
  - Secondary: "Download PDF Report"
  - Tertiary: "Customize This Estimate"

### Step 5: Follow-up
- Send email with PDF report
- Include link to schedule consultation
- Sales team notification (lead alert)
- Add to CRM with calculator inputs and results

---

## Technical Specification

### Frontend (React Component)

```
<ROICalculator>
  <CalculatorSelector /> {/* 3 tabs */}
  <CalculatorForm inputs={inputs} />
  <LeadCaptureModal results={partialResults} />
  <ResultsDisplay results={fullResults} />
  <CTASection />
</ROICalculator>
```

### Backend (API Endpoints)

**POST /api/calculator/calculate**
- Input: Calculator type, user inputs
- Output: Partial results (for teaser)

**POST /api/calculator/lead**
- Input: User contact info, calculator inputs
- Output: Full results, lead ID
- Action: Send email, notify sales, add to CRM

**GET /api/calculator/pdf/:leadId**
- Input: Lead ID
- Output: PDF report download

### Calculation Formulas (Examples)

**Cloud Infrastructure Savings:**
```
infrastructureSavings = (currentCost * 0.4) // 40% reduction
maintenanceSavings = (maintenanceHours * hourlyCost * 0.6) // 60% reduction
downtimeSavings = (currentDowntime - (365*24*0.001)) * revenuePerHour
totalMonthlySavings = infrastructureSavings + maintenanceSavings + (downtimeSavings / 12)
roiPayback = (setupCost / totalMonthlySavings)
```

**Email Services Savings:**
```
hostingSavings = (currentCostPerMailbox - roayaCostPerMailbox) * mailboxCount
itTimeSavings = (currentITHours * hourlyCost * 0.7)
downtimeSavings = (currentEmailDowntime - (365*24*0.0001)) * productivityCostPerHour
securitySavings = (securityIncidents * avgIncidentCost * 0.8) // 80% reduction
totalMonthlySavings = hostingSavings + itTimeSavings + (downtimeSavings + securitySavings) / 12
```

---

## Content for Calculator Page

### Above Calculator (Context)

**Headline:** "Calculate Your IT Infrastructure Savings"

**Subheadline:** "Roaya IT is the first IT provider in Egypt to offer transparent pricing and an ROI calculator. See exactly how much you'll save with our services."

**Why This Calculator:**
- Transparent pricing - no hidden costs
- Based on real Egyptian client data
- Conservative estimates - real results often exceed calculator
- Used by 100+ Egyptian enterprises

### Results Page Copy

**Headline:** "You Could Save EGP [XX,XXX] per Year"

**Subheadline:** "Here's how we calculated your potential savings with Roaya IT services"

**Disclaimer:** "These are estimated savings based on average client results. Your actual savings may vary based on your specific environment. Schedule a consultation for a detailed assessment."

**Trust Signals:**
- "Based on data from 50+ Egyptian clients"
- "Conservative estimates - real results typically 20% higher"
- "No obligation quote - see if we're a good fit"

---

## Analytics & Tracking

### Events to Track:
1. Calculator page view
2. Calculator type selected (Cloud, Email, Security)
3. Form started (first input)
4. Calculate button clicked
5. Lead capture form viewed
6. Lead captured (email submitted)
7. Full results viewed
8. PDF downloaded
9. CTA clicked (Schedule Consultation)
10. Calculator abandoned (where in flow)

### Success Metrics:
- Completion rate (started → lead captured)
- Time to complete
- Lead quality (sales team feedback)
- Conversion rate (calculator → meeting scheduled)
- Calculator → closed deal rate

---

## Marketing Integration

### Promotion Strategy:
1. **Home page:** ROI Calculator teaser (mini version)
2. **Service pages:** "Calculate Your [Service] Savings" CTA
3. **Pricing page:** "See Your Savings" CTA above pricing tables
4. **Blog/content:** "Use our ROI calculator to see..."
5. **Social media:** "First transparent ROI calculator in Egypt"
6. **Email campaigns:** "Calculate your savings in 2 minutes"
7. **Sales presentations:** Use calculator with prospects live

---

## Next Steps (Development Roadmap)

### Phase 1: Design (1 week)
- [ ] Wireframe calculator UI/UX
- [ ] Design form fields and validation
- [ ] Design results display (charts, tables)
- [ ] Design PDF report template

### Phase 2: Frontend Development (2 weeks)
- [ ] Build calculator form components
- [ ] Implement input validation
- [ ] Build lead capture modal
- [ ] Build results display with charts
- [ ] Add animations and interactions

### Phase 3: Backend Development (1 week)
- [ ] Create calculation API endpoints
- [ ] Implement calculation logic
- [ ] Build lead capture API
- [ ] Integrate with email service (send results)
- [ ] Generate PDF reports
- [ ] CRM integration (lead notification)

### Phase 4: Testing (1 week)
- [ ] Test calculation accuracy
- [ ] Test across devices (mobile, tablet, desktop)
- [ ] Test form validation
- [ ] Test email delivery
- [ ] Test PDF generation
- [ ] A/B test lead capture copy

### Phase 5: Launch & Optimization (Ongoing)
- [ ] Soft launch with beta testers
- [ ] Gather feedback from sales team
- [ ] Optimize conversion rates
- [ ] Add more calculator types (SAP, Migration)
- [ ] Create video tutorial

---

**Assignee:** Full-Stack Developer + UX Designer
**Due Date:** ASAP (4-5 weeks total)
**Priority:** CRITICAL - This is the #1 feature
**Dependencies:** Design tokens, email service, CRM integration

---

## Success Definition

**The ROI Calculator is successful when:**
1. ✅ 30%+ of website visitors use calculator
2. ✅ 50%+ completion rate (started → lead captured)
3. ✅ 20%+ of calculator leads schedule consultations
4. ✅ Mentioned by prospects as reason they chose Roaya IT
5. ✅ Used by sales team in 80%+ of pitches

---

*This is a specification file. Build the calculator based on this spec.*
