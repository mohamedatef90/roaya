# Memory Bank - Roaya IT Website

> **Last Updated:** 2025-12-27
> **Purpose:** Centralized knowledge base for the Roaya IT corporate website project

---

## Quick Navigation

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| [project/](#project) | Business analysis, planning, status reports | Stakeholder summary, project status |
| [architecture/](#architecture) | Technical design, ADRs, performance audits | Technical architecture, ADRs |
| [design/](#design) | Design system, patterns, components, visuals | UI design system, animations |
| [ux/](#ux) | User experience specifications | UX specs, highlights |
| [content/](#content) | Page content, guidelines, resources | Bilingual content, page copy |
| [development/](#development) | Dev guides, checklists, setup | Quick start, project structure |
| [qa/](#qa) | Quality assurance reports | Accessibility, security audits |
| [research/](#research) | Design research, trend analysis | Layout trends 2025 |
| [ai-strategy/](#ai-strategy) | AI implementation plans | Chat implementation, translation |
| [agents/](#agents) | Agent configuration | Agent delegation matrix |
| [assets/](#assets) | Shared assets | Logo files |
| [archives/](#archives) | Historical implementation logs | Past fix documentation |

---

## Folder Structure

```
memory-bank/
│
├── project/                         # Project Management
│   ├── business/                    # Business analysis & stakeholders
│   │   ├── Executive-Stakeholder-Summary.md
│   │   └── content-analysis-report.md
│   ├── planning/                    # Roadmaps & milestones
│   │   └── project-status-report.md
│   └── status-reports/              # Project status reports
│       ├── product-status-report.md
│       ├── project-analysis-report.md
│       └── technical-architecture-report.md
│
├── architecture/                    # Technical Architecture
│   ├── TECHNICAL_ARCHITECTURE.md    # Core system design
│   ├── ARCHITECTURE_INDEX.md        # Architecture navigation
│   ├── TECHNOLOGY_RADAR.md          # Tech stack evaluation
│   ├── adrs/                        # Architecture Decision Records
│   │   ├── ADR-001-STANDALONE-COMPONENTS.md
│   │   ├── ADR-002-I18N-STRATEGY.md
│   │   └── ADR-003-THEME-SYSTEM.md
│   ├── audits/                      # Performance & optimization
│   │   ├── PERFORMANCE_AUDIT_PHASE4.md
│   │   ├── PERFORMANCE_FIXES_SUMMARY.md
│   │   ├── PERFORMANCE_OPTIMIZATION.md
│   │   ├── PERFORMANCE_CHECKLIST.md
│   │   └── OPTIMIZATION_SUMMARY.md
│   └── guides/                      # Implementation guides
│       ├── IMPLEMENTATION_GUIDE.md
│       └── PERFORMANCE_STRATEGY.md
│
├── design/                          # Design System
│   ├── README.md                    # Design philosophy & overview
│   ├── system/                      # Core design system
│   │   ├── ui-design-system.md
│   │   └── DESIGN_SYSTEM_TOKENS.md
│   ├── patterns/                    # Reusable patterns
│   │   ├── animation-patterns.md
│   │   ├── glassmorphism-guide.md
│   │   └── mega-menu-animations.md
│   ├── components/                  # Component library
│   │   └── component-library.md
│   └── visuals/                     # Visual assets & guides
│       ├── IMAGE_IMPLEMENTATION_GUIDE.md
│       ├── IMAGE_QUICK_START.md
│       ├── ai-image-prompts-library.md
│       ├── visual-implementation-guide.md
│       └── visual-strategy-analysis.md
│
├── ux/                              # UX Specifications
│   ├── ux-specifications.md
│   └── ux-highlights.md
│
├── content/                         # Website Content
│   ├── pages/                       # Page-specific content
│   │   ├── home/content.md
│   │   ├── company/
│   │   │   ├── about/content.md
│   │   │   └── contact/content.md
│   │   ├── services/
│   │   │   ├── _overview.md
│   │   │   ├── cloud-hosting/content.md
│   │   │   ├── cloud-migration/content.md
│   │   │   ├── cybersecurity/content.md
│   │   │   ├── email-services/content.md
│   │   │   ├── it-automation/content.md
│   │   │   ├── sap-operations/content.md
│   │   │   └── security/           # Security sub-pages
│   │   │       ├── penetration-testing-implementation-guide.md
│   │   │       ├── SOC Solutions Page.md
│   │   │       ├── Cybersecurity Solutions Overview Page.md
│   │   │       ├── Cybersecurity-Solutions-Enhanced.md
│   │   │       └── incident-response-landing-page.md
│   │   └── industries/
│   │       ├── _overview.md
│   │       ├── education/content.md
│   │       ├── finance/content.md
│   │       ├── government/content.md
│   │       ├── healthcare/content.md
│   │       ├── manufacturing/content.md
│   │       └── retail/content.md
│   ├── guidelines/                  # Content guidelines
│   │   ├── bilingual-website-content-strategy.md
│   │   ├── content-guidelines-and-terminology.md
│   │   └── content-guidelines-quickstart.md
│   └── resources/                   # Resource specifications
│       ├── blog-system-documentation.md
│       ├── case-studies/_overview.md
│       └── roi-calculator/_specification.md
│
├── development/                     # Development Guides
│   ├── QUICK_START.md
│   ├── PROJECT_STRUCTURE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── THEME_IMPLEMENTATION.md
│   └── DEVELOPMENT_CHECKLIST.md
│
├── qa/                              # Quality Assurance
│   └── reports/
│       ├── ACCESSIBILITY_AUDIT_REPORT.md
│       ├── ACCESSIBILITY_FIXES_IMPLEMENTED.md
│       ├── CODE_QUALITY_REPORT.md
│       ├── REVIEW_SUMMARY.md
│       └── SECURITY_REVIEW.md
│
├── research/                        # Research Documents
│   ├── layout-trends-2025.md
│   ├── section-layout-trends-2025.md
│   └── stacking-cards-analysis.md
│
├── ai-strategy/                     # AI Implementation
│   ├── ai-chat-implementation-plan.md
│   └── translation-ai-strategy-report.md
│
├── agents/                          # Agent Configuration
│   └── agent-map.json
│
├── assets/                          # Shared Assets
│   └── roaya-logo.png
│
└── archives/                        # Historical Logs
    └── implementation-logs/
        ├── ICON_FIX_SUMMARY.md
        ├── LEGAL_PAGES_IMPLEMENTATION.md
        └── STACKING_CARDS_FIX.md
```

---

## Section Details

### Project
Business-level documentation including stakeholder requirements, project planning, and status reports.

**When to use:** Starting new features, checking project status, understanding business context.

### Architecture
Technical system design, architecture decision records (ADRs), and performance optimization documentation.

**When to use:** Making technical decisions, understanding system design, optimizing performance.

### Design
Comprehensive design system including UI tokens, animation patterns, component library, and visual asset guides.

**When to use:** Implementing UI components, adding animations, following design standards.

### UX
User experience specifications and flow documentation.

**When to use:** Understanding user flows, implementing new pages, checking interaction patterns.

### Content
All website content organized by page, plus content guidelines and terminology standards.

**When to use:** Implementing page content, adding translations, following content conventions.

### Development
Development setup guides, project structure documentation, and implementation checklists.

**When to use:** Onboarding, setting up development environment, following coding standards.

### QA
Quality assurance reports including accessibility audits, code quality reviews, and security assessments.

**When to use:** Before releases, fixing accessibility issues, addressing security concerns.

### Research
Design research and trend analysis documents.

**When to use:** Exploring new design patterns, understanding industry trends.

### AI Strategy
AI and machine learning implementation plans for the website.

**When to use:** Implementing AI features, chat systems, translation automation.

### Agents
Configuration for the multi-agent orchestration system.

**When to use:** Understanding agent roles, delegating tasks.

### Assets
Shared brand assets like logos.

### Archives
Historical implementation logs for completed fixes and features.

**When to use:** Reference for past implementations, understanding historical decisions.

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| General docs | `kebab-case.md` | `project-status-report.md` |
| ADRs | `ADR-NNN-TITLE.md` | `ADR-001-STANDALONE-COMPONENTS.md` |
| Page content | `content.md` in folder | `services/cloud-hosting/content.md` |
| Overviews | `_overview.md` | `services/_overview.md` |
| Reports | `UPPERCASE_NAME.md` | `SECURITY_REVIEW.md` |

---

## Related Files

- **Project CLAUDE.md:** `/roaya-website/CLAUDE.md` - Main project context
- **Translation Files:** `/roaya-website/src/assets/i18n/` - EN/AR translations
- **Source Code:** `/roaya-website/src/` - Angular application

---

## Maintenance

**Last Reorganized:** 2025-12-27

To add new documentation:
1. Identify the appropriate folder based on content type
2. Follow naming conventions above
3. Update this README if adding new categories
