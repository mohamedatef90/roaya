# Memory Bank - Roaya IT Website

Organized knowledge base for the Roaya IT website project.

## Structure

```
memory-bank/
├── agents/                    # Agent configurations
│   └── agent-map.json         # Agent delegation matrix
│
├── architecture/              # System design & decisions
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── PERFORMANCE_STRATEGY.md
│   ├── TECHNOLOGY_RADAR.md
│   ├── ARCHITECTURE_INDEX.md
│   ├── ADR-001-STANDALONE-COMPONENTS.md
│   ├── ADR-002-I18N-STRATEGY.md
│   ├── ADR-003-THEME-SYSTEM.md
│   └── audits/                # Performance audits
│       ├── PERFORMANCE_AUDIT_PHASE4.md
│       ├── PERFORMANCE_FIXES_SUMMARY.md
│       ├── PERFORMANCE_OPTIMIZATION.md
│       ├── PERFORMANCE_CHECKLIST.md
│       └── OPTIMIZATION_SUMMARY.md
│
├── business/                  # Business analysis
│   ├── Executive-Stakeholder-Summary.md
│   └── content-analysis-report.md
│
├── content/                   # Website content
│   ├── bilingual-website-content-strategy.md
│   ├── home/content.md
│   ├── company/
│   │   ├── about/content.md
│   │   └── contact/content.md
│   ├── services/
│   │   ├── _overview.md
│   │   ├── cloud-hosting/content.md
│   │   ├── cloud-migration/content.md
│   │   ├── cybersecurity/content.md
│   │   ├── email-services/content.md
│   │   ├── it-automation/content.md
│   │   └── sap-operations/content.md
│   ├── industries/
│   │   ├── _overview.md
│   │   ├── education/content.md
│   │   ├── finance/content.md
│   │   ├── government/content.md
│   │   ├── healthcare/content.md
│   │   ├── manufacturing/content.md
│   │   └── retail/content.md
│   ├── resources/
│   │   ├── case-studies/_overview.md
│   │   └── roi-calculator/_specification.md
│   └── guidelines/
│       ├── content-guidelines-and-terminology.md
│       └── content-guidelines-quickstart.md
│
├── development/               # Development documentation
│   ├── PROJECT_STRUCTURE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── THEME_IMPLEMENTATION.md
│   ├── DEVELOPMENT_CHECKLIST.md
│   └── QUICK_START.md
│
├── design/                    # Design system documentation
│   ├── README.md              # Design system overview & philosophy
│   ├── patterns/
│   │   ├── animation-patterns.md      # GSAP animation code snippets
│   │   └── glassmorphism-guide.md     # Glass effects implementation
│   ├── components/
│   │   └── component-library.md       # Reusable component patterns
│   └── styles/                        # (Future: color, typography, spacing)
│
├── planning/                  # Project planning
│   └── project-status-report.md
│
├── qa/                        # Quality assurance
│   └── reports/
│       ├── ACCESSIBILITY_AUDIT_REPORT.md
│       ├── ACCESSIBILITY_FIXES_IMPLEMENTED.md
│       ├── CODE_QUALITY_REPORT.md
│       ├── REVIEW_SUMMARY.md
│       └── SECURITY_REVIEW.md
│
├── ux/                        # UX specifications
│   ├── ux-specifications.md
│   └── ux-highlights.md
│
└── roaya-logo.png             # Brand logo asset
```

## File Naming Convention

- Use kebab-case: `feature-name-description.md`
- Content files: `content.md` within feature folders
- Overviews: `_overview.md` for section summaries
- ADRs: `ADR-NNN-DECISION-NAME.md`

## Quick Links

| Category | Purpose |
|----------|---------|
| `architecture/` | Tech stack, system design, ADRs, performance audits |
| `business/` | Stakeholder requirements, business analysis |
| `content/` | All website content by section (services, industries, etc.) |
| `development/` | Setup guides, project structure, implementation details |
| `design/` | Design system, animations, components, glassmorphism |
| `qa/reports/` | Accessibility, code quality, and security audits |
| `ux/` | UX specifications and design guidelines |
