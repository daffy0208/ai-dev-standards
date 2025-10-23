# Validation-First Development Playbook

**Purpose:** Prevent wasting time and money by building the wrong thing. This playbook ensures you validate problems and solutions **before** committing to implementation.

**When to use:** At the start of every new project or feature.

**Time to complete:** 2-4 weeks (vs 8-12 weeks building blindly)

---

## 🎯 Core Principle

**BUILD AS LITTLE AS POSSIBLE TO LEARN AS MUCH AS POSSIBLE.**

Don't build anything until you've:
1. ✅ Validated the problem exists and is severe
2. ✅ Validated your solution actually solves it
3. ✅ Validated people will pay for it

---

## ⚠️  STOP Signs

**STOP if you're tempted to:**
- ❌ "Just build it quickly and see if people use it"
- ❌ "I'll do some research and then start coding"
- ❌ "Let me set up the infrastructure first"
- ❌ "I need to learn this framework before I can validate"
- ❌ "I'll build a prototype to show investors"

**START with:**
- ✅ Talking to potential users
- ✅ Testing with landing pages
- ✅ Manually delivering the service (Concierge MVP)
- ✅ Observing current behavior
- ✅ Validating with $0 and <1 week

---

## 📊 The Playbook: 5 Phases

### Phase 1: Problem Discovery (Week 1-2)
⏰ **Time Limit:** 2 weeks MAX - then move to Phase 2

### Phase 2: Solution Validation (Day 1-3)
⏰ **Time Limit:** 3 days MAX - then move to Phase 3

### Phase 3: MVP Build & Test (Week 1-2)
⏰ **Time Limit:** 2 weeks MAX - if longer, scope is too big

### Phase 4: Validated Learning (Ongoing)
🎯 **Gate:** Must have metrics before Phase 5

### Phase 5: Scale Decision
⚠️  **Only proceed if metrics prove viability**

---

## Phase 1: Problem Discovery (Week 1-2)

**Goal:** Confirm the problem is real, frequent, painful, and worth solving

**⏰ Time Limit:** 2 weeks - if you're still researching after 2 weeks, STOP and move to Phase 2

### Step 1.1: Define Problem Hypothesis (Day 1)

**Template:**
```
[Target users] struggle with [problem]
when they [context/situation],
which costs them [time/money/pain],
because [root cause].
```

**Example:**
"Freelance designers struggle with invoice tracking when working with multiple clients, which costs them 3-5 hours per week, because existing tools are too complex or expensive."

### Step 1.2: Customer Discovery Interviews (Week 1-2)

**Target:** 10-15 interviews minimum

**Mom Test Questions** (ask about past behavior, not opinions):
1. "Tell me about the last time you encountered [problem]."
2. "How are you currently solving this?"
3. "How much time/money do you spend on this problem?"
4. "What have you tried that didn't work?"
5. "Walk me through your workflow when [doing related task]."

**❌ DON'T ASK:**
- "Would you use this product?" (Everyone says yes)
- "Do you think this is a good idea?"
- "How much would you pay for this?"

### Step 1.3: Problem Severity Scoring (End of Week 2)

Score each dimension (1-5):

| Dimension | 1 (Low) | 3 (Medium) | 5 (High) |
|-----------|---------|------------|----------|
| **Frequency** | Rarely | Monthly | Daily/Weekly |
| **Impact** | Minor annoyance | Wastes 1-2 hours | Critical blocker |
| **Urgency** | Can wait | Should fix eventually | Need it now |
| **Willingness to Pay** | Won't pay | Might pay $5-20/mo | Will pay $50+/mo |
| **Current Workarounds** | Works fine | Tolerable | Painful/expensive |

**Decision Rule:**
- **Score 20-25** (4-5 High dimensions) → ✅ BUILD IT - Problem validated
- **Score 12-19** (2-3 High dimensions) → ⚠️ VALIDATE SOLUTION - Problem exists, test solution
- **Score 5-11** (0-1 High dimensions) → ❌ DON'T BUILD - Problem not severe enough

### Validation Gate 1: Problem Discovery

Before moving to Phase 2, confirm:
- [ ] 10+ customer discovery interviews completed
- [ ] Problem severity score ≥ 12 (2+ High dimensions)
- [ ] Current workarounds documented and evaluated
- [ ] Willingness to pay signals collected
- [ ] 70%+ of interviewees confirm problem is real

**If gate not passed:** STOP - Problem not validated. Pivot or abandon.

**If gate passed:** Move to Phase 2 (Solution Validation)

---

## Phase 2: Solution Validation (Day 1-3)

**Goal:** Test that your solution actually solves the problem

**⏰ Time Limit:** 3 days - Don't spend weeks on this

### Choose ONE Validation Method

### Method 1: Landing Page Test (Fastest - 1-2 days)

**Steps:**
1. Create single-page site describing solution
2. Add "Sign up for early access" email form
3. Drive 100-500 visitors (ads, social, outreach)
4. **Success:** >5% conversion to email signup

**Cost:** $50-100 in ads
**Time:** 1-2 days
**Tools:** Carrd ($19/year), Mailchimp (free), Google Ads ($50-100)

### Method 2: Concierge MVP (1 week)

**Steps:**
1. Manually deliver solution to 5-10 early customers
2. Do everything by hand (no automation)
3. Walk them through process yourself
4. **Success:** Users achieve outcome and ask for more

**Cost:** $0-50
**Time:** 1 week
**Example:** Food delivery → Take orders via WhatsApp, deliver yourself

### Method 3: Wizard of Oz MVP (1-2 weeks)

**Steps:**
1. Build front-end UI only
2. Handle all requests manually behind the scenes
3. Users think it's automated
4. **Success:** Users continue using despite imperfections

**Cost:** $0-100
**Time:** 1-2 weeks
**Example:** AI chatbot → Human answers, customer thinks it's AI

### Method 4: Prototype Testing (3-5 days)

**Steps:**
1. Create clickable prototype (Figma, InVision)
2. Show to 10-15 target users
3. Watch them attempt key tasks WITHOUT help
4. **Success:** >70% complete core tasks without guidance

**Cost:** $0
**Time:** 3-5 days
**Tools:** Figma (free), Maze for testing ($0-25)

### Validation Gate 2: Solution Validation

Before moving to Phase 3, confirm:
- [ ] Solution tested with prototype or MVP
- [ ] 50%+ of testers say they'd use/pay for it
- [ ] Users achieve desired outcome
- [ ] Must-have features identified
- [ ] Pricing expectations validated

**If gate not passed:** STOP - Solution doesn't work. Redesign or abandon.

**If gate passed:** Move to Phase 3 (MVP Build)

---

## Phase 3: MVP Build & Test (Week 1-2)

**Goal:** Build minimum viable product to test with real users

**⏰ Time Limit:** 2 weeks MAX - If taking longer, scope is too big

### MVP Scope Definition

Use P0/P1/P2 Matrix:

| Priority | Definition | Action |
|----------|------------|--------|
| **P0** | Must have for core value proposition | Build now (this sprint) |
| **P1** | Important but can wait | Ship after validation |
| **P2** | Nice to have | Ship v2+ |
| **Out of Scope** | Not needed for validation | Defer indefinitely |

**Example: Task Management MVP**

**P0 (Week 1):**
- Create task with title
- Mark task complete
- View task list
- Basic auth (email/password)

**P1 (After validation):**
- Due dates
- Priorities
- Reminders

**P2 (Future):**
- Team collaboration
- File attachments
- Mobile app

**Out of Scope:**
- Gantt charts
- Time tracking
- Integrations

### Implementation Checklist

**Week 1:**
- [ ] Set up minimal infrastructure (Vercel + Supabase OR Replit)
- [ ] Build P0 features only (resist scope creep!)
- [ ] No styling beyond basic CSS (ugly is fine for MVP)
- [ ] No optimization (performance can wait)
- [ ] Deploy to production

**Week 2:**
- [ ] Get 10-20 users testing
- [ ] Fix critical bugs only
- [ ] Collect usage data
- [ ] Do user interviews
- [ ] Measure key metrics

### Cost Budget

**MVP Budget (max):**
- Infrastructure: $0-50/month (Vercel free + Supabase free tier)
- Tools: $0-30/month (Figma, analytics)
- **Total:** <$100/month, <$200 total

**If you're spending more:** Your scope is too big. Cut features.

### Validation Gate 3: MVP Validation

After 2 weeks with MVP, measure:
- [ ] 10+ real users testing
- [ ] ≥40% retention (users return after first use)
- [ ] ≥30% weekly active (users use at least weekly)
- [ ] Positive feedback (users say they'd pay)
- [ ] Core use case validated (users achieve goal)

**If gate not passed:** STOP - Users don't love it. Pivot or improve core value prop.

**If gate passed:** Move to Phase 4 (Validated Learning)

---

## Phase 4: Validated Learning (Ongoing)

**Goal:** Systematically test assumptions and improve product

**Duration:** Ongoing until Phase 5 decision point

### Set Up Metrics

**Track:**
1. **Acquisition:** How many users sign up?
2. **Activation:** How many complete first key action?
3. **Retention:** How many come back after 1 week? 1 month?
4. **Revenue:** How many pay? Average revenue per user?
5. **Referral:** How many invite others?

### Weekly Learning Cycles

**Every week:**
1. Identify biggest unknown/risk
2. Design cheapest test to validate/invalidate
3. Run test
4. Analyze results
5. Update strategy
6. Repeat

### Cost Control

**Spending limits:**
- Infrastructure: <$200/month
- Marketing: <$500/month
- Total: <$1000/month

**If approaching limits:** Time to decide (Phase 5) - scale or stop

### Validation Gate 4: Validated Learning

Before Phase 5, you need:
- [ ] 3+ months of usage data
- [ ] 100+ active users
- [ ] Retention >40% (monthly)
- [ ] Clear understanding of unit economics
- [ ] Positive trend in key metrics
- [ ] Users willing to pay (even if not charging yet)

**If gate not passed:** Keep iterating or STOP (see "Kill Criteria" below)

**If gate passed:** Move to Phase 5 (Scale Decision)

---

## Phase 5: Scale Decision

**Goal:** Decide whether to scale up or wind down

**⚠️  DO NOT PROCEED WITHOUT VALIDATION GATES 1-4 COMPLETE**

### Scale Decision Matrix

**Scale UP if:**
- ✅ Retention >40% monthly
- ✅ Users actively using product weekly
- ✅ Positive word of mouth / referrals
- ✅ Revenue (or validated willingness to pay)
- ✅ Unit economics work (LTV > 3x CAC)
- ✅ Market opportunity >$10M SOM
- ✅ Team capable of executing scale plan

**Keep iterating if:**
- ⚠️ Some metrics good, some not yet
- ⚠️ Users like it but not using regularly
- ⚠️ Core value prop needs refinement
- ⚠️ Monetization not yet validated

**Wind down if (Kill Criteria):**
- ❌ <30% retention after 6 months
- ❌ Users not using product regularly
- ❌ No one willing to pay after 6 months
- ❌ Better alternatives exist
- ❌ Market too small (<$1M SOM)
- ❌ Burned through 6 months without traction

### If Scaling: Then What?

**NOW you can:**
- ✅ Build robust infrastructure
- ✅ Implement full feature set
- ✅ Optimize performance
- ✅ Scale team
- ✅ Increase marketing spend
- ✅ Use technical skills: api-designer, frontend-builder, deployment-advisor

**Before scaling checklist:**
- [ ] Validation Gates 1-4 passed
- [ ] Product-market fit confirmed
- [ ] Unit economics understood
- [ ] Growth channels validated
- [ ] Team ready to execute

---

## 🚨 Warning Signs: Analysis Paralysis

**STOP and move forward if:**

### Research Phase (>2 weeks)
- You've been researching for >2 weeks
- You're analyzing competitors for >1 week
- You're creating detailed specs without talking to users
- **Action:** STOP researching. Move to customer interviews.

### Design Phase (>3 days without code)
- You're designing architecture for >3 days
- You're choosing tech stack for >2 days
- You're planning perfect database schema
- **Action:** STOP designing. Build simplest version. Learn from implementation.

### Validation Phase (>2 weeks)
- You're perfecting landing page for >3 days
- You're building "better" prototype for >1 week
- You're waiting for "more data" for >2 weeks
- **Action:** STOP perfecting. Ship what you have. Get real feedback.

### Implementation Phase (>2 weeks for MVP)
- MVP is taking >2 weeks
- You're adding "just one more feature"
- You're optimizing before anyone uses it
- **Action:** STOP building. Cut scope by 50%. Ship NOW.

---

## 💰 Cost Reality Check

### Validation Costs (Phase 1-2)

| Method | Time | Cost | Learning |
|--------|------|------|----------|
| Customer interviews | 1-2 weeks | $0 | Problem validation |
| Landing page | 1-2 days | $50-100 | Demand validation |
| Concierge MVP | 1 week | $0 | Solution validation |
| Prototype test | 3-5 days | $0 | Usability validation |

**Total validation:** 2-4 weeks, $0-200

### Building Without Validation

| Approach | Time | Cost | Risk |
|----------|------|------|------|
| Full SaaS build | 4-8 weeks | $500-1500 | 80% fail |
| RAG system | 2-4 weeks | $200-600 | 70% unnecessary |
| Multi-agent | 3-6 weeks | $300-1000 | 75% overkill |

**Average waste:** 4-6 weeks, $400-800, 75% wrong solution

### ROI Calculation

**Cost of validation:** 2-4 weeks, $100-300
**Cost of building wrong thing:** 6-12 weeks, $500-1500
**Success rate with validation:** 60% (vs 20% without)

**Expected savings per project:** 4-8 weeks, $400-1200

---

## 📋 Checklists

### Project Start Checklist

Before writing ANY code:
- [ ] Problem hypothesis defined
- [ ] 10+ customer discovery interviews scheduled
- [ ] Mom Test questions prepared
- [ ] Problem severity matrix ready
- [ ] Validation method chosen (landing page, concierge, etc.)

### Before Building MVP

- [ ] Problem validated (Validation Gate 1 passed)
- [ ] Solution validated (Validation Gate 2 passed)
- [ ] P0/P1/P2 features defined
- [ ] MVP scope ≤2 weeks of work
- [ ] Metrics defined
- [ ] User recruitment plan ready

### Before Scaling

- [ ] All 4 validation gates passed
- [ ] 3+ months of data
- [ ] 100+ active users
- [ ] Retention >40%
- [ ] Unit economics positive
- [ ] Team ready to scale

---

## 🎯 Common Scenarios

### Scenario 1: "I have a great idea for an app"

**DON'T:**
- ❌ Jump into coding
- ❌ Start with tech stack selection
- ❌ Build prototype to show friends

**DO:**
- ✅ Define problem hypothesis
- ✅ Interview 10-15 potential users
- ✅ Test with landing page
- ✅ Build only if validated

### Scenario 2: "Users said they want feature X"

**DON'T:**
- ❌ Immediately build feature X
- ❌ Add to backlog without validation
- ❌ Trust verbal feedback alone

**DO:**
- ✅ Observe if they actually need it (do they have workaround?)
- ✅ Test with fake door (button that does nothing, see if clicked)
- ✅ Manual concierge delivery first
- ✅ Build only if they actually use it

### Scenario 3: "I need AI/RAG for this project"

**DON'T:**
- ❌ Immediately set up vector database
- ❌ Start with complex RAG architecture
- ❌ Build before knowing if users want AI

**DO:**
- ✅ Test if users actually want AI-powered solution
- ✅ Try simple keyword search first
- ✅ Manual curation as concierge MVP
- ✅ Build RAG only if simple solutions don't work

### Scenario 4: "I'm stuck analyzing competitors"

**STOP signal:** You've been researching for >1 week

**Action:**
1. Pick top 2-3 competitors only
2. Document their 3 main strengths/weaknesses
3. Define your 1-2 key differentiators
4. STOP researching
5. Move to customer validation

---

## 📚 Related Resources

**Skills to use:**
- **product-strategist** - Detailed validation methodology
- **mvp-builder** - MVP patterns and prioritization
- **user-researcher** - Interview techniques

**Skills to avoid until validated:**
- ⚠️ api-designer (until solution validated)
- ⚠️ frontend-builder (until MVP validated)
- ⚠️ deployment-advisor (until scaling)
- ⚠️ rag-implementer (until you know you need RAG)
- ⚠️ multi-agent-architect (until you know you need agents)

**Other playbooks:**
- `avoid-analysis-paralysis.md` - Time limits and triggers
- `deployment-checklist.md` - When ready to scale

---

## 🎓 Key Takeaways

1. **Validate problems before solutions** - Don't assume you know what users need
2. **Validate solutions before building** - Test with cheapest method possible
3. **Build minimum to learn maximum** - Every line of code has carrying cost
4. **Set time limits** - 2 weeks discovery, 3 days validation, 2 weeks MVP
5. **Track validation gates** - Don't skip phases
6. **Cost discipline** - <$200 to validate, <$1000/month before scaling
7. **Kill quickly** - If not working after 6 months, stop

---

## ✅ Success Criteria

**You're doing it right if:**
- ✅ Talked to 10+ users before writing code
- ✅ Tested with landing page or concierge before building
- ✅ MVP took <2 weeks and cost <$200
- ✅ Have usage metrics from real users
- ✅ Can explain why users care about your product (not why you think they should)
- ✅ Pivoted or stopped 1-2 ideas before finding one that works

**You're doing it wrong if:**
- ❌ Building for >2 weeks without users
- ❌ Spent >$500 before validation
- ❌ Haven't talked to users yet
- ❌ Researching for >2 weeks
- ❌ Optimizing before anyone uses it
- ❌ Can't articulate why users care

---

**Remember: The best code is no code. Validate first, build later.**
