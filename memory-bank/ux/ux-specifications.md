# UX Specifications - Roaya IT Website
## Comprehensive User Experience Design

**Version:** 1.0
**Last Updated:** 2025-12-05
**Owner:** UX Engineer
**Status:** Ready for Review

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [User Flows](#2-user-flows)
3. [Loading Experience](#3-loading-experience)
4. [Navigation System](#4-navigation-system)
5. [Hero Section Variants](#5-hero-section-variants)
6. [Page Sections Flow](#6-page-sections-flow)
7. [Interaction States](#7-interaction-states)
8. [RTL Considerations](#8-rtl-considerations)
9. [Micro-interactions](#9-micro-interactions)
10. [Accessibility Specifications](#10-accessibility-specifications)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Animation Choreography](#12-animation-choreography)

---

## 1. Information Architecture

### Site Map

```
Roaya IT Website
│
├─ Home (/)
│
├─ Solutions (/solutions)
│  ├─ CloudEdge Portal (/solutions/cloudedge-portal)
│  ├─ Posta Portal (/solutions/posta-portal)
│  ├─ SOC Services (/solutions/soc-services)
│  ├─ Seamless Migration (/solutions/seamless-migration)
│  ├─ SAP Operations (/solutions/sap-operations)
│  └─ IT Automation (/solutions/it-automation)
│
├─ Industries (/industries)
│  ├─ Finance & Banking (/industries/finance)
│  ├─ Government (/industries/government)
│  ├─ Healthcare (/industries/healthcare)
│  ├─ Manufacturing (/industries/manufacturing)
│  ├─ Retail & E-commerce (/industries/retail)
│  └─ Education (/industries/education)
│
├─ Pricing (/pricing)
│  ├─ Transparent Pricing Page
│  └─ Interactive ROI Calculator (/pricing/roi-calculator)
│
├─ Resources (/resources)
│  ├─ Case Studies (/resources/case-studies)
│  │  └─ Individual Case Study (/resources/case-studies/[slug])
│  ├─ Blog (/resources/blog)
│  │  └─ Blog Post (/resources/blog/[slug])
│  ├─ Documentation (/resources/documentation)
│  └─ Whitepapers (/resources/whitepapers)
│
├─ About (/about)
│  ├─ Company (/about/company)
│  ├─ Team (/about/team)
│  ├─ Partners (/about/partners)
│  └─ Certifications (/about/certifications)
│
└─ Contact (/contact)
```

### Navigation Structure

**Primary Navigation (Desktop)**
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]   Solutions ▼  Industries ▼  Pricing  Resources ▼ │
│                                      About ▼    Contact    │
│                                                             │
│                                      [EN/AR] [🌙] [CTA]   │
└────────────────────────────────────────────────────────────┘
```

**Mega Menu Example - Solutions**
```
┌──────────────────────────────────────────────────────────────┐
│  Cloud & Infrastructure    Security               Support    │
│  ├─ CloudEdge Portal       ├─ SOC Services        ├─ SAP     │
│  │  Multi-cloud mgmt       │  24/7 monitoring     │  Basis    │
│  │                         │                      │           │
│  ├─ Posta Portal           Migration & Auto       │           │
│  │  Email hosting          ├─ Seamless Migration │           │
│  │                         │  Zero-downtime       │           │
│                            │                      │           │
│                            ├─ IT Automation       │           │
│                            │  AI-powered          │           │
└──────────────────────────────────────────────────────────────┘
```

### Content Hierarchy Priority

**Level 1 (Highest):** Homepage, Pricing, ROI Calculator
**Level 2:** Solution Pages, Contact
**Level 3:** Industry Pages, Case Studies
**Level 4:** About, Resources, Blog
**Level 5:** Documentation, Legal

---

## 2. User Flows

### Primary User Journey: First-Time Visitor to Lead

```
Entry Point: Homepage
     ↓
[Hero Section]
  - Read value proposition
  - See "Calculate ROI" CTA
     ↓
Decision Point: Interested?
     ├─── NO → Scroll to learn more
     │         ↓
     │    [Value Props Section]
     │         ↓
     │    [Services Overview]
     │         ↓
     │    Decision: Still interested?
     │         ├─ YES → Continue to CTA
     │         └─ NO → Exit (retarget opportunity)
     │
     └─── YES → Click "Calculate ROI"
               ↓
          [ROI Calculator Page]
          - Input current IT spend
          - See projected savings
          - View breakdown
               ↓
          Decision: Savings compelling?
               ├─ NO → Exit (retarget with case studies)
               └─ YES → Click "Get Custom Quote"
                        ↓
                   [Lead Capture Form]
                   - Name, Email, Phone
                   - Company, Industry
                   - Current challenges
                        ↓
                   [Form Submission]
                        ↓
                   [Success State]
                   - Confirmation message
                   - Next steps explained
                   - Calendar link for consultation
                        ↓
                   [Email Confirmation]
                   - Thank you email
                   - ROI report PDF
                   - Team introduction
                        ↓
                   EXIT: Lead captured ✓
```

### Secondary Flow: Pricing Page Direct

```
Entry Point: Pricing page (from ad or search)
     ↓
[Pricing Table]
  - View 3 tiers (Starter, Pro, Enterprise)
  - Compare features
     ↓
Decision: Tier selected?
     ├─── Unclear → Click "Compare Plans"
     │              ↓
     │         [Comparison Matrix]
     │              ↓
     │         Return to pricing table
     │
     └─── YES → Click "Get Started" or "Contact Sales"
               ↓
          [Tier-Specific Form]
          - Pre-filled with tier selection
          - Customization options (add-ons)
               ↓
          [Quote Generation]
          - Instant pricing breakdown
          - Email quote + PDF
               ↓
          [CTA: Schedule Call]
               ↓
          EXIT: Qualified lead ✓
```

### Tertiary Flow: Service Deep Dive

```
Entry Point: Service page (e.g., CloudEdge Portal)
     ↓
[Hero - Service Overview]
  - Value proposition
  - Key benefits
     ↓
[Scroll Exploration]
  ├─ Features section
  ├─ Use cases
  ├─ Customer testimonials
  ├─ Technical specifications
     ↓
Decision: Want demo?
     ├─── Not yet → Continue learning
     │              ├─ Read case study
     │              ├─ Watch demo video
     │              └─ Download datasheet
     │
     └─── YES → Click "Request Demo"
               ↓
          [Demo Request Form]
          - Contact details
          - Preferred date/time
          - Specific interests
               ↓
          [Calendar Integration]
          - Show available slots
          - Confirm booking
               ↓
          [Confirmation]
          - Calendar invite sent
          - Preparation materials emailed
               ↓
          EXIT: Demo scheduled ✓
```

### Mobile-First Flow: Quick Contact

```
Entry Point: Mobile homepage
     ↓
[Sticky Mobile CTA]
  - Always visible at bottom
  - "Contact Us" or "Get Quote"
     ↓
Click CTA
     ↓
[Mobile Contact Sheet]
  - Slides up from bottom
  - Options:
    ├─ Call Now (tel: link)
    ├─ WhatsApp (if available)
    ├─ Email Form
    └─ Schedule Call
     ↓
User selects option
     ↓
[Action Completed]
  - Instant confirmation
  - Next steps clear
     ↓
EXIT: Contact initiated ✓
```

### Edge Case Flow: Returning Visitor

```
Entry Point: Homepage (returning visitor)
     ↓
[Personalization Check]
  - Cookie/localStorage check
  - Previously viewed services?
     ↓
YES: Show personalized banner
  "Welcome back! Continue exploring [Service]"
  [CTA: Resume] [Dismiss]
     ↓
Decision: Resume?
     ├─ YES → Direct to last viewed page
     └─ NO → Browse normally
               ↓
          Standard homepage experience
```

---

## 3. Loading Experience

### 3.1 Initial Page Load - Innovative Concept

**Concept: "Building Trust" Loading Animation**

```
┌────────────────────────────────────┐
│                                    │
│          [Roaya IT Logo]           │
│                                    │
│        ▓▓▓▓▓▓▓▓▓░░░░░░░ 60%       │
│                                    │
│      Loading your experience...    │
│                                    │
└────────────────────────────────────┘
```

**Animation Sequence (Total: 1.5-2.5s)**

1. **Phase 1 (0-0.5s): Logo Reveal**
   - Roaya IT logo fades in with subtle scale (0.95 → 1.0)
   - Elegant, minimal entrance
   - Color: Brand primary color

2. **Phase 2 (0.5-1.5s): Progress Indicator**
   - Linear progress bar fills (0% → 100%)
   - Smooth easing (cubic-bezier)
   - Color gradient: accent color sweep
   - Loading text cycles through value props:
     - "Loading your experience..."
     - "Preparing transparent pricing..."
     - "Calculating your ROI..."

3. **Phase 3 (1.5-2.0s): Transition**
   - Progress reaches 100%
   - Logo and loader fade out (opacity 1 → 0)
   - Simultaneous: Homepage content fades in
   - Seamless transition, no jarring cuts

**Technical Specifications:**
- Background: Solid color (matches hero background)
- No spinning animations (perceived as slower)
- Linear progress (shows actual load progress)
- Accessible: Announces "Loading" to screen readers
- Minimum display time: 800ms (prevent flash)
- Maximum display time: 3s (then show content regardless)

**Progressive Enhancement:**
- Fast connections (< 1s load): Minimal loader, quick fade
- Slow connections (> 3s load): Show "Taking longer than expected..." message with option to continue

### 3.2 Skeleton Screens

**Homepage Skeleton**

```
┌──────────────────────────────────────────────────┐
│  [▓▓▓]  [░░░░]  [░░░░]  [░░░░]  [░░░░]  [BTN]   │ ← Header
├──────────────────────────────────────────────────┤
│                                                  │
│  [░░░░░░░░░░░░░░░░░░░]                          │ ← Hero H1
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░]                   │ ← Hero subhead
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]               │
│                                                  │
│  [▓▓▓▓ BTN]  [░░░ link]                         │ ← CTAs
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ [ICON]  │  │ [ICON]  │  │ [ICON]  │         │ ← Value props
│  │ [░░░░]  │  │ [░░░░]  │  │ [░░░░]  │
│  │ [░░░░░] │  │ [░░░░░] │  │ [░░░░░] │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Skeleton Animation:**
- Shimmer effect (subtle gradient sweep)
- Color: Light gray (light mode) / Dark gray (dark mode)
- Animation: 1.5s loop, infinite
- Respects `prefers-reduced-motion`

**Component Priorities (Load Order):**

1. **Critical (Above fold, 0-0.5s):**
   - Header structure
   - Hero background/video
   - Hero headline (text)

2. **High Priority (Visible, 0.5-1.5s):**
   - Hero subheadline
   - Primary CTA button
   - Hero image/video playback

3. **Medium Priority (Below fold, 1.5-3s):**
   - Value propositions section
   - Services overview cards
   - Stats section

4. **Low Priority (Lazy load, on scroll):**
   - Testimonials
   - Case study previews
   - Footer content

### 3.3 Perceived Performance Techniques

**Image Loading:**
- Blur-up technique (10% quality placeholder → full image)
- Aspect ratio containers (prevent layout shift)
- Lazy loading (images below fold)
- WebP with JPEG fallback

**Font Loading:**
- `font-display: swap` for custom fonts
- System font stack fallback
- Preload critical fonts (Tajawal for Arabic)

**Code Splitting:**
- Route-based splitting (per page)
- Component-based splitting (heavy components)
- Vendor bundle optimization

**Optimistic UI:**
- Form submissions: Show success state immediately
- Button clicks: Instant visual feedback
- Page transitions: Start animation before load complete

---

## 4. Navigation System

### 4.1 Desktop Header Structure

**Default State (Top of page)**

```
┌────────────────────────────────────────────────────────────────┐
│  Padding: 24px vertical                                        │
│                                                                 │
│  [Logo]    Solutions ▼  Industries ▼  Pricing  Resources ▼    │
│  120px     16px gap between items    About ▼    Contact       │
│  height                                                         │
│                                    [EN/AR] [🌙/☀] [Get Quote] │
│                                    Toggle  Toggle   Button     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Scrolled State (Sticky, after 100px scroll)**

```
┌────────────────────────────────────────────────────────────────┐
│  Padding: 12px vertical  ← Reduced from 24px                   │
│  Box-shadow: 0 2px 8px rgba(0,0,0,0.1)                        │
│  Backdrop-blur: 10px                                           │
│  Background: semi-transparent white/dark                        │
│                                                                 │
│  [Logo]    Solutions ▼  Industries ▼  Pricing  Resources ▼    │
│  80px      ← Smaller logo                   About ▼  Contact  │
│                                                                 │
│                                    [EN/AR] [🌙] [Get Quote]   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- **Position:** `position: sticky; top: 0; z-index: 1000;`
- **Transition:** All changes animated over 200ms (ease-out)
- **Transform Triggers:**
  - Logo size: 120px → 80px height
  - Padding: 24px → 12px vertical
  - Background: transparent → backdrop-blur
  - Shadow: none → subtle shadow

**Navigation Link Hover State:**

```
Default:     Solutions ▼
Hover:       Solutions ▼  ← Underline appears (2px, accent color)
                          ← Text color shifts to accent
```

- Underline slides in from left (100ms)
- Color transition (200ms)
- Dropdown arrow rotates 180deg when menu open

### 4.2 Mega Menu Design

**Solutions Mega Menu (Desktop)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dropdown appears below nav (no gap)                                 │
│  Background: White (light) / Dark surface (dark mode)                │
│  Shadow: 0 8px 24px rgba(0,0,0,0.12)                                │
│  Padding: 40px                                                       │
│                                                                       │
│  ┌────────────────────┬────────────────────┬────────────────────┐   │
│  │  Cloud & Hosting   │  Security          │  Support & Migration│  │
│  │                    │                    │                    │   │
│  │  ● CloudEdge       │  ● SOC Services    │  ● SAP Operations  │   │
│  │    Multi-cloud     │    24/7 monitoring │    Basis mgmt      │   │
│  │    management      │                    │                    │   │
│  │                    │                    │  ● Seamless Migrate│   │
│  │  ● Posta Portal    │                    │    Zero-downtime   │   │
│  │    Enterprise      │                    │                    │   │
│  │    email hosting   │  ● IT Automation   │                    │   │
│  │                    │    AI-powered      │                    │   │
│  └────────────────────┴────────────────────┴────────────────────┘   │
│                                                                       │
│  [View All Solutions →]                                              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Item Structure:**
```
● CloudEdge Portal        ← Bold, 16px, link
  Multi-cloud management  ← Gray, 14px, description
```

**Hover Behavior:**
- Item background: Subtle highlight (5% accent color)
- Cursor: Pointer
- Description: Darker color
- Icon (if present): Slight scale (1.0 → 1.05)

**Animation:**
- Entry: Fade + slide down (200ms, ease-out)
- Exit: Fade out (150ms)
- Items: Stagger cascade (40ms delay each)

### 4.3 Mobile Navigation

**Mobile Header (Default)**

```
┌──────────────────────────────────┐
│  [Logo]              [☰] [EN/AR] │
│                      Menu Toggle │
└──────────────────────────────────┘
```

**Mobile Drawer (Open)**

```
┌──────────────────────────────────┐
│  [×]  Close                       │
│                                   │
│  Solutions                    [›] │  ← Expandable
│  Industries                   [›] │
│  Pricing                          │
│  Resources                    [›] │
│  About                        [›] │
│  Contact                          │
│                                   │
│  ──────────────────────────────   │
│                                   │
│  [EN/AR Toggle]                   │
│  [🌙 Dark Mode Toggle]            │
│                                   │
│  [Get Quote Button]               │
│                                   │
└──────────────────────────────────┘
```

**Drawer Specifications:**

- **Type:** Full-screen overlay (mobile), Side drawer (tablet)
- **Width:** 100% (mobile), 320px (tablet)
- **Position:** Right side (LTR), Left side (RTL)
- **Background:** Solid (white/dark)
- **Animation:** Slide in from right, 250ms
- **Close Triggers:**
  - Close button (×)
  - Click outside drawer
  - Navigation to new page
  - ESC key

**Expandable Section (Solutions Example):**

```
Solutions                     [›]  ← Collapsed
     ↓ (tap to expand)
Solutions                     [v]  ← Expanded
  → CloudEdge Portal
  → Posta Portal
  → SOC Services
  → Seamless Migration
  → SAP Operations
  → IT Automation
```

- Expand/collapse: Smooth height transition (200ms)
- Sub-items: Indent 16px, smaller font (14px)
- Icons: Chevron rotates (90deg → 180deg)

### 4.4 Language Switcher (EN/AR)

**Desktop Toggle**

```
[EN | AR]  ← Default (English selected)
    ↓
[EN | AR]  ← Hover: Highlight AR
    ↓
[EN | AR]  ← Click: Switch to Arabic, flip layout
```

**Specifications:**

- Position: Top-right header
- Style: Text toggle with separator
- Active state: Bold + accent color
- Inactive state: Regular + muted color
- Hover: Underline + color shift
- Click behavior:
  1. Update language state
  2. Trigger RTL/LTR flip (300ms)
  3. Reload text content
  4. Save preference (localStorage)

**Mobile Toggle**

- In mobile drawer
- Full-width button style
- Clear "English | العربية" labels
- Active language highlighted

### 4.5 Dark/Light Mode Toggle

**Desktop Icon Toggle**

```
☀ (Light mode active)  ← Sun icon, yellow
🌙 (Dark mode active)  ← Moon icon, blue/gray
```

**Specifications:**

- Position: Next to language toggle
- Size: 24px × 24px
- Animation on toggle:
  1. Icon rotate + fade (200ms)
  2. Theme colors transition (300ms)
  3. All components update colors
- Persistence: Save to localStorage
- System preference: Respect `prefers-color-scheme`

**Theme Transition:**

```css
/* Smooth color transitions */
transition: background-color 300ms ease,
            color 300ms ease,
            border-color 300ms ease;
```

**No Flash on Load:**
- Detect preference before render
- Inject theme class on `<html>`
- Prevent FOUC (Flash of Unstyled Content)

---

## 5. Hero Section Variants

### 5.1 Homepage Hero - Full Viewport Video

**Layout Structure**

```
┌────────────────────────────────────────────────────────────┐
│  Full viewport height (100vh)                              │
│  Background: Video loop OR static gradient                 │
│  Overlay: Gradient (dark → transparent, 60% opacity)       │
│                                                             │
│  ┌────────────────────────────────┐                        │
│  │  Content Container (centered)  │                        │
│  │                                │                        │
│  │  IT Services That Actually     │  ← H1, 56px (desktop)  │
│  │  Deliver ROI. Guaranteed.      │                        │
│  │                                │                        │
│  │  For CEOs who demand results,  │  ← Subhead, 20px       │
│  │  not excuses. Transparent...   │                        │
│  │                                │                        │
│  │  [Calculate ROI] [View Pricing]│  ← CTAs                │
│  │   Primary         Secondary    │                        │
│  │                                │                        │
│  └────────────────────────────────┘                        │
│                                                             │
│  [Scroll Indicator ↓]  ← Animated, bottom-center          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Content Specifications:**

- **H1:**
  - Font size: 56px (desktop), 36px (tablet), 28px (mobile)
  - Font weight: 700 (bold)
  - Line height: 1.2
  - Color: White (with video) or brand primary
  - Max width: 800px
  - Text shadow: 0 2px 4px rgba(0,0,0,0.3) (if on video)

- **Subheadline:**
  - Font size: 20px (desktop), 18px (tablet), 16px (mobile)
  - Font weight: 400 (regular)
  - Line height: 1.6
  - Color: White 90% opacity or muted text
  - Max width: 600px

- **CTA Buttons:**
  - Primary: Accent color, white text, 48px height
  - Secondary: Transparent bg, white border, white text
  - Gap: 16px between buttons
  - Hover: Scale 1.05, shadow increase
  - Click: Scale 0.98, haptic feedback

**Video Background:**

- **Source:** High-quality 1080p+ video
- **Format:** MP4 (H.264) with WebM fallback
- **Length:** 15-20 second loop
- **Content:** Abstract technology, data flow, or office environment
- **Playback:** Autoplay, muted, loop, no controls
- **Mobile:** Replace with static image (performance)
- **Accessibility:** Hidden from screen readers (`aria-hidden="true"`)

**Animation Sequence (On page load):**

1. **Video/Background (0s):** Fades in
2. **H1 (0.2s delay):** Fade + slide up (20px)
3. **Subheadline (0.4s delay):** Fade + slide up (20px)
4. **CTAs (0.6s delay):** Fade + slide up (20px)
5. **Scroll Indicator (0.8s delay):** Fade in + bounce animation

**Scroll Indicator:**
- Icon: Chevron down or mouse scroll icon
- Animation: Bounce (infinite, 2s cycle)
- Click behavior: Smooth scroll to next section
- Hide on scroll: Fades out after 100px scroll

### 5.2 Service Page Hero - Split Layout

**Layout Structure**

```
┌────────────────────────────────────────────────────────────┐
│  60% viewport height                                        │
│                                                             │
│  ┌──────────────────────┬─────────────────────────────┐   │
│  │ Left: Content        │ Right: Visual               │   │
│  │ (50% width)          │ (50% width)                 │   │
│  │                      │                             │   │
│  │ CloudEdge Portal     │  [Screenshot/Demo]          │   │
│  │ Multi-cloud...       │  OR [Animated graphic]      │   │
│  │                      │  OR [Video preview]         │   │
│  │ [Key Features]       │                             │   │
│  │ ✓ White-label        │                             │   │
│  │ ✓ Multi-tenant       │                             │   │
│  │ ✓ Unlimited...       │                             │   │
│  │                      │                             │   │
│  │ [Request Demo]       │                             │   │
│  │                      │                             │   │
│  └──────────────────────┴─────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**

- **Desktop (1200px+):** Side-by-side 50/50
- **Tablet (768-1199px):** Side-by-side 40/60 (favor visual)
- **Mobile (<768px):** Stacked (content → visual)

**Animation on Load:**

1. Content fades/slides from left
2. Visual fades/slides from right
3. Staggered timing (100ms offset)

### 5.3 Pricing Page Hero - Minimal

**Layout Structure**

```
┌────────────────────────────────────────────────────────────┐
│  30vh height (minimal)                                      │
│  Centered content                                           │
│                                                             │
│  Egypt's First Transparent IT Pricing  ← H1, 48px         │
│                                                             │
│  See exactly what you'll pay. No hidden  ← Subhead, 18px   │
│  fees, no surprises, no negotiations.                      │
│                                                             │
│  [Compare Plans Below ↓]  ← Soft CTA, scrolls to table    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Purpose:** Get users to pricing table quickly, minimal distraction

### 5.4 Industry Page Hero - Background Image

**Layout Structure**

```
┌────────────────────────────────────────────────────────────┐
│  50vh height                                                │
│  Background: Industry-specific image (banking, healthcare) │
│  Overlay: Gradient (dark, 70% opacity)                     │
│                                                             │
│  IT Solutions for Finance & Banking  ← H1, white text     │
│                                                             │
│  Mission-critical infrastructure for banks  ← Subhead      │
│  and financial institutions. Ensure 99.99%                 │
│  uptime with Zero Trust Security.                          │
│                                                             │
│  [View Solutions] [Case Studies]  ← CTAs                   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Image Requirements:**

- High-quality, professional photography
- Contextually relevant (banking interior, hospital, etc.)
- Properly licensed
- Optimized (WebP, max 200KB)

---

## 6. Page Sections Flow

### 6.1 Standard Page Flow (Homepage)

**Section Order & Purpose**

```
1. Hero Section
   ↓ (seamless scroll)
2. Value Propositions (4 cards)
   ↓ (60px gap)
3. Services Overview (6 cards)
   ↓ (80px gap)
4. Stats Section (6 metrics)
   ↓ (60px gap)
5. Trust Signals (Partner logos / Client logos)
   ↓ (80px gap)
6. Testimonials (3 quotes, carousel)
   ↓ (60px gap)
7. Differentiators (4 highlight cards)
   ↓ (80px gap)
8. Final CTA (3-column action blocks)
   ↓ (60px gap)
9. Footer
```

**Section Transitions:**

- Smooth scroll (CSS `scroll-behavior: smooth`)
- Scroll-triggered animations (fade/slide on enter viewport)
- Intersection Observer API for performance
- Respects `prefers-reduced-motion`

### 6.2 Value Propositions Section

**Layout**

```
┌────────────────────────────────────────────────────────────┐
│  Why Egyptian Businesses Choose Roaya IT  ← H2, centered   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │  │
│  │          │  │          │  │          │  │          │  │
│  │ Egypt's  │  │ ROI      │  │ Local +  │  │ Fast 14  │  │
│  │ First... │  │ Calc...  │  │ Global   │  │ Day Impl.│  │
│  │          │  │          │  │          │  │          │  │
│  │ [40 wds] │  │ [40 wds] │  │ [40 wds] │  │ [40 wds] │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Card Specifications:**

- **Grid:** 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Card Height:** Equal height (flexbox)
- **Padding:** 32px
- **Background:** White (light) / Dark surface (dark mode)
- **Border:** 1px subtle gray OR shadow
- **Hover:** Lift effect (shadow increase, translate -4px)
- **Icon:** 64px, accent color, top of card
- **Title:** 18px, bold, 2 lines max
- **Description:** 14px, regular, 4 lines max

**Animation (Scroll trigger):**

- Cards fade + slide up, staggered (100ms delay each)
- Trigger point: 20% of section visible

### 6.3 Services Overview Cards

**Layout**

```
┌────────────────────────────────────────────────────────────┐
│  Comprehensive IT Services for Egyptian Businesses  ← H2   │
│  From startups to enterprises—we scale with your growth    │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ Cloud  │  │ Email  │  │ Cyber  │  ← Row 1 (3 cards)    │
│  └────────┘  └────────┘  └────────┘                       │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ Migrate│  │  SAP   │  │ Auto   │  ← Row 2 (3 cards)    │
│  └────────┘  └────────┘  └────────┘                       │
└────────────────────────────────────────────────────────────┘
```

**Card Structure (Individual)**

```
┌────────────────────────┐
│  [Icon - 48px]         │
│                        │
│  Cloud Infrastructure  │  ← Title, 18px bold
│  Management            │
│                        │
│  Reduce infrastructure │  ← Description, 14px
│  costs by up to 40%    │     3 lines, truncate
│  with scalable cloud...│
│                        │
│  Lower costs, higher   │  ← Outcome, 12px, accent
│  flexibility, zero...  │
│                        │
│  [Explore Cloud →]     │  ← Link, accent color
└────────────────────────┘
```

**Responsive Grid:**

- Desktop (1200px+): 3 columns
- Tablet (768-1199px): 2 columns
- Mobile (<768px): 1 column (stacked)

**Hover Effect:**

1. Card lifts (translateY: -8px)
2. Shadow increases
3. Icon color shifts (primary → accent)
4. Link underlines
5. Transition: 200ms ease-out

### 6.4 Stats Section

**Layout**

```
┌────────────────────────────────────────────────────────────┐
│  Background: Accent color (light) OR dark surface          │
│  Padding: 80px vertical                                    │
│                                                             │
│  Results That Speak for Themselves  ← H2, centered         │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │   40%   │  │  99.9%  │  │  200+   │  ← Row 1           │
│  │ Average │  │ Uptime  │  │Egyptian │                    │
│  │  Cost   │  │Guarantee│  │Business │                    │
│  │Reduction│  │         │  │ Served  │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │  24/7   │  │ 14 Days │  │  150+   │  ← Row 2           │
│  │  Local  │  │ Average │  │Success  │                    │
│  │ Support │  │  Impl.  │  │Migrates │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Stat Card Structure:**

```
40%              ← Number, 48px, bold, accent color
Average Cost     ← Label, 16px, regular
Reduction        ← Label continued
For clients who  ← Context, 12px, muted
migrated to...   ← (optional)
```

**Animation (Count-up on scroll):**

- Trigger: Section 50% visible
- Effect: Numbers animate from 0 to target value
- Duration: 1.5s
- Easing: ease-out
- One-time (no repeat on re-scroll)

### 6.5 Trust Signals (Client Logos)

**Layout**

```
┌────────────────────────────────────────────────────────────┐
│  Trusted by 200+ Egyptian Businesses  ← H3, centered       │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │  │
│  │  1   │ │  2   │ │  3   │ │  4   │ │  5   │ │  6   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │  │
│  │  7   │ │  8   │ │  9   │ │  10  │ │  11  │ │  12  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
└────────────────────────────────────────────────────────────┘
```

**Logo Specifications:**

- Size: 120px × 60px container (logos scale to fit)
- Format: SVG (preferred) or PNG with transparency
- Color: Grayscale (light mode), white (dark mode)
- Hover: Full color + slight scale (1.1)
- Filter: `grayscale(100%)` → `grayscale(0%)` on hover

**Responsive:**

- Desktop: 6 columns
- Tablet: 4 columns
- Mobile: 3 columns

### 6.6 Testimonials Section

**Layout (Carousel)**

```
┌────────────────────────────────────────────────────────────┐
│  Trusted by Egyptian IT Leaders  ← H2, centered            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  "Roaya IT's transparent pricing and ROI calculator  │ │
│  │  helped us secure board approval in one meeting...   │ │
│  │  We're actually saving 47%."                         │ │
│  │                                                       │ │
│  │  Ahmed Hassan, IT Director                           │ │
│  │  National Bank of Egypt                              │ │
│  │  Banking & Financial Services                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  [• ○ ○]  ← Pagination dots                               │
│  [← →]    ← Navigation arrows                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Carousel Specifications:**

- **Display:** 1 testimonial at a time (focus attention)
- **Auto-play:** 7 seconds per slide, pauses on hover
- **Navigation:**
  - Dots: Click to jump to slide
  - Arrows: Previous/Next
  - Keyboard: Arrow keys, Tab (accessibility)
  - Touch: Swipe left/right (mobile)
- **Transition:** Fade (300ms) OR slide horizontal (400ms)
- **Accessibility:**
  - ARIA live region
  - Pause button (play/pause)
  - Respects `prefers-reduced-motion`

**Testimonial Card:**

- Max width: 800px (centered)
- Quote: 20px, italic, dark text
- Attribution: 16px, bold (name), regular (title/company)
- Industry tag: 12px, accent color, pill shape

### 6.7 Final CTA Section

**Layout (3-Column)**

```
┌────────────────────────────────────────────────────────────┐
│  Ready to Transform Your IT Infrastructure?  ← H2          │
│  See pricing, calculate ROI, or schedule consultation      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ View        │  │ Calculate   │  │ Schedule    │       │
│  │ Transparent │  │ Your ROI    │  │ Consultation│       │
│  │ Pricing     │  │             │  │             │       │
│  │             │  │             │  │             │       │
│  │ See our     │  │ Estimate    │  │ Talk to our │       │
│  │ Starter,    │  │ cost savings│  │ Egyptian    │       │
│  │ Pro, and    │  │ and prod... │  │ team about  │       │
│  │ Enterprise  │  │             │  │ your spec...│       │
│  │ tiers...    │  │             │  │             │       │
│  │             │  │             │  │             │       │
│  │ [View       │  │ [Calculate  │  │ [Book a     │       │
│  │  Pricing]   │  │  ROI]       │  │  Call]      │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
```

**Card Specifications:**

- Equal height containers
- Centered content
- Icon at top (48px)
- Headline (20px bold)
- Description (14px, 3-4 lines)
- Button (full width, primary style)

**Responsive:**

- Desktop: 3 columns
- Tablet: 3 columns (smaller padding)
- Mobile: Stacked (1 column)

---

## 7. Interaction States

### 7.1 Button States

**Primary Button (e.g., "Calculate ROI")**

| State | Background | Text Color | Border | Shadow | Transform | Cursor |
|-------|-----------|-----------|--------|--------|-----------|--------|
| **Default** | Accent color | White | None | 0 2px 4px rgba | none | default |
| **Hover** | Accent +10% darker | White | None | 0 4px 12px rgba | scale(1.02) | pointer |
| **Active** | Accent +20% darker | White | None | 0 1px 2px rgba | scale(0.98) | pointer |
| **Focus** | Accent color | White | 2px outline (accent) | 0 2px 4px rgba | none | pointer |
| **Loading** | Accent color | Transparent | None | 0 2px 4px rgba | none | wait |
| **Success** | Green | White | None | 0 2px 4px rgba | none | default |
| **Disabled** | Gray | White 50% | None | None | none | not-allowed |

**Loading State Visual:**

```
┌──────────────────────────┐
│  [●○○] Calculating...    │  ← Spinning dots animation
└──────────────────────────┘
```

**Success State Visual:**

```
┌──────────────────────────┐
│  [✓] Submitted!          │  ← Checkmark + confirmation
└──────────────────────────┘
```

**Secondary Button (e.g., "View Pricing")**

| State | Background | Text Color | Border | Shadow | Transform |
|-------|-----------|-----------|--------|--------|-----------|
| **Default** | Transparent | Accent color | 2px accent | None | none |
| **Hover** | Accent 10% opacity | Accent color | 2px accent | 0 2px 8px rgba | none |
| **Active** | Accent 20% opacity | Accent color | 2px accent | None | scale(0.98) |
| **Focus** | Transparent | Accent color | 2px accent + outline | None | none |

### 7.2 Form Input States

**Text Input Field**

| State | Border | Background | Label | Helper Text | Icon |
|-------|--------|-----------|--------|-------------|------|
| **Default** | 1px gray | White | Gray | Muted | None |
| **Hover** | 1px darker gray | White | Gray | Muted | None |
| **Focus** | 2px accent | White | Accent color | Muted | None |
| **Filled (valid)** | 1px gray | White | Accent color | Muted | Green ✓ |
| **Error** | 2px red | White | Red | Red message | Red ✗ |
| **Disabled** | 1px light gray | Gray bg | Light gray | Muted | None |

**Visual Examples:**

```
Default:
┌────────────────────────────┐
│ Email Address              │  ← Placeholder
└────────────────────────────┘

Focus:
┌════════════════════════════┐  ← Thicker accent border
│ user@example.com█          │
└════════════════════════════┘

Error:
┌────────────────────────────┐  ← Red border
│ invalid-email              │
└────────────────────────────┘
  ✗ Please enter a valid email address
```

**Focus Behavior:**

- Outline: 2px accent color border (no native outline)
- Label: Moves up and shrinks (if floating label)
- Placeholder: Fades out (opacity 1 → 0)
- Helper text: Fades in if not visible

**Error Animation:**

1. Border turns red (200ms)
2. Input shakes horizontally (3px, 3 iterations, 300ms)
3. Error message fades in below (200ms)
4. Error icon appears (fade + scale)

### 7.3 Card Hover States

**Service Card**

| State | Shadow | Transform | Border | Background | Icon |
|-------|--------|-----------|--------|-----------|------|
| **Default** | 0 2px 8px rgba | none | 1px gray | White | Static |
| **Hover** | 0 8px 24px rgba | translateY(-8px) | 1px gray | White | Color shift |
| **Active** | 0 4px 12px rgba | translateY(-4px) | 1px gray | White | Color shift |

**Transition Timing:**

```css
transition: transform 200ms ease-out,
            box-shadow 200ms ease-out,
            border-color 200ms ease-out;
```

**Icon Animation on Hover:**

- Color: Gray → Accent color (200ms)
- Scale: 1.0 → 1.1 (200ms)
- Optional: Slight rotation (5deg) for playful effect

### 7.4 Navigation Link States

**Desktop Nav Link**

| State | Text Color | Underline | Background | Transform |
|-------|-----------|-----------|-----------|-----------|
| **Default** | Dark text | None | Transparent | none |
| **Hover** | Accent color | 2px accent (bottom) | Transparent | none |
| **Active** | Accent color | 2px accent (bottom) | Transparent | none |
| **Focus** | Accent color | 2px accent + outline | Transparent | none |

**Underline Animation:**

- Slides in from left to right (150ms)
- `transform: scaleX(0)` → `scaleX(1)`
- `transform-origin: left`

**Dropdown Toggle (chevron icon):**

- Default: Rotated 0deg
- Menu open: Rotated 180deg (200ms)

### 7.5 Loading States

**Page Transition Loading**

```
┌────────────────────────────────────┐
│  [Linear progress bar at top]     │  ← 2px height, accent color
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░   │  ← Animated fill (indeterminate)
└────────────────────────────────────┘
```

**Component Loading (Skeleton)**

- Replaces component with gray placeholder
- Shimmer animation (1.5s loop)
- Maintains layout dimensions

**Button Loading (Spinner)**

```
[Calculate ROI]  ← Default
      ↓
[●○○ Calculating...] ← Loading (spinning dots)
      ↓
[✓ Submitted!]  ← Success (brief, then reset or navigate)
```

### 7.6 Empty States

**No Search Results**

```
┌────────────────────────────────────┐
│         [🔍 Icon - 64px]           │
│                                    │
│  No results found for "hosting"   │  ← Headline, 24px
│                                    │
│  Try different keywords or browse  │  ← Helper, 16px
│  our services below                │
│                                    │
│  [Browse All Services]             │  ← CTA
└────────────────────────────────────┘
```

**No Blog Posts (Category)**

```
┌────────────────────────────────────┐
│         [📄 Icon - 64px]           │
│                                    │
│  No posts in this category yet    │
│                                    │
│  Check back soon or explore other  │
│  categories                        │
│                                    │
│  [View All Posts]                  │
└────────────────────────────────────┘
```

### 7.7 Success States

**Form Submission Success**

```
┌────────────────────────────────────┐
│         [✓ Icon - 64px, green]     │
│                                    │
│  Thank You! Request Submitted      │  ← Headline
│                                    │
│  Our team will contact you within  │  ← Message
│  24 hours. Check your email for    │
│  confirmation.                     │
│                                    │
│  [Return to Homepage]              │  ← CTA
└────────────────────────────────────┘
```

**Animation:**

1. Checkmark draws in (SVG path animation, 400ms)
2. Green circle expands behind checkmark (300ms)
3. Text fades in (200ms, staggered)

### 7.8 Error States

**Form Submission Error**

```
┌────────────────────────────────────┐
│         [✗ Icon - 64px, red]       │
│                                    │
│  Submission Failed                 │  ← Headline
│                                    │
│  Something went wrong. Please try  │  ← Message
│  again or contact support.         │
│                                    │
│  [Try Again] [Contact Support]     │  ← CTAs
└────────────────────────────────────┘
```

**Page Error (404)**

```
┌────────────────────────────────────┐
│              404                   │  ← Large, bold
│                                    │
│  Page Not Found                    │  ← Headline
│                                    │
│  The page you're looking for       │  ← Message
│  doesn't exist or has been moved.  │
│                                    │
│  [Go to Homepage] [Browse Services]│  ← CTAs
└────────────────────────────────────┘
```

---

## 8. RTL Considerations

### 8.1 Layout Mirroring Rules

**What MUST Mirror (Flip Horizontally):**

✅ **Text Alignment:**
- Left-aligned → Right-aligned
- Right-aligned → Left-aligned
- Paragraph text direction

✅ **Navigation:**
- Menu order (reverse)
- Breadcrumbs (reverse direction)
- Pagination (Previous/Next swap)

✅ **Icons with Directionality:**
- Arrows: → becomes ←
- Chevrons: › becomes ‹
- Back/Forward buttons

✅ **Layouts:**
- Sidebar positions (left ↔ right)
- Image + text blocks (flip order)
- Multi-column layouts (reverse column order)

**What MUST NOT Mirror:**

❌ **Media:**
- Photos and images (keep original orientation)
- Videos (keep original orientation)
- Logos (brand consistency)

❌ **Icons without Directionality:**
- Checkmarks ✓
- Close icons ✗
- Social media icons
- Search icons 🔍

❌ **Numerical Data:**
- Graphs and charts (data integrity)
- Timelines (chronological left→right)
- Phone numbers, dates (international format)

❌ **Code and Technical Content:**
- Code snippets (left-to-right)
- URLs (left-to-right)
- Email addresses

### 8.2 Implementation Approach

**HTML Structure:**

```html
<!-- English (LTR) -->
<html lang="en" dir="ltr">

<!-- Arabic (RTL) -->
<html lang="ar" dir="rtl">
```

**CSS Strategy:**

```css
/* Logical properties (auto-flip) */
.card {
  margin-inline-start: 16px; /* Becomes margin-right in RTL */
  padding-inline: 24px;      /* Horizontal padding, auto-flips */
  border-inline-start: 2px solid; /* Left border (LTR), right (RTL) */
}

/* Manual flip for specific cases */
[dir="rtl"] .arrow-icon {
  transform: scaleX(-1); /* Horizontal flip */
}

/* Grid order reversal */
[dir="rtl"] .grid {
  direction: rtl; /* Reverses flex/grid order */
}
```

**Flexbox RTL:**

```css
.flex-container {
  display: flex;
  flex-direction: row; /* Auto-reverses in RTL */
}

/* Explicit control if needed */
[dir="rtl"] .flex-container {
  flex-direction: row-reverse;
}
```

### 8.3 Typography for Arabic

**Font Selection:**

- **Primary:** Tajawal (Google Fonts)
- **Fallback:** System Arabic fonts (SF Arabic, Segoe UI Arabic)

**Font Sizes (Adjusted for Arabic):**

- Arabic text often needs +2px for equivalent readability
- Line height: 1.7-1.8 (vs 1.5-1.6 for Latin)

**Example:**

```css
/* English */
body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

/* Arabic */
[lang="ar"] body {
  font-family: 'Tajawal', sans-serif;
  font-size: 18px;        /* +2px */
  line-height: 1.7;       /* +0.2 */
}
```

### 8.4 Component Adaptations

**Navigation Menu (RTL)**

```
LTR:  [Logo]  Home  Solutions  Pricing  [CTA]
                                              ↓
RTL:  [CTA]  Pricing  Solutions  Home  [Logo]
```

**Breadcrumbs (RTL)**

```
LTR:  Home › Solutions › CloudEdge
                                 ↓
RTL:  CloudEdge ‹ Solutions ‹ Home
```

**Forms (RTL)**

- Labels: Right-aligned
- Input fields: Right-aligned text
- Icons: Right side of input (not left)
- Error messages: Right-aligned

**Cards (RTL)**

```
LTR Layout:
┌────────────────┐
│ [Icon]  Title  │
│         Desc   │
└────────────────┘

RTL Layout:
┌────────────────┐
│  Title  [Icon] │
│   Desc         │
└────────────────┘
```

### 8.5 Animation Direction Changes

**Slide-in Animations:**

```css
/* LTR: Slide from left */
@keyframes slideInLTR {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* RTL: Slide from right */
@keyframes slideInRTL {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Apply based on direction */
.slide-in {
  animation: slideInLTR 300ms;
}

[dir="rtl"] .slide-in {
  animation: slideInRTL 300ms;
}
```

**Carousel Navigation:**

- Next button: Right (LTR) → Left (RTL)
- Previous button: Left (LTR) → Right (RTL)
- Swipe direction: Reverse in RTL

### 8.6 Testing Checklist

**Visual Inspection:**

- [ ] All text is right-aligned
- [ ] Navigation menu is reversed
- [ ] Arrows and chevrons point correctly
- [ ] Layouts are mirrored (sidebar, columns)
- [ ] Forms are right-aligned
- [ ] Buttons are positioned correctly
- [ ] Images are NOT mirrored (unless intentional)

**Functional Testing:**

- [ ] Language toggle works
- [ ] Navigation links work
- [ ] Forms submit correctly
- [ ] Carousel swipe direction is correct
- [ ] Keyboard navigation (Tab order) is correct
- [ ] Screen reader announces RTL correctly

---

## 9. Micro-interactions

### 9.1 Scroll-Triggered Animations

**Fade In on Scroll**

- **Trigger:** Element enters viewport (50% visible)
- **Effect:** Opacity 0 → 1, translateY(20px) → 0
- **Duration:** 400ms
- **Easing:** ease-out
- **Stagger:** 100ms delay per item (for lists)

**Implementation:**

```javascript
// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target); // One-time animation
    }
  });
}, observerOptions);
```

**CSS:**

```css
.fade-in-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}

.fade-in-scroll.animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

### 9.2 Button Feedback

**Click Ripple Effect**

```
User clicks button
     ↓
Circle expands from click point
     ↓
Fades out as it expands
     ↓
Button action executes
```

**Specifications:**

- Duration: 600ms
- Easing: ease-out
- Color: White (20% opacity on dark bg), Black (10% on light)
- Effect: Scale 0 → 4, Opacity 0.3 → 0

**Haptic Feedback (Mobile):**

```javascript
// Vibration API for mobile button clicks
button.addEventListener('click', () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // 10ms vibration
  }
});
```

### 9.3 Form Interactions

**Input Focus Animation**

```
User clicks input field
     ↓
Border thickens (1px → 2px)
Border color changes (gray → accent)
     ↓
Label slides up and shrinks (if floating label)
     ↓
Placeholder fades out
```

**Timing:**

- Border: 200ms ease-out
- Label: 200ms ease-out
- Placeholder: 150ms ease-out

**Input Validation (Real-time)**

```
User types in email field
     ↓
On blur (or after 500ms pause):
  Validate format
     ↓
  Valid: Green checkmark appears (right side)
  Invalid: Red X appears + error message below
```

**Success Animation:**

1. Checkmark icon fades + scales in (200ms)
2. Input border briefly flashes green (300ms)
3. Checkmark remains visible

**Error Animation:**

1. Input shakes (horizontal, 3px, 3 times, 300ms)
2. Border turns red (200ms)
3. Error message fades in below (200ms)
4. Error icon appears (200ms)

### 9.4 Page Transitions

**Page Change Animation**

```
User clicks navigation link
     ↓
Current page content fades out (200ms)
     ↓
Linear progress bar appears at top (indeterminate)
     ↓
New page loads
     ↓
New page content fades in (300ms)
     ↓
Progress bar completes and fades out
```

**Specifications:**

- Fade out: opacity 1 → 0, 200ms
- Fade in: opacity 0 → 1, 300ms
- Stagger: Hero first, then sections (100ms delay)
- Scroll position: Reset to top (smooth)

**Route Change (SPA):**

```css
/* Exit animation */
.page-exit {
  animation: fadeOut 200ms forwards;
}

/* Enter animation */
.page-enter {
  animation: fadeIn 300ms forwards;
}

@keyframes fadeOut {
  to { opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 9.5 Hover Micro-interactions

**Link Hover (Underline Slide)**

```
Default: Solutions (no underline)
         ↓
Hover:   Solutions
         ▔▔▔▔▔▔▔▔  ← Underline slides in from left
```

**Animation:**

```css
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 150ms ease-out;
}

a:hover::after {
  transform: scaleX(1);
}
```

**Card Hover (Lift + Shadow)**

```
Default: Card sits flat (shadow: 0 2px 8px)
         ↓
Hover:   Card lifts up (translateY: -8px, shadow: 0 8px 24px)
```

**Icon Hover (Color Shift + Scale)**

```
Default: Icon gray, scale 1.0
         ↓
Hover:   Icon accent color, scale 1.1, rotate 5deg (optional)
```

### 9.6 Loading Micro-animations

**Skeleton Shimmer**

```
┌────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░ │  ← Gray rectangle
│   ▓▓                   │  ← Shimmer gradient sweeps left→right
│     ▓▓                 │  ← Infinite loop, 1.5s
│       ▓▓               │
└────────────────────────┘
```

**CSS:**

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Spinner (Button Loading)**

```
●○○  ← Dot 1 visible
○●○  ← Dot 2 visible (rotate 120deg)
○○●  ← Dot 3 visible (rotate 240deg)
```

**Animation:**

- 3 dots in a circle
- Each dot fades in/out sequentially
- Duration: 1.2s loop
- Easing: ease-in-out

### 9.7 Notification Toast

**Appearance:**

```
┌─────────────────────────────┐
│ [✓] Message sent successfully│  ← Slides in from top-right
└─────────────────────────────┘
```

**Animation Sequence:**

1. **Entry (300ms):** Slide down + fade in from top
2. **Display (3s):** Visible
3. **Exit (200ms):** Fade out

**Positioning:**

- Desktop: Top-right, 24px from edges
- Mobile: Top-center, full width (minus 16px margins)

**Variants:**

- Success: Green background, checkmark icon
- Error: Red background, X icon
- Info: Blue background, info icon
- Warning: Yellow background, warning icon

### 9.8 Scroll Progress Indicator

**Visual:**

```
┌────────────────────────────────────────────────────────┐
│ [Header - Sticky]                                      │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Progress bar
└────────────────────────────────────────────────────────┘
```

**Specifications:**

- Position: Fixed, top of viewport (below sticky header)
- Height: 3px
- Color: Accent color
- Width: Percentage of page scrolled
- Updates: On scroll (throttled to 16ms for 60fps)

**Implementation:**

```javascript
window.addEventListener('scroll', throttle(() => {
  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = `${scrollPercent}%`;
}, 16));
```

---

## 10. Accessibility Specifications

### 10.1 Keyboard Navigation

**Tab Order:**

1. Skip to main content link (visible on focus)
2. Logo (focusable, links to home)
3. Primary navigation (left to right)
4. Language toggle
5. Theme toggle
6. CTA button
7. Main content (hero CTA, then sections top→bottom)
8. Footer navigation

**Focus Indicators:**

- Visible outline: 2px solid accent color
- Offset: 2px from element
- Never remove outline (accessibility requirement)
- Custom focus styles for all interactive elements

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| Tab | Next focusable element |
| Shift + Tab | Previous focusable element |
| Enter | Activate link/button |
| Space | Activate button, scroll page |
| Esc | Close modal, dropdown, drawer |
| Arrow keys | Navigate carousel, dropdown menu items |
| Home | Jump to top of page |
| End | Jump to bottom of page |

**Dropdown Menu Keyboard:**

- Arrow down: Open menu, move to next item
- Arrow up: Move to previous item
- Enter: Select item
- Esc: Close menu
- Tab: Close menu, move to next nav item

### 10.2 Screen Reader Support

**ARIA Labels and Roles:**

```html
<!-- Navigation -->
<nav aria-label="Primary navigation">
  <ul role="list">
    <li role="listitem">
      <a href="/solutions" aria-haspopup="true" aria-expanded="false">
        Solutions
      </a>
    </li>
  </ul>
</nav>

<!-- Carousel -->
<div role="region" aria-label="Customer testimonials" aria-live="polite">
  <div role="group" aria-roledescription="slide" aria-label="1 of 3">
    <blockquote>...</blockquote>
  </div>
</div>

<!-- Form -->
<form aria-label="Contact form">
  <label for="email">Email Address</label>
  <input
    type="email"
    id="email"
    name="email"
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert" aria-live="assertive"></span>
</form>

<!-- Button with icon -->
<button aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

**Live Regions:**

```html
<!-- Toast notifications -->
<div role="status" aria-live="polite" aria-atomic="true">
  Message sent successfully
</div>

<!-- Form errors -->
<div role="alert" aria-live="assertive">
  Please enter a valid email address
</div>

<!-- Loading state -->
<div role="status" aria-live="polite" aria-busy="true">
  Loading content...
</div>
```

**Skip Links:**

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Visible only on focus -->
<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-color);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}
</style>
```

### 10.3 Visual Accessibility

**Color Contrast:**

- WCAG AA minimum: 4.5:1 (normal text), 3:1 (large text 18px+)
- WCAG AAA goal: 7:1 (normal text), 4.5:1 (large text)

**Contrast Checks:**

| Element | Foreground | Background | Ratio | Status |
|---------|-----------|-----------|-------|--------|
| Body text | #1a1a1a | #ffffff | 16.5:1 | AAA ✓ |
| Muted text | #6b6b6b | #ffffff | 5.7:1 | AA ✓ |
| Link text | #0066cc | #ffffff | 8.2:1 | AAA ✓ |
| Button (primary) | #ffffff | #0066cc | 8.2:1 | AAA ✓ |
| Error text | #c41e3a | #ffffff | 6.1:1 | AA ✓ |

**Never Rely on Color Alone:**

❌ **Bad:** "Fields in red are required"
✅ **Good:** "Fields marked with * are required" + red color

❌ **Bad:** Green/red for success/error only
✅ **Good:** Icons (✓/✗) + color + text

**Focus Indicators:**

- Always visible (never `outline: none` without replacement)
- High contrast (3:1 minimum against background)
- Sufficient thickness (2px minimum)

**Touch Targets:**

- Minimum size: 44px × 44px (WCAG 2.1 AA)
- Spacing: 8px minimum between targets
- Mobile: Increase to 48px × 48px when possible

**Text Size:**

- Minimum: 16px body text (18px for Arabic)
- Scalable: Users can zoom to 200% without loss of content
- Line height: 1.5 minimum (1.7 for Arabic)
- Line length: 80 characters maximum for readability

### 10.4 Reduced Motion

**Respect User Preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Disable parallax */
  .parallax {
    background-attachment: scroll;
  }

  /* Disable carousel auto-play */
  .carousel {
    animation-play-state: paused;
  }
}
```

**What to Disable:**

- Parallax scrolling
- Auto-playing carousels
- Hover animations (except color/underline)
- Page transition animations
- Scroll-triggered animations
- Skeleton shimmer effects

**What to Keep:**

- Instant state changes (still show, no animation)
- Loading indicators (static or minimal)
- Focus indicators
- Error/success states (instant, no animation)

### 10.5 Semantic HTML

**Proper Structure:**

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Roaya IT - Egypt's First Transparent IT Services</title>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header role="banner">
    <nav aria-label="Primary navigation">...</nav>
  </header>

  <main id="main-content" role="main">
    <article>
      <h1>Page Title</h1>
      <section aria-labelledby="section1-heading">
        <h2 id="section1-heading">Section Title</h2>
        ...
      </section>
    </article>
  </main>

  <aside role="complementary" aria-label="Related content">...</aside>

  <footer role="contentinfo">...</footer>
</body>
</html>
```

**Heading Hierarchy:**

- One H1 per page (page title)
- H2 for major sections
- H3 for subsections
- Never skip levels (H2 → H4)
- Logical order (screen reader navigation)

---

## 11. Responsive Behavior

### 11.1 Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (Mobile portrait) */
/* Default: 0-599px */

/* Small (Mobile landscape, small tablets) */
@media (min-width: 600px) { }

/* Medium (Tablets) */
@media (min-width: 900px) { }

/* Large (Desktop) */
@media (min-width: 1200px) { }

/* Extra Large (Large desktop) */
@media (min-width: 1536px) { }
```

### 11.2 Layout Adaptations

**Grid Columns:**

| Breakpoint | Columns | Gutter | Margin |
|-----------|---------|--------|--------|
| XS (0-599px) | 4 | 16px | 16px |
| SM (600-899px) | 8 | 16px | 24px |
| MD (900-1199px) | 12 | 24px | 32px |
| LG (1200-1535px) | 12 | 24px | 40px |
| XL (1536px+) | 12 | 24px | 40px |

**Container Max Widths:**

```css
.container {
  width: 100%;
  padding-inline: 16px; /* Mobile */
  margin-inline: auto;
}

@media (min-width: 600px) {
  .container { padding-inline: 24px; }
}

@media (min-width: 900px) {
  .container {
    max-width: 1280px;
    padding-inline: 32px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1440px;
    padding-inline: 40px;
  }
}
```

### 11.3 Component Responsiveness

**Navigation:**

- Mobile (<900px): Hamburger menu → Drawer
- Desktop (900px+): Horizontal nav → Mega menu

**Hero:**

- Mobile: H1 28px, subhead 16px, stacked CTAs
- Tablet: H1 36px, subhead 18px, side-by-side CTAs
- Desktop: H1 56px, subhead 20px, side-by-side CTAs

**Card Grids:**

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns (depending on content)

**Images:**

```html
<picture>
  <source media="(min-width: 900px)" srcset="hero-desktop.webp">
  <source media="(min-width: 600px)" srcset="hero-tablet.webp">
  <img src="hero-mobile.webp" alt="Description">
</picture>
```

### 11.4 Typography Scale

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | 28px / 1.2 | 36px / 1.2 | 56px / 1.2 |
| H2 | 24px / 1.3 | 28px / 1.3 | 36px / 1.3 |
| H3 | 20px / 1.4 | 22px / 1.4 | 24px / 1.4 |
| H4 | 18px / 1.4 | 18px / 1.4 | 20px / 1.4 |
| Body | 16px / 1.6 | 16px / 1.6 | 18px / 1.6 |
| Small | 14px / 1.5 | 14px / 1.5 | 14px / 1.5 |

*(Font size / Line height)*

### 11.5 Touch Optimization

**Mobile Interactions:**

- Swipe gestures (carousels, drawers)
- Pull-to-refresh (optional)
- Touch ripple effects
- Haptic feedback (vibration API)
- Sticky CTAs (bottom of screen)

**Tap Targets:**

- Minimum: 44px × 44px
- Preferred: 48px × 48px
- Spacing: 8px minimum

**Mobile-Specific Components:**

```
Sticky Bottom CTA Bar (Mobile only):
┌────────────────────────────────────┐
│  Content area (scrollable)         │
│                                    │
│                                    │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│  [Get Quote] [Call Now]            │  ← Sticky, always visible
└────────────────────────────────────┘
```

---

## 12. Animation Choreography

### 12.1 Global Timing Functions

**Standard Easing:**

```css
/* Use for most animations */
--ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Use for entrances */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Use for exits */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Spring-like (playful) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Duration Standards:**

- **Instant:** 100ms (color changes, simple state changes)
- **Quick:** 200ms (hover effects, focus states)
- **Standard:** 300ms (most transitions, modal open/close)
- **Slow:** 400-500ms (page transitions, complex animations)

### 12.2 Page Load Animation Sequence

**Homepage Entry Choreography:**

```
0ms:    Background loads (video or gradient)
        ↓
200ms:  H1 fades in + slides up (400ms duration)
        ↓
400ms:  Subheadline fades in + slides up (400ms)
        ↓
600ms:  Primary CTA fades in + slides up (400ms)
        ↓
700ms:  Secondary CTA fades in + slides up (400ms)
        ↓
800ms:  Scroll indicator fades in + bounce animation
        ↓
1200ms: All hero animations complete
```

**Scroll-Triggered Sections:**

```
Section enters viewport (50% visible)
        ↓
0ms:    First card/item animates (fade + slide, 400ms)
        ↓
100ms:  Second card animates (staggered)
        ↓
200ms:  Third card animates
        ↓
300ms:  Fourth card animates
        ↓
700ms:  All items visible
```

### 12.3 Transition Patterns

**AWS-Inspired Subtle Animations:**

- Duration: 200-300ms (fast, not distracting)
- Easing: ease-out (feels responsive)
- Property: transform + opacity (performant, GPU-accelerated)
- Avoid: width/height animations (causes reflow)

**Example:**

```css
/* Card hover - AWS style */
.card {
  transition: transform 200ms ease-out,
              box-shadow 200ms ease-out;
}

.card:hover {
  transform: translateY(-4px); /* Subtle lift */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12); /* Soft shadow */
}
```

### 12.4 Performance Considerations

**GPU-Accelerated Properties:**

✅ **Use these (performant):**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (use sparingly)

❌ **Avoid these (cause reflow/repaint):**
- `width`, `height`
- `top`, `left`, `right`, `bottom` (unless `position: fixed/absolute`)
- `margin`, `padding`

**Will-Change Hint:**

```css
/* Tell browser to optimize for animation */
.card:hover {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.card {
  will-change: auto;
}
```

**Reduce Motion:**

Always respect user preference:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation

- [ ] Information architecture finalized
- [ ] Navigation structure implemented (desktop + mobile)
- [ ] Loading experience coded (logo animation, skeleton screens)
- [ ] Hero sections created (all variants)
- [ ] Responsive breakpoints configured
- [ ] Dark/Light mode toggle functional
- [ ] Language switcher (EN/AR) functional

### Phase 2: Interactions

- [ ] All button states defined and styled
- [ ] Form validation (real-time, accessible)
- [ ] Hover effects (cards, links, buttons)
- [ ] Loading states (spinners, skeletons, progress bars)
- [ ] Empty states designed and implemented
- [ ] Success/Error states implemented
- [ ] Toast notifications functional

### Phase 3: Accessibility

- [ ] Keyboard navigation complete (Tab order, focus indicators)
- [ ] Screen reader support (ARIA labels, live regions)
- [ ] Color contrast verified (WCAG AA minimum)
- [ ] Touch targets sized correctly (44px minimum)
- [ ] Reduced motion preference respected
- [ ] Semantic HTML structure validated

### Phase 4: RTL & Localization

- [ ] RTL layout mirroring functional
- [ ] Arabic typography (Tajawal font) loaded
- [ ] Component adaptations (forms, navigation, cards)
- [ ] Animation directions reversed for RTL
- [ ] Content translated and tested in both languages

### Phase 5: Polish

- [ ] Scroll-triggered animations implemented
- [ ] Page transitions smooth
- [ ] Micro-interactions added (ripples, hover effects)
- [ ] Performance optimized (lazy loading, code splitting)
- [ ] Cross-browser testing complete
- [ ] Mobile touch interactions optimized

---

## Technical Specifications Summary

**Framework:** Angular v21 (Standalone Components)
**UI Library:** shadcn UI (Tailwind CSS)
**Animation:** CSS Transitions + Intersection Observer API
**Accessibility:** WCAG 2.1 AA compliance
**Performance Target:** < 2.5s LCP, > 90 Lighthouse score
**Browser Support:** Last 2 versions (Chrome, Firefox, Safari, Edge)
**RTL Support:** CSS logical properties + manual flips
**Font Loading:** `font-display: swap`, preload critical fonts

---

## Design Tokens

```css
/* Colors */
--color-primary: #1a1a1a;
--color-accent: #0066cc; /* Adjust to brand */
--color-success: #10b981;
--color-error: #ef4444;
--color-warning: #f59e0b;

/* Spacing Scale */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;

/* Typography */
--font-body: 'Inter', sans-serif;
--font-arabic: 'Tajawal', sans-serif;
--font-size-base: 16px;
--line-height-base: 1.6;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Transitions */
--transition-fast: 100ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-slower: 400ms;
```

---

## Collaboration Handoff

**For Frontend/Flutter Engineers:**

This document provides complete UX specifications for implementation. All states, animations, and responsive behaviors are defined. Refer to:

- Section 7 for all interaction states
- Section 11 for responsive breakpoints
- Section 12 for animation timing/choreography
- Section 10 for accessibility requirements

**For Content & Terminology Specialist:**

Collaborate on:
- All copy for empty states (Section 7.6)
- Error messages (Section 7.8)
- Microcopy (buttons, forms, notifications)

**For Design Reviewer:**

Final review needed on:
- Visual consistency (colors, typography, spacing)
- Animation polish (timing, easing)
- Accessibility compliance (contrast, focus states)
- RTL layout accuracy

---

**Document Version:** 1.0
**Status:** Ready for Implementation
**Next Review:** Post-development feedback session

---

**END OF UX SPECIFICATIONS**
