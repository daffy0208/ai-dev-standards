# Sample Project: Try ai-dev-standards Right Now

This is a complete, ready-to-use example you can test immediately.

---

## 🎯 Test Project: "FeedbackHub" - Customer Feedback SaaS

Let's pretend you're building a customer feedback management tool for small businesses.

### Step 1: Create Test Project

```bash
# Create a test project directory
mkdir ~/test-feedbackhub
cd ~/test-feedbackhub

# Initialize git (optional)
git init
```

### Step 2: Add This Exact .cursorrules

Copy this **exactly** into `.cursorrules`:

```markdown
# Project: FeedbackHub - Customer Feedback Management SaaS

## AI Development Standards
Repository: ~/ai-dev-standards/
Status: Active

### Instructions for Claude Code

**ALWAYS start by loading:**
1. ~/ai-dev-standards/META/PROJECT-CONTEXT.md
2. ~/ai-dev-standards/META/HOW-TO-USE.md
3. ~/ai-dev-standards/META/DECISION-FRAMEWORK.md

**Check skill registry:**
~/ai-dev-standards/META/skill-registry.json

### Primary Skills for This Project
- mvp-builder (feature prioritization)
- product-strategist (market validation)
- frontend-builder (Next.js development)
- api-designer (REST API design)
- deployment-advisor (infrastructure)
- go-to-market-planner (launch prep)

---

## What We're Building

**FeedbackHub** - A simple SaaS tool for small businesses (restaurants, retail stores, salons) to collect and manage customer feedback.

### Target Customer
- Small businesses (1-10 employees)
- Non-technical owners (restaurant owners, salon owners, etc.)
- Currently using: paper forms, Google Forms, or nothing
- Budget: $10-30/month

### The Problem
Small businesses want customer feedback but:
- Paper forms get lost
- Google Forms responses scattered in email
- No way to track trends or take action
- Too busy to analyze feedback manually

### Our Solution (Hypothesis)
A simple dashboard that:
- Generates custom feedback forms (QR code or link)
- Collects responses in one place
- Shows trends (ratings over time, common complaints)
- Sends weekly summary email

---

## Current Phase: Week 2 of MVP Development

- [x] Week 1: Problem validation (interviewed 10 restaurant owners)
- [x] Week 2: MVP scope definition ← **WE ARE HERE**
- [ ] Weeks 3-6: Build core features
- [ ] Week 7: Beta test with 5 businesses
- [ ] Week 8: Iterate based on feedback
- [ ] Week 9-10: Polish and bug fixes
- [ ] Week 11-12: Prepare for launch

---

## Riskiest Assumptions to Validate

1. **Will businesses actually share the QR code/link with customers?**
   - Risk: High - If they don't share it, we have no product
   - Validation: Beta test, track how many QR codes are displayed

2. **Do businesses care about trends or just raw feedback?**
   - Risk: Medium - Affects if we build analytics
   - Validation: Show both options to 5 test businesses

3. **Will they pay $20/month for this?**
   - Risk: High - Business model validation
   - Validation: Ask during beta, show pricing page

---

## MVP Scope: P0/P1/P2 Features

### P0 - Must Have (Launch Blockers)
- [ ] Business owner signup/login
- [ ] Create feedback form (3 fields: rating, comment, contact)
- [ ] Generate QR code for form
- [ ] Customer submits feedback (no login required)
- [ ] Dashboard showing list of feedback
- [ ] Basic filtering (by date, rating)
- [ ] Weekly email summary (feedback count, avg rating)

### P1 - Should Have (Post-MVP v1.1)
- [ ] Multiple locations support (for chains)
- [ ] Custom branding (logo, colors on form)
- [ ] Trend charts (ratings over time)
- [ ] Email notifications for negative feedback
- [ ] Export to CSV
- [ ] Integration with email (send feedback via email)

### P2 - Nice to Have (Future)
- [ ] AI-powered insights ("Common complaint: slow service")
- [ ] Mobile app for business owners
- [ ] SMS notifications
- [ ] Integration with POS systems
- [ ] Multi-language forms

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod validation

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL database

### Services
- Auth: NextAuth.js with email magic links
- Email: Resend (transactional emails)
- QR Codes: `qrcode` npm package
- Hosting: Vercel (free tier for now)
- Database: Railway (free tier for now)

### Why This Stack?
- Next.js: Fastest path to MVP, handles frontend + API
- PostgreSQL: Relational data (businesses, forms, feedback)
- Vercel: Zero config deployment
- Free tier: Total cost: $0 until we validate

---

## Database Schema (Draft)

```prisma
model Business {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  forms     Form[]
}

model Form {
  id          String     @id @default(uuid())
  businessId  String
  business    Business   @relation(fields: [businessId], references: [id])
  title       String     @default("Customer Feedback")
  qrCodeUrl   String
  createdAt   DateTime   @default(now())
  feedback    Feedback[]
}

model Feedback {
  id          String   @id @default(uuid())
  formId      String
  form        Form     @relation(fields: [formId], references: [id])
  rating      Int      // 1-5 stars
  comment     String?
  customerEmail String?
  createdAt   DateTime @default(now())
}
```

---

## User Flows

### Flow 1: Business Owner Setup (P0)
1. Visit feedbackhub.com
2. Enter email → Receive magic link
3. Click link → Auto login
4. See onboarding: "Create your first feedback form"
5. Form auto-created with default settings
6. See QR code + shareable link
7. "Print this QR code and display it at checkout"

### Flow 2: Customer Leaves Feedback (P0)
1. Scan QR code or click link
2. See simple form: "How was your experience?"
3. Select 1-5 stars
4. Optional: Write comment
5. Optional: Enter email for response
6. Submit → "Thank you! Your feedback helps us improve."

### Flow 3: Business Owner Views Feedback (P0)
1. Login to dashboard
2. See list of feedback (newest first)
3. Each item shows: rating, comment, date
4. Filter by: date range, rating (all/5-star/1-star)
5. Weekly email: "You got 12 feedbacks this week, avg 4.2 stars"

---

## Code Conventions

### File Structure
```
/app
  /(auth)
    /login
    /signup
  /dashboard
    /page.tsx          # Feedback list
    /form-setup        # QR code display
  /f/[formId]          # Public feedback form
  /api
    /auth
    /feedback
/components
  /ui                  # shadcn components
  /dashboard          # Dashboard specific
  /feedback-form      # Public form components
/lib
  /db.ts              # Prisma client
  /email.ts           # Email utilities
/prisma
  /schema.prisma
```

### Naming Conventions
- Components: PascalCase (`FeedbackList.tsx`)
- API routes: kebab-case (`/api/feedback/submit`)
- Database: snake_case (Prisma default)

---

## Security & Quality

### P0 Security
- [x] Magic link auth (no password to leak)
- [x] Business owners can only see their own feedback
- [x] Public forms don't require auth (intentional)
- [x] Rate limiting on feedback submission (prevent spam)
- [x] Input validation (Zod on all forms)

### Performance Targets
- Dashboard load: <2s
- Public form submit: <1s
- Email delivery: <5 minutes

---

## Go-to-Market Plan (Week 9-12)

### Pre-Launch (Week 9-10)
- Create landing page with waitlist
- Write launch blog post
- Prepare Product Hunt submission
- Reach out to 5 beta users for testimonials

### Launch (Week 11)
- Post on Product Hunt (Tuesday 12:01 AM PT)
- Email waitlist (500 people from landing page)
- Post in relevant communities (r/smallbusiness, etc.)
- Personal network outreach

### Post-Launch (Week 12)
- Collect feedback from first 100 users
- Fix critical bugs
- Plan v1.1 features (from P1 list)

---

## Business Model

### Pricing (To Validate)
- **Free:** Up to 50 feedbacks/month
- **Pro - $19/month:** Unlimited feedback, email reports, branding
- **Business - $49/month:** Multiple locations, integrations

### Success Metrics
- Week 1: 100 signups
- Month 1: 500 signups, 50 paying customers
- Month 3: 2000 signups, 200 paying ($4k MRR)

---

## Current Sprint (Week 2)

This week's goals:
- [x] Define MVP scope (P0 features)
- [ ] Design database schema
- [ ] Set up Next.js project
- [ ] Implement auth (NextAuth)
- [ ] Create basic dashboard layout

---

## Questions to Validate This Week

1. Is the database schema sufficient for P0?
2. Should QR codes be generated server-side or client-side?
3. Do we need a "preview form" feature for business owners?
4. Should weekly email be automatic or opt-in?

---

## Instructions for Claude

When I ask you questions about this project:

### For Feature Decisions
→ Use **mvp-builder** skill
→ Apply P0/P1/P2 matrix
→ Validate against riskiest assumptions

### For Architecture
→ Consult **DECISION-FRAMEWORK.md**
→ Explain trade-offs (simplicity vs features)
→ Recommend based on MVP phase

### For Code
→ Follow **frontend-builder** or **api-designer** skills
→ Match tech stack above (Next.js, Prisma)
→ Keep it simple (we're in MVP phase)

### For Launch Planning
→ Use **go-to-market-planner** skill
→ Reference timeline (weeks 9-12)
→ Focus on validation, not scale
```

### Step 3: Open in Claude Code

```bash
# Open project in Cursor/Claude Code
cursor ~/test-feedbackhub

# Or if using VS Code with Claude
code ~/test-feedbackhub
```

---

## 🧪 Now Test These Conversations

### Test 1: Feature Prioritization

**You ask:**
```
"A user requested we add SMS notifications for negative feedback. Should we build this?"
```

**Claude should:**
1. Load mvp-builder skill
2. Check P0/P1/P2 list (it's P2)
3. Evaluate against riskiest assumptions
4. Recommend: "No - focus on P0 features first"
5. Explain why: Not validating core assumptions

---

### Test 2: Architecture Decision

**You ask:**
```
"Should I use PostgreSQL or MongoDB for this project?"
```

**Claude should:**
1. Consult DECISION-FRAMEWORK.md
2. Review your data (Business, Form, Feedback - relational!)
3. Recommend PostgreSQL
4. Explain: Relational data, strong consistency needed
5. Note: Already in your tech stack ✓

---

### Test 3: MVP Validation

**You ask:**
```
"Is my P0 feature list too big? Can I cut anything?"
```

**Claude should:**
1. Use mvp-builder skill
2. Review your riskiest assumptions
3. Check each P0 feature against assumptions
4. Recommend cuts (likely: "Weekly email summary" → Move to P1)
5. Explain: Email summary doesn't validate core assumptions

---

### Test 4: Code Implementation

**You ask:**
```
"Write the API route for submitting feedback"
```

**Claude should:**
1. Use api-designer skill
2. Follow your tech stack (Next.js API route, Prisma)
3. Include validation (Zod)
4. Add error handling
5. Include rate limiting (you listed it as P0 security)
6. Provide complete, production-ready code

---

### Test 5: Launch Planning

**You ask:**
```
"I'm in week 8, should I delay launch to add trend charts?"
```

**Claude should:**
1. Use mvp-builder OR go-to-market-planner
2. Check: Trend charts are P1 (not P0)
3. Check: You're testing assumption #2 (do businesses care about trends?)
4. Recommend: Ship P0, add trends in v1.1 if beta users want them
5. Remind: "Perfect is the enemy of shipped"

---

## ✅ Expected Results

If ai-dev-standards is working correctly, Claude will:

- ✅ Automatically reference skills without you asking
- ✅ Apply P0/P1/P2 thinking to feature requests
- ✅ Make decisions based on your riskiest assumptions
- ✅ Follow your tech stack when writing code
- ✅ Keep MVP scope tight (prevent scope creep)
- ✅ Use decision framework for architecture choices

---

## 🎉 Success!

If Claude is doing all the above, **you've successfully integrated ai-dev-standards!**

You can now:
1. Use this same approach in real projects
2. Customize .cursorrules for your specific needs
3. Add more project details as you learn
4. Build better, faster, with AI assistance

---

## 📝 What to Do Next

**Try it with a real project:**
1. Copy this .cursorrules template
2. Modify for your actual project
3. Fill in your tech stack, features, assumptions
4. Start building with Claude

**Or explore more:**
- Check other templates: ~/ai-dev-standards/TEMPLATES/
- Read integration guide: ~/ai-dev-standards/DOCS/INTEGRATION-GUIDE.md
- Review all skills: ~/ai-dev-standards/SKILLS/
- Study patterns: ~/ai-dev-standards/STANDARDS/architecture-patterns/
