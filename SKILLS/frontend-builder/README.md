# Frontend Builder - Quick Start

**Version:** 1.0.0
**Category:** Technical Development
**Difficulty:** Intermediate

## What This Skill Does

Guides development of modern React and Next.js frontends with best practices for component architecture, state management, data fetching, forms, styling, and performance.

## When to Use

Use this skill when you need to:
- Build a new web application (React or Next.js)
- Choose frontend stack and architecture
- Structure components and folders
- Implement UI/UX designs
- Optimize frontend performance
- Set up state management

## Quick Start

**Fastest path to a production-ready frontend:**

1. **Choose framework**
   - Next.js: SEO, SSR, file routing (recommended for most)
   - React + Vite: Client-side only, simpler setup

2. **Initialize project**
   ```bash
   npx create-next-app@latest my-app --typescript --tailwind --app
   # or
   npm create vite@latest my-app -- --template react-ts
   ```

3. **Install core dependencies**
   ```bash
   npm install @tanstack/react-query zustand react-hook-form zod
   npm install -D @shadcn/ui
   ```

4. **Set up folder structure**
   ```
   app/ or src/
   ├── components/ui/        # shadcn components
   ├── components/features/  # Business logic
   ├── lib/                  # Utils, API client
   ├── hooks/                # Custom hooks
   └── stores/               # Zustand stores
   ```

5. **Build components**
   - Start with UI components (Button, Input, etc.)
   - Build feature components (UserList, Dashboard, etc.)
   - Compose pages from components

6. **Add data fetching** (React Query)
   - Queries for GET requests
   - Mutations for POST/PUT/DELETE
   - Automatic caching and revalidation

7. **Optimize**
   - Memoize expensive calculations (`useMemo`)
   - Memoize components (`memo`)
   - Code split heavy components (`dynamic`)

**Time to first page:** 1-2 days for setup + basic pages

## File Structure

```
frontend-builder/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- JavaScript/TypeScript basics
- React fundamentals (components, props, state, hooks)
- HTML and CSS

**Tools:**
- Node.js 18+ and npm/pnpm/yarn
- Code editor (VS Code recommended)
- Browser dev tools

**Related Skills:**
- `api-designer` helps design APIs to consume
- `ux-designer` provides designs to implement

## Success Criteria

You've successfully used this skill when:
- ✅ Next.js or React + Vite project set up with TypeScript
- ✅ Components organized in clear folder structure
- ✅ State management strategy chosen (useState → Context → Zustand)
- ✅ Data fetching implemented with React Query
- ✅ Forms handled with React Hook Form + Zod validation
- ✅ Styled with Tailwind CSS + shadcn/ui components
- ✅ Error boundaries implemented
- ✅ Performance optimizations applied (memoization, code splitting)
- ✅ TypeScript types defined for props and API responses

## Common Workflows

### Workflow 1: New Next.js App
1. Use frontend-builder to initialize Next.js with App Router
2. Set up shadcn/ui for component library
3. Install React Query for data fetching
4. Build page layouts and components
5. Use `api-designer` for backend API
6. Use `deployment-advisor` for hosting (Vercel recommended)

### Workflow 2: Complex State Management
1. Start with useState for local state
2. Lift state to parent when siblings need it
3. Use Context API for widely-used state (theme, auth)
4. Use Zustand for complex app state (shopping cart, filters)
5. Use React Query for server state (users, posts, products)

### Workflow 3: Performance Optimization
1. Use frontend-builder performance section
2. Identify slow renders with React DevTools Profiler
3. Apply useMemo for expensive calculations
4. Apply memo for frequently re-rendering components
5. Use Next.js dynamic imports for code splitting
6. Optimize images with Next.js Image component
7. Use `performance-optimizer` skill for advanced techniques

## Key Concepts

**Component Types:**
- **Page**: Route entry points (`app/users/page.tsx`)
- **Feature**: Business logic (`components/features/UserList.tsx`)
- **UI**: Reusable, no logic (`components/ui/button.tsx`)

**State Management Decision:**
```
One component → useState
Parent + children → Props
Siblings → Lift to parent
Widely used → Context API
Complex app state → Zustand
Server state → React Query
```

**Next.js vs React:**
- **Next.js**: SEO, SSR, file routing, image optimization, API routes
- **React + Vite**: Client-side, simpler, faster dev server, custom routing

**Styling Options:**
- **Tailwind CSS**: Utility-first, fast, no CSS files (recommended)
- **CSS Modules**: Scoped, traditional CSS
- **CSS-in-JS**: Styled-components, Emotion (less common now)

**Data Fetching:**
- **React Query**: Caching, revalidation, mutations (recommended)
- **SWR**: Similar to React Query, by Vercel
- **useEffect + fetch**: Manual, not recommended for production

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the frontend-builder skill to..."
- Mention keywords: "frontend", "React", "Next.js", "components", "UI"

**Choosing between Next.js and React?**
- Next.js: SEO needed, blog, marketing site, e-commerce, full-stack app
- React + Vite: Internal tool, admin panel, single-page app, no SEO
- Default recommendation: Next.js (more features, better DX)

**State management confusion?**
- Start simple: useState for component state
- Lift state up when siblings need it
- Context for app-wide state (theme, auth)
- Zustand for complex state (shopping cart, filters)
- React Query for server data (users, posts) - NOT Zustand
- Don't over-engineer: most apps only need useState + React Query

**Component re-rendering too much?**
- Use React DevTools Profiler to identify slow components
- Apply `memo` to expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props
- Check dependencies arrays in useEffect, useMemo, useCallback

**Forms not validating?**
- Use React Hook Form + Zod for validation
- Define Zod schema before form
- Use zodResolver in useForm
- Access errors via formState.errors
- Show error messages below inputs

**Tailwind classes not working?**
- Check tailwind.config.js includes content paths
- Restart dev server after config changes
- Use VS Code Tailwind CSS IntelliSense extension
- Check for typos in class names
- Use `cn()` helper from shadcn for conditional classes

**Build errors with TypeScript?**
- Define interfaces for all component props
- Type useState: `useState<User | null>(null)`
- Type API responses with interfaces
- Use `ReactNode` for children prop
- Enable strict mode in tsconfig.json

## Version History

- **1.0.0** (2025-10-21): Initial release, enhanced from frontend-builder skill with comprehensive Next.js and React Query coverage

## License

Part of ai-dev-standards repository.
