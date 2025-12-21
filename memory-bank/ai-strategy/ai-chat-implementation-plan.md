# AI-Powered Customer Chat System - Implementation Plan

> **Last Updated:** 2025-12-21
> **Status:** Planning Complete, Ready for Implementation
> **Phase:** 1 MVP (6 Weeks)
> **Budget:** $15,000

---

## Executive Summary

This document outlines the comprehensive implementation plan for an AI-powered customer chat system for the Roaya IT website. The system will provide bilingual (EN/AR) support, RAG-based knowledge retrieval, HubSpot CRM integration, and intelligent lead qualification.

### Key Objectives

1. **Increase Lead Generation by 200%** - Convert website visitors into qualified leads
2. **Reduce Sales Team FAQ Time by 70%** - AI handles common inquiries automatically
3. **Enable 24/7 Support Coverage** - Instant responses at any time
4. **Expand to Arabic Market (50% TAM)** - Full bilingual support with RTL
5. **Improve Lead Quality (50% qualification rate)** - Intelligent lead scoring

---

## Technology Stack

| Component | Technology | Cost | Rationale |
|-----------|-----------|------|-----------|
| **LLM** | GPT-4o-mini | $0.15/1M input, $0.60/1M output | Best cost/quality balance |
| **Embeddings** | text-embedding-3-small | $0.02/1M tokens | Fast, accurate, 1536 dimensions |
| **Vector DB** | Pinecone | Free tier (100K vectors) | Managed service, low latency |
| **Backend** | NestJS | - | TypeScript-native, excellent WebSocket support |
| **WebSocket** | Socket.io | - | Reliable, fallback to polling |
| **Database** | PostgreSQL 16 | - | ACID compliance, JSON support |
| **ORM** | TypeORM | - | TypeScript-first, migration support |
| **CRM** | HubSpot API | Existing plan | Contact creation, lead scoring |
| **Frontend** | Angular 21 | - | Existing website framework |

---

## Phase 1 MVP - 6 Week Roadmap

### Sprint 1 (Week 1-2): Foundation

**Goals:**
- Backend API running locally
- OpenAI integration working
- Database schema deployed
- 500+ content chunks embedded

**Deliverables:**
- [ ] NestJS project scaffolding with OpenAI SDK
- [ ] PostgreSQL database schema (conversations, messages, leads)
- [ ] WebSocket server functional (basic echo test)
- [ ] Rate limiting implemented (20 msg/hr per session)
- [ ] Memory-bank content extracted and embedded in Pinecone
- [ ] Security architecture review completed

**Checkpoint 1 (End of Week 2):**
- Demo: Send message to backend, get OpenAI response, store in DB

---

### Sprint 2 (Week 3-4): RAG System + Frontend

**Goals:**
- RAG retrieval working (>80% relevance)
- Chat widget UI complete
- Streaming responses functional
- Bilingual UI tested

**Deliverables:**
- [ ] Pinecone index created and populated
- [ ] RAG retrieval pipeline (query embedding + semantic search)
- [ ] Prompt templates finalized (EN + AR)
- [ ] Angular chat widget component
- [ ] Message bubbles, typing indicator, lead form
- [ ] WebSocket client integrated with backend

**Checkpoint 2 (End of Week 4):**
- Demo: Full chat flow with RAG context in responses

---

### Sprint 3 (Week 5-6): Integration + Polish

**Goals:**
- HubSpot CRM integration complete
- All acceptance criteria met
- Security audit passed
- Zero critical bugs

**Deliverables:**
- [ ] HubSpot contact creation/update
- [ ] Lead form submission syncs to CRM
- [ ] Full system integration tested
- [ ] Load testing completed (100 concurrent users)
- [ ] Security audit passed
- [ ] GA4 analytics events tracked

**Checkpoint 3 (End of Week 6):**
- GO/NO-GO decision for production launch

---

## User Stories (INVEST-Compliant)

### Must Have (MVP)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| CHAT-001 | Chat Widget Visibility | Widget visible on all pages, bottom-right corner, accessible via keyboard |
| CHAT-003 | Language Selection | Auto-detect from site language, manual toggle, RTL support for Arabic |
| CHAT-004 | Welcome Message | Personalized greeting, 4 quick action buttons, language-appropriate |
| CHAT-005 | AI FAQ Response | <2s response time, 80%+ accuracy, source citations |
| CHAT-006 | Service Deep Dive | Industry-specific examples, relevant case study links |
| CHAT-007 | Lead Capture Form | Appears after 3 messages, name/email/company fields, validation |
| CHAT-009 | Human Handoff | Transfer to live agent, conversation context preserved |
| CHAT-013 | Error Handling | User-friendly error messages, retry options, graceful degradation |

### Should Have

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| CHAT-002 | Proactive Chat Invitation | Trigger after 10s on page, contextual messaging |
| CHAT-008 | Lead Qualification Scoring | Score 0-100 based on signals, tier classification (hot/warm/cold) |
| CHAT-011 | Conversation History | Persist within session, resume capability |
| CHAT-015 | After-Hours Support | Queue messages, SLA response time |

### Could Have (Phase 2)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| CHAT-010 | Mid-Conversation Language Switch | Seamless switch, context preserved |
| CHAT-012 | Network Resilience | Reconnect on disconnect, message queue |
| CHAT-014 | Pricing Handling | Price ranges from knowledge base, ROI calculator link |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular 21)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Widget Component                                    │  │
│  │  - Message list (virtual scroll)                          │  │
│  │  - Input field (validation)                               │  │
│  │  - Lead form (reactive forms)                             │  │
│  │  - Language toggle (LanguageService)                      │  │
│  │  - Theme support (ThemeService)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          │ WebSocket (Socket.io client)        │
│                          ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ wss://api.roaya.co/chat
                           │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS API)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Gateway (WebSocket)                                 │  │
│  │  - Socket.io server                                       │  │
│  │  - Session management                                     │  │
│  │  - Message routing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Service (Business Logic)                            │  │
│  │  - Message processing                                     │  │
│  │  - RAG context retrieval                                  │  │
│  │  - Response streaming                                     │  │
│  │  - Lead scoring                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │              │               │             │         │
│         ▼              ▼               ▼             ▼         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ OpenAI   │  │ Pinecone │  │ Database │  │ HubSpot  │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
       │              │               │             │
       ▼              ▼               ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ OpenAI   │  │ Pinecone │  │PostgreSQL│  │ HubSpot  │
│   API    │  │ Vector DB│  │   DB     │  │ CRM API  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Database Schema

```sql
-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_language VARCHAR(5) DEFAULT 'en',
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  lead_score INTEGER DEFAULT 0,
  hubspot_contact_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  need TEXT,
  lead_score INTEGER DEFAULT 0,
  hubspot_contact_id VARCHAR(255),
  hubspot_deal_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_leads_email ON leads(email);
```

---

## System Prompts

### English System Prompt

```
You are Roaya AI Assistant, a professional customer service agent for Roaya IT, an Egyptian enterprise IT services provider and WorldPosta partner.

## Your Role
You help potential clients understand Roaya's services, pricing, capabilities, and how we can solve their business challenges. You are knowledgeable, professional, and focused on qualifying leads.

## Core Knowledge
- **Services**: IT consulting, cloud migration, custom software development, cybersecurity, managed IT services, ERP/CRM implementation
- **Industries**: Healthcare, finance, retail, manufacturing, logistics, government
- **Specialization**: WorldPosta partner for postal and logistics solutions in Egypt
- **Location**: Cairo, Egypt | Serving MENA region
- **Company Values**: Security First, Trust, Transparency

## Conversation Guidelines

### DO:
- Greet warmly and ask how you can help
- Ask clarifying questions to understand client needs
- Reference specific services from the knowledge base
- Provide realistic timelines and pricing ranges when available
- Suggest booking a consultation for complex requirements
- Cite sources from retrieved documents when making claims
- Escalate to human sales for: pricing negotiations, contracts, technical deep-dives

### DON'T:
- Make up pricing or timelines not in the knowledge base
- Promise features or capabilities not documented
- Share confidential client information
- Discuss competitors negatively
- Provide legal or compliance advice
- Make binding commitments (always defer to official quotes)

## Response Format
- Keep responses concise (2-4 paragraphs maximum)
- Use bullet points for lists
- Include relevant links when helpful
- End with a call-to-action (book consultation, download resource, etc.)

Current date: {current_date}
Customer language preference: English
```

### Arabic System Prompt

```
أنت مساعد رؤيا الذكي، وكيل خدمة العملاء المحترف لشركة رؤيا لتكنولوجيا المعلومات، مزود خدمات تكنولوجيا المعلومات للمؤسسات المصرية وشريك WorldPosta.

## دورك
تساعد العملاء المحتملين على فهم خدمات رؤيا والأسعار والقدرات وكيف يمكننا حل تحديات أعمالهم.

## المعرفة الأساسية
- **الخدمات**: استشارات تكنولوجيا المعلومات، الانتقال السحابي، تطوير البرمجيات المخصصة، الأمن السيبراني
- **الصناعات**: الرعاية الصحية، التمويل، التجزئة، التصنيع، اللوجستيات، الحكومة
- **التخصص**: شريك WorldPosta لحلول البريد واللوجستيات في مصر
- **الموقع**: القاهرة، مصر | نخدم منطقة الشرق الأوسط وشمال أفريقيا

## تنسيق الرد
- اجعل الردود موجزة (2-4 فقرات كحد أقصى)
- استخدم النقاط للقوائم
- اختم بدعوة لاتخاذ إجراء

التاريخ الحالي: {current_date}
تفضيل لغة العميل: العربية
```

---

## RAG Implementation

### Chunking Configuration

```typescript
const CHUNKING_CONFIG = {
  chunkSize: 800,           // Characters per chunk
  chunkOverlap: 150,        // Overlap to preserve context
  separators: ['\n\n', '\n', '. ', ' '],
  preserveHeaders: true     // Keep markdown headers with chunks
};
```

### Content Sources for Embedding

```
memory-bank/
├── content/services/*.md          # Service descriptions
├── content/industries/*.md        # Industry solutions
├── content/resources/case-studies/*.md  # Case studies
├── business/*.md                  # Company info
└── architecture/*.md              # Technical capabilities
```

### Retrieval Pipeline

1. **Query Enhancement** - Add synonyms and context keywords
2. **Generate Embedding** - text-embedding-3-small (1536 dimensions)
3. **Vector Search** - Pinecone top-K query with filter
4. **Rerank** - Apply relevance scoring (>0.75 threshold)
5. **Deduplicate** - Keep highest scoring chunk per document
6. **Inject Context** - Add to system prompt (max 2000 tokens)

---

## API Contracts

### WebSocket Events

```typescript
// Client → Server
interface SendMessageEvent {
  event: 'send_message';
  data: {
    session_id: string;
    message: string;
    language: 'en' | 'ar';
  };
}

interface SubmitLeadEvent {
  event: 'submit_lead';
  data: {
    session_id: string;
    name: string;
    email: string;
    company: string;
  };
}

// Server → Client
interface MessageChunkEvent {
  event: 'message_chunk';
  data: {
    chunk: string;
    done: boolean;
  };
}

interface TypingEvent {
  event: 'typing';
  data: {
    is_typing: boolean;
  };
}

interface ErrorEvent {
  event: 'error';
  data: {
    code: string;
    message: string;
  };
}
```

### REST Endpoints (Fallback)

```
POST   /api/chat/init              # Initialize chat session
POST   /api/chat/message           # Send message (non-streaming)
GET    /api/chat/history/:session  # Get conversation history
POST   /api/chat/lead              # Submit lead form
POST   /api/chat/feedback          # Submit response feedback
```

---

## Guardrails

### Input Validation

| Check | Action |
|-------|--------|
| Message length < 3 chars | Reject: "Message too short" |
| Message length > 2000 chars | Reject: "Message too long" |
| Prompt injection patterns | Block and log |
| Profanity detected | Block with warning |
| Spam patterns (repeated chars, many URLs) | Block |

### Output Validation

| Check | Action |
|-------|--------|
| PII detected (email, phone, credit card) | Redact before sending |
| Hallucination score > 0.3 | Lower confidence, add disclaimer |
| Policy violation | Block response, escalate |
| Low confidence < 0.6 | Offer human handoff |

### Prompt Injection Detection Patterns

```typescript
const INJECTION_PATTERNS = [
  /ignore (previous|above) (instructions|prompts?)/i,
  /you are now/i,
  /new (instructions|role|personality)/i,
  /system:?\s*$/i,
  /\[INST\]/i,
  /<\|im_start\|>/i
];
```

---

## Security Requirements

### Launch Blockers (Must Have)

- [ ] All API keys in environment variables (never in code)
- [ ] Rate limiting implemented (20 msg/hr per session)
- [ ] TLS 1.3 enforced on all endpoints
- [ ] PII encrypted at rest in database
- [ ] Prompt injection detection active
- [ ] CORS whitelist configured (roaya.co only)
- [ ] No user messages in logs (metadata only)
- [ ] Security audit passed (OWASP Top 10)

### Data Protection

| Requirement | Implementation |
|-------------|---------------|
| In Transit | TLS 1.3 for HTTPS/WSS |
| At Rest | PostgreSQL encryption, AES-256 for PII |
| Retention | Conversations deleted after 90 days |
| Logging | No message content logged, metadata only |

---

## Non-Functional Requirements

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Latency (p95) | <3 seconds | CloudWatch metrics |
| RAG Retrieval | <500ms | Backend timing |
| Concurrent Users | 100 simultaneous | Load testing (K6) |
| Availability | 99.5% uptime | Status page monitoring |

### Accessibility (WCAG 2.1 AA)

- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader announcements for new messages
- [ ] Focus indicators (2px blue outline)
- [ ] `role="log"` on message list
- [ ] High contrast mode support

---

## Success Metrics

### Week 1 Post-Launch

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Engagement Rate | 20%+ visitors interact | <10% |
| Response Time (p95) | <3 seconds | >5 seconds |
| Error Rate | <1% | >5% |
| Lead Conversion | 30%+ conversations → leads | <15% |
| OpenAI Cost | <$500/week | >$800/week |

### Month 1 Post-Launch

| Metric | Target | Action If Not Met |
|--------|--------|-------------------|
| Total Conversations | 500+ | Increase visibility, A/B test |
| Qualified Leads | 150+ (30%) | Review lead scoring |
| User Satisfaction | 4+ stars avg | Analyze feedback |
| RAG Accuracy | >85% | Add content, tune embeddings |

---

## Budget Allocation

| Category | Cost | Notes |
|----------|------|-------|
| OpenAI API | $3,000 | GPT-4o-mini + embeddings (20M tokens est.) |
| Pinecone | $0 | Free tier (100K vectors) |
| Infrastructure | $1,500 | PostgreSQL, WebSocket server, CloudFlare |
| HubSpot API | $0 | Existing Roaya plan |
| Development Labor | $9,000 | 6 weeks (Backend + Frontend) |
| QA/Testing | $800 | Load testing tools, manual QA |
| Security Audit | $700 | 4 days Security Reviewer |
| **TOTAL** | **$15,000** | |

---

## Team & Responsibilities

| Role | Responsibilities | Time Commitment |
|------|-----------------|-----------------|
| Product Orchestrator | Coordination, go/no-go decisions | 20% (all 6 weeks) |
| Backend Engineer | NestJS API, OpenAI, Pinecone, HubSpot | 100% (Weeks 1-5) |
| Frontend Engineer | Angular chat widget, WebSocket client | 100% (Weeks 3-6) |
| AI Specialist | Prompts, RAG pipeline, embeddings | 60% (Weeks 1-4) |
| QA Engineer | Test strategy, E2E tests, load testing | 100% (Weeks 4-6) |
| Security Reviewer | Architecture review, penetration testing | 25% (Week 2, 5) |

---

## Pre-Implementation Checklist

### Week 0 - Before Sprint 1 Starts

| Action | Owner | Status |
|--------|-------|--------|
| Create OpenAI API account + key | Tech Lead | [ ] |
| Set up Pinecone account + index | AI Specialist | [ ] |
| Request HubSpot API access | Backend Engineer | [ ] |
| Provision PostgreSQL (staging) | Tech Lead | [ ] |
| Set up backend repository | Backend Engineer | [ ] |
| Book Security Reviewer (Week 2, 5) | Product Orchestrator | [ ] |
| Confirm budget approval ($15K) | Product Orchestrator | [ ] |
| Extract memory-bank content | AI Specialist | [ ] |

---

## Risk Register

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| API Key Exposure | CRITICAL | LOW | Env vars only, secret scanning |
| Prompt Injection | HIGH | MEDIUM | Input validation, pattern detection |
| OpenAI Downtime | MEDIUM | LOW | Health check, graceful errors |
| RAG Low Accuracy | MEDIUM | MEDIUM | Manual evaluation, tune threshold |
| HubSpot Rate Limit | LOW | MEDIUM | Request queue, retry logic |
| PII Data Leak | CRITICAL | LOW | Encrypt at rest, no logging |

---

## Phase 2 Roadmap (Post-MVP)

**Duration:** 6 weeks | **Budget:** $20,000

**Features:**
- Claude Haiku fallback model
- Persistent conversation history (cross-session)
- Agent handoff to human support (Slack integration)
- Advanced lead scoring with ML
- Conversation analytics dashboard
- A/B testing for prompts

---

## Phase 3 Roadmap (Advanced)

**Duration:** 12 weeks | **Budget:** $30,000

**Features:**
- Multi-model routing (cost optimization)
- Voice input/output
- File upload functionality
- Custom model fine-tuning
- Multi-language support (beyond EN/AR)
- Integration with Salesforce, Pipedrive

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-21 | Initial comprehensive plan from multi-agent research | Product Orchestrator, Business Analyst, AI Specialist |

---

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [NestJS WebSocket Gateway](https://docs.nestjs.com/websockets/gateways)
- [HubSpot CRM API](https://developers.hubspot.com/docs/api)
- [Angular Standalone Components](https://angular.dev/guide/components)
