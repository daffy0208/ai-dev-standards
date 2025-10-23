# Skill-to-MCP Gap Analysis

**Date:** 2025-10-22
**Status:** 🚨 **CRITICAL GAP IDENTIFIED**
**Priority:** HIGH - Skills without tools are just documentation

---

## 🎯 The Core Problem

**User's Observation:**
> "Skills are the HOW we do something and MCPs are the ACTIONS that put that into practice, so if this is the case then why do we have so many skills but no MCPs?"

**Current State:**
- **36 Skills** (methodologies describing HOW to do things)
- **3 MCPs** (tools that actually DO things)
- **Ratio:** 12:1 (should be closer to 1:1 or 2:1)

**The Issue:**
Having skills without MCPs is like having 36 instruction manuals but only 3 tools. Skills are **aspirational** (telling AI what to do) but not **actionable** (giving AI tools to do it).

---

## 📊 Skill-to-MCP Mapping Analysis

### ✅ Skills WITH Corresponding MCPs

1. **accessibility-engineer** → `accessibility-checker-mcp`
   - ✅ Has WCAG compliance checking
   - ✅ Uses axe-core for validation

2. **frontend-builder** → `component-generator-mcp`
   - ✅ Has React component generation
   - ✅ Includes test generation

3. **quality-auditor** / **testing-strategist** → `screenshot-testing-mcp`
   - ✅ Has visual regression testing
   - ✅ Uses Playwright

**Total: 3 skills with MCPs (8% coverage)**

---

### 🚨 Skills WITHOUT Corresponding MCPs (33 skills - 92%)

#### Category: AI & RAG (HIGH PRIORITY)

**4. rag-implementer** ❌ NEEDS:
- `vector-database-mcp` - Pinecone/Weaviate/Chroma operations
- `embedding-generator-mcp` - Generate embeddings for documents
- `semantic-search-mcp` - Search and retrieval operations
- `document-processor-mcp` - Chunk, process, index documents

**5. multi-agent-architect** ❌ NEEDS:
- `agent-orchestrator-mcp` - Coordinate multi-agent workflows
- `agent-monitor-mcp` - Track agent performance and costs
- `conversation-manager-mcp` - Manage agent conversations

**6. knowledge-graph-builder** ❌ NEEDS:
- `neo4j-mcp` - Neo4j operations (create nodes, relationships, query)
- `graph-visualizer-mcp` - Visualize graph structures
- `ontology-builder-mcp` - Build knowledge ontologies

#### Category: Product Development (HIGH PRIORITY)

**7. mvp-builder** ❌ NEEDS:
- `feature-prioritizer-mcp` - P0/P1/P2 priority matrix tool
- `risk-analyzer-mcp` - Identify and score riskiest assumptions
- `mvp-tracker-mcp` - Track MVP progress and metrics

**8. product-strategist** ❌ NEEDS:
- `interview-transcriber-mcp` - Transcribe user interviews
- `survey-collector-mcp` - Collect and analyze survey data
- `user-insight-analyzer-mcp` - Extract insights from user feedback
- `problem-matrix-mcp` - Problem severity scoring

**9. user-researcher** ❌ NEEDS:
- `interview-scheduler-mcp` - Schedule user interviews
- `feedback-aggregator-mcp` - Aggregate feedback from multiple sources
- `persona-generator-mcp` - Generate user personas from data

**10. go-to-market-planner** ❌ NEEDS:
- `market-analyzer-mcp` - Analyze market size and trends
- `competitor-tracker-mcp` - Track competitor activities
- `launch-checklist-mcp` - GTM task tracking

#### Category: Development & Engineering (MEDIUM PRIORITY)

**11. api-designer** ❌ NEEDS:
- `openapi-generator-mcp` - Generate OpenAPI specs
- `api-validator-mcp` - Validate API schemas
- `api-docs-generator-mcp` - Generate API documentation
- `postman-collection-mcp` - Create Postman collections

**12. deployment-advisor** ❌ NEEDS:
- `infra-provisioner-mcp` - Provision cloud resources (Vercel, Railway, AWS)
- `monitoring-setup-mcp` - Set up monitoring (Sentry, DataDog)
- `ci-cd-generator-mcp` - Generate CI/CD configs

**13. performance-optimizer** ❌ NEEDS:
- `performance-profiler-mcp` - Profile application performance
- `bundle-analyzer-mcp` - Analyze bundle sizes
- `lighthouse-runner-mcp` - Run Lighthouse audits
- `database-query-analyzer-mcp` - Analyze and optimize queries

**14. security-engineer** ❌ NEEDS:
- `vulnerability-scanner-mcp` - Scan for security vulnerabilities
- `dependency-auditor-mcp` - Audit npm/pip dependencies
- `secrets-detector-mcp` - Detect exposed secrets
- `penetration-tester-mcp` - Basic penetration testing

**15. data-engineer** ❌ NEEDS:
- `etl-pipeline-builder-mcp` - Build ETL pipelines
- `data-quality-checker-mcp` - Check data quality
- `schema-migrator-mcp` - Manage schema migrations

#### Category: Design & UX (MEDIUM PRIORITY)

**16. ux-designer** ❌ NEEDS:
- `wireframe-generator-mcp` - Generate wireframes from descriptions
- `design-system-checker-mcp` - Validate design system compliance
- `user-flow-visualizer-mcp` - Visualize user flows

**17. design-system-architect** ❌ NEEDS:
- `component-cataloger-mcp` - Catalog design system components
- `design-token-manager-mcp` - Manage design tokens
- `style-guide-generator-mcp` - Generate style guides

**18. 3d-visualizer** ❌ NEEDS:
- `model-loader-mcp` - Load 3D models (GLB, FBX, OBJ)
- `scene-optimizer-mcp` - Optimize 3D scenes
- `texture-compressor-mcp` - Compress textures

**19. visual-designer** ❌ NEEDS:
- `image-optimizer-mcp` - Optimize images (compress, resize, convert)
- `color-palette-generator-mcp` - Generate color palettes
- `asset-manager-mcp` - Manage design assets

#### Category: Content & Media (LOW PRIORITY)

**20. copywriter** ❌ NEEDS:
- `seo-analyzer-mcp` - Analyze SEO for copy
- `readability-checker-mcp` - Check readability scores
- `plagiarism-detector-mcp` - Detect plagiarism

**21. technical-writer** ❌ NEEDS:
- `doc-generator-mcp` - Generate documentation from code
- `diagram-generator-mcp` - Generate diagrams (Mermaid, PlantUML)
- `changelog-generator-mcp` - Generate changelogs from commits

**22. video-producer** ❌ NEEDS:
- `video-transcoder-mcp` - Transcode video formats
- `subtitle-generator-mcp` - Generate subtitles
- `thumbnail-generator-mcp` - Generate video thumbnails

**23. audio-producer** ❌ NEEDS:
- `audio-transcoder-mcp` - Transcode audio formats
- `audio-normalizer-mcp` - Normalize audio levels
- `speech-to-text-mcp` - Transcribe audio

#### Category: Specialized (VARYING PRIORITY)

**24. mobile-developer** ❌ NEEDS:
- `expo-cli-mcp` - Expo operations (build, publish, update)
- `app-store-publisher-mcp` - Publish to App Store/Play Store
- `mobile-testing-mcp` - Mobile device testing

**25. iot-developer** ❌ NEEDS:
- `mqtt-client-mcp` - MQTT pub/sub operations
- `device-simulator-mcp` - Simulate IoT devices
- `sensor-data-collector-mcp` - Collect sensor data

**26. spatial-developer** ❌ NEEDS:
- `ar-scene-builder-mcp` - Build AR scenes
- `spatial-anchor-manager-mcp` - Manage spatial anchors
- `vision-pro-simulator-mcp` - Simulate Vision Pro

**27. voice-interface-builder** ❌ NEEDS:
- `voice-synthesizer-mcp` - Text-to-speech
- `voice-recognizer-mcp` - Speech-to-text
- `voice-interaction-tester-mcp` - Test voice interactions

**28. localization-engineer** ❌ NEEDS:
- `translation-manager-mcp` - Manage translations
- `locale-validator-mcp` - Validate locale files
- `rtl-tester-mcp` - Test RTL layouts

**29. livestream-engineer** ❌ NEEDS:
- `stream-encoder-mcp` - Encode streams (RTMP, HLS)
- `chat-moderator-mcp` - Moderate chat
- `analytics-tracker-mcp` - Track stream analytics

#### Category: Productivity & Workflow (MEDIUM PRIORITY)

**30. task-breakdown-specialist** ❌ NEEDS:
- `epic-breaker-mcp` - Break epics into stories
- `estimation-helper-mcp` - Help estimate tasks
- `dependency-mapper-mcp` - Map task dependencies

**31. context-preserver** ❌ NEEDS:
- `context-saver-mcp` - Save development context (files, cursor positions, mental notes)
- `context-restorer-mcp` - Restore saved context
- `focus-timer-mcp` - Track focus sessions

**32. focus-session-manager** ❌ NEEDS:
- `pomodoro-timer-mcp` - Pomodoro technique timer
- `distraction-blocker-mcp` - Block distracting websites
- `break-reminder-mcp` - Remind to take breaks

#### Category: Already Specialized Tools (LOW PRIORITY)

**33. animation-designer** ⚠️ (Framer Motion - code-based, may not need MCP)
**34. brand-designer** ⚠️ (Design tools external, may not need MCP)
**35. data-visualizer** ⚠️ (Chart libraries - code-based, may not need MCP)
**36. testing-strategist** ✅ (Partially covered by screenshot-testing-mcp)

---

## 📊 Priority Matrix

### High Priority (Must Have) - 10 MCPs

These directly enable core skills and provide immediate value:

1. **vector-database-mcp** → Enables rag-implementer
2. **embedding-generator-mcp** → Enables rag-implementer
3. **interview-transcriber-mcp** → Enables product-strategist, user-researcher
4. **feature-prioritizer-mcp** → Enables mvp-builder
5. **openapi-generator-mcp** → Enables api-designer
6. **infra-provisioner-mcp** → Enables deployment-advisor
7. **performance-profiler-mcp** → Enables performance-optimizer
8. **vulnerability-scanner-mcp** → Enables security-engineer
9. **doc-generator-mcp** → Enables technical-writer
10. **agent-orchestrator-mcp** → Enables multi-agent-architect

**Impact:** These 10 MCPs would bring 10 critical skills from aspirational to actionable.

---

### Medium Priority (Should Have) - 15 MCPs

These enhance key workflows:

11. **api-validator-mcp** → Enhances api-designer
12. **monitoring-setup-mcp** → Enhances deployment-advisor
13. **bundle-analyzer-mcp** → Enhances performance-optimizer
14. **dependency-auditor-mcp** → Enhances security-engineer
15. **wireframe-generator-mcp** → Enables ux-designer
16. **design-system-checker-mcp** → Enables design-system-architect
17. **image-optimizer-mcp** → Enables visual-designer
18. **seo-analyzer-mcp** → Enhances copywriter
19. **epic-breaker-mcp** → Enables task-breakdown-specialist
20. **context-saver-mcp** → Enables context-preserver
21. **pomodoro-timer-mcp** → Enables focus-session-manager
22. **expo-cli-mcp** → Enables mobile-developer
23. **mqtt-client-mcp** → Enables iot-developer
24. **translation-manager-mcp** → Enables localization-engineer
25. **user-insight-analyzer-mcp** → Enhances product-strategist

---

### Low Priority (Nice to Have) - 20+ MCPs

These provide specialized functionality for niche use cases:

- Media processing (video-transcoder, audio-normalizer, etc.)
- 3D/spatial (model-loader, ar-scene-builder, etc.)
- Advanced analytics (market-analyzer, competitor-tracker, etc.)
- Specialized tools (plagiarism-detector, rtl-tester, etc.)

---

## 🎯 Recommended Implementation Plan

### Phase 1: Foundation (High Priority) - 4 weeks

**Week 1-2: RAG & AI Foundations**
1. `vector-database-mcp` - Pinecone, Weaviate, Chroma operations
2. `embedding-generator-mcp` - OpenAI, Cohere embeddings
3. `semantic-search-mcp` - Search and retrieval

**Week 3-4: Product Development**
4. `interview-transcriber-mcp` - Whisper API integration
5. `feature-prioritizer-mcp` - P0/P1/P2 matrix tool
6. `user-insight-analyzer-mcp` - Analyze feedback

**Target:** 6 MCPs → 6 more skills actionable

---

### Phase 2: Engineering Essentials (Medium Priority) - 4 weeks

**Week 5-6: API & Deployment**
7. `openapi-generator-mcp` - Generate API specs
8. `api-validator-mcp` - Validate schemas
9. `infra-provisioner-mcp` - Vercel, Railway, AWS

**Week 7-8: Quality & Security**
10. `performance-profiler-mcp` - Profile applications
11. `vulnerability-scanner-mcp` - Security scanning
12. `dependency-auditor-mcp` - Audit dependencies

**Target:** 6 MCPs → 6 more skills actionable

---

### Phase 3: Design & UX (Medium Priority) - 3 weeks

**Week 9-10: Design Tools**
13. `wireframe-generator-mcp` - Generate wireframes
14. `design-system-checker-mcp` - Check design compliance
15. `image-optimizer-mcp` - Optimize images

**Week 11: Documentation**
16. `doc-generator-mcp` - Generate docs from code
17. `diagram-generator-mcp` - Mermaid, PlantUML

**Target:** 5 MCPs → 5 more skills actionable

---

### Phase 4: Productivity & Workflow (Low Priority) - 2 weeks

**Week 12-13: Developer Experience**
18. `context-saver-mcp` - Save/restore context
19. `epic-breaker-mcp` - Break down tasks
20. `pomodoro-timer-mcp` - Focus sessions

**Target:** 3 MCPs → 3 more skills actionable

---

### Phase 5: Specialized (As Needed) - Ongoing

Build specialized MCPs based on user demand:
- Mobile development (Expo, app stores)
- IoT (MQTT, device simulation)
- 3D/spatial (model loading, AR)
- Media processing (video, audio)
- Advanced analytics

**Target:** 10+ MCPs for specialized use cases

---

## 📊 Success Metrics

### Coverage Goals

**Current:**
- 3 MCPs for 36 skills = 8% actionable

**After Phase 1:**
- 9 MCPs for 36 skills = 25% actionable

**After Phase 2:**
- 15 MCPs for 36 skills = 42% actionable

**After Phase 3:**
- 20 MCPs for 36 skills = 56% actionable

**Target (End of Year):**
- 30 MCPs for 36 skills = 83% actionable

---

## 🚨 Critical Insights

### 1. Skills vs MCPs Alignment

**Problem:** We built 36 skills describing HOW to do things but only 3 tools to actually DO them.

**Root Cause:** Focus on methodologies over implementation.

**Solution:** For every new skill, require at least 1 corresponding MCP.

---

### 2. Audit Should Catch This

**Why the audit missed this:**

The quality audit scored 8.6/10 but didn't check:
- ❌ Do skills have corresponding MCPs?
- ❌ Are skills actionable or just aspirational?
- ❌ Can AI actually execute what skills describe?

**Add to audit checklist:**
```markdown
## Skill-MCP Alignment (CRITICAL)

- [ ] For each skill, identify required MCPs
- [ ] Calculate skill-to-MCP ratio (should be <2:1)
- [ ] List skills without MCPs
- [ ] Prioritize MCP development

**Critical Failure Condition:**
- Skill-to-MCP ratio >5:1 → Audit fails
- >50% skills without MCPs → Audit fails
```

---

### 3. This is a Validation Issue

**Pattern:** We validated problem (need skills) but not solution (need tools).

This is the SAME issue as:
- Building RAG without testing FAQ page first
- Building multi-agent without testing single agent
- Building skills without building MCPs

**Learning:** Validate the complete workflow, not just the methodology.

---

## 🎯 Immediate Actions

### 1. Add to Audit Checklist ✅

Update `DOCS/AUDIT-VALIDATION-CHECKLIST.md`:
- Add "Skill-MCP Alignment" section
- Set ratio threshold (>3:1 is yellow flag, >5:1 is red flag)
- Require MCP roadmap if ratio too high

### 2. Update Quality Auditor Skill ✅

Update `SKILLS/quality-auditor/SKILL.md`:
- Add Phase 0 check for skill-MCP alignment
- Score "Completeness" dimension based on actionability

### 3. Create MCP Development Roadmap ✅

Create `DOCS/MCP-DEVELOPMENT-ROADMAP.md`:
- List all 33 skills without MCPs
- Prioritize by impact
- Set quarterly targets

### 4. Update Documentation ✅

Update:
- `README.md` - Acknowledge the gap
- `DOCS/RESOURCE-INDEX.md` - Show skill-MCP mapping
- `META/DECISION-FRAMEWORK.md` - Add "skill without MCP" as validation failure

### 5. Establish Policy ✅

**New Policy:** Every new skill MUST have at least 1 corresponding MCP OR clear justification why not needed.

**Exceptions:**
- Skills that are pure methodology (product-strategist can work with manual tools)
- Skills that use existing code libraries (animation-designer uses Framer Motion)
- Skills in design domains external to code (brand-designer uses Figma)

---

## 📝 Key Takeaways

1. **Skills without tools are aspirational, not actionable**
2. **12:1 ratio is a critical gap (should be <2:1)**
3. **Audit should validate skill-MCP alignment**
4. **Prioritize MCPs by skill impact**
5. **Require MCPs for new skills**

---

## 🔗 Related Documents

- **Audit Checklist:** `DOCS/AUDIT-VALIDATION-CHECKLIST.md`
- **Quality Auditor:** `SKILLS/quality-auditor/SKILL.md`
- **Resource Index:** `DOCS/RESOURCE-INDEX.md`
- **Decision Framework:** `META/DECISION-FRAMEWORK.md`

---

**Status:** 🚨 Gap identified, action plan created, policy established

**Next Steps:** Implement Phase 1 MCPs (6 high-priority MCPs in 4 weeks)

**Last Updated:** 2025-10-22
