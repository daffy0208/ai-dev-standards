# Naming Conventions

Comprehensive naming conventions for files, variables, functions, classes, and more.

## Table of Contents

- [General Principles](#general-principles)
- [File Naming](#file-naming)
- [Variable Naming](#variable-naming)
- [Function Naming](#function-naming)
- [Class Naming](#class-naming)
- [Component Naming (React)](#component-naming-react)
- [Type & Interface Naming](#type--interface-naming)
- [Constant Naming](#constant-naming)
- [Database Naming](#database-naming)
- [API Naming](#api-naming)
- [CSS/Tailwind Naming](#csstailwind-naming)

---

## General Principles

### Core Rules

1. **Be Descriptive**: Names should clearly indicate purpose
2. **Be Consistent**: Follow established patterns in the codebase
3. **Avoid Abbreviations**: Unless they're universally understood (e.g., `id`, `url`)
4. **Use Pronounceable Names**: Code is read more than written
5. **Avoid Mental Mapping**: Don't require readers to translate names in their heads

### Case Conventions

- **camelCase**: Variables, functions, methods
- **PascalCase**: Classes, types, interfaces, components
- **kebab-case**: Files, directories, URLs, CSS classes
- **UPPER_SNAKE_CASE**: Constants, environment variables
- **snake_case**: Database tables/columns

---

## File Naming

### TypeScript/JavaScript Files

```
✅ Good
user-service.ts
auth-controller.ts
data-fetcher.ts
string-utils.ts

❌ Bad
UserService.ts          # Should be kebab-case
auth_controller.ts      # Use kebab, not snake
dataFetcher.ts          # Not camelCase for files
stringUtils.ts          # Not camelCase for files
```

### React Component Files

```
✅ Good
Button.tsx              # PascalCase for components
UserProfile.tsx
SearchInput.tsx

❌ Bad
button.tsx              # Components should be PascalCase
userProfile.tsx         # Not camelCase
search-input.tsx        # Not kebab-case for components
```

### Test Files

```
✅ Good
user-service.test.ts
Button.test.tsx
auth-controller.spec.ts

❌ Bad
user-service-test.ts    # Use .test or .spec
UserService.test.ts     # Match source file casing
```

### Configuration Files

```
✅ Good
tsconfig.json
.env.local
vite.config.ts
next.config.js

✅ Convention
Always use lowercase for config files
```

---

## Variable Naming

### General Variables

```typescript
✅ Good
const userId = '123'
const isAuthenticated = false
const userData = { name: 'John' }
let totalCount = 0
const maxRetries = 3

❌ Bad
const user_id = '123'          # Use camelCase
const isauthenticated = false  # No separation
const data = { name: 'John' }  # Too generic
let count = 0                  # Ambiguous context
const MAX_RETRIES = 3          # Not a constant if lowercase
```

### Boolean Variables

```typescript
✅ Good - Use is/has/can/should prefixes
const isLoading = true
const hasPermission = false
const canEdit = true
const shouldRedirect = false
const wasSuccessful = true

❌ Bad
const loading = true           # Not clear it's boolean
const permission = false       # Ambiguous type
const edit = true              # Too terse
```

### Arrays

```typescript
✅ Good - Plural names
const users = []
const items = []
const errorMessages = []
const selectedIds = []

❌ Bad
const userList = []            # Redundant "List"
const user = []                # Should be plural
const errorMessage = []        # Not plural
```

### Objects

```typescript
✅ Good
const userConfig = {}
const apiResponse = {}
const formData = {}
const themeSettings = {}

❌ Bad
const userConfigObject = {}    # Redundant "Object"
const response = {}            # Too generic
const data = {}                # Too generic
```

---

## Function Naming

### General Functions

```typescript
✅ Good - Verb + Noun
function fetchUserData() {}
function calculateTotal() {}
function validateEmail() {}
function formatDate() {}
function parseJSON() {}

❌ Bad
function userData() {}         # Missing verb
function total() {}            # Not clear it calculates
function email() {}            # Ambiguous
function date() {}             # Too generic
```

### Action Handlers

```typescript
✅ Good - handle/on prefix
function handleSubmit() {}
function handleClick() {}
function onUserLogin() {}
function onFormChange() {}

❌ Bad
function submit() {}           # Missing handle/on
function clickHandler() {}     # Should be handleClick
function userLogin() {}        # Missing on prefix
```

### Predicates (Return Boolean)

```typescript
✅ Good - is/has/can/should prefix
function isValidEmail(email: string): boolean {}
function hasPermission(user: User): boolean {}
function canEditPost(post: Post): boolean {}
function shouldRedirect(): boolean {}

❌ Bad
function checkEmail() {}       # Use isValidEmail
function permission() {}       # Use hasPermission
function editPost() {}         # Use canEditPost
```

### Getters/Setters

```typescript
✅ Good
function getUserById(id: string) {}
function setUserName(name: string) {}
function getCurrentTheme() {}
function updateUserProfile(data: Profile) {}

❌ Bad
function user(id: string) {}       # Missing get
function name(name: string) {}     # Ambiguous
function theme() {}                # Missing get
```

---

## Class Naming

### Classes

```typescript
✅ Good - PascalCase, Noun
class User {}
class AuthService {}
class DataController {}
class EmailValidator {}
class APIClient {}

❌ Bad
class user {}                  # Use PascalCase
class AuthenticationService {} # Too verbose
class Data {}                  # Too generic
class Validator {}             # Not specific enough
```

### Methods

```typescript
✅ Good
class UserService {
  getUser(id: string) {}
  createUser(data: UserData) {}
  deleteUser(id: string) {}
  validateUser(user: User) {}
  isActive(user: User): boolean {}
}

❌ Bad
class UserService {
  user(id: string) {}          # Missing verb
  new(data: UserData) {}       # Use create
  remove(id: string) {}        # Use delete for consistency
  validate(user: User) {}      # Use validateUser
}
```

### Private Methods/Properties

```typescript
✅ Good - Use # or _ prefix
class UserService {
  #apiKey: string
  private _cache: Map<string, User>

  #validateInput(data: any) {}
  private _fetchFromCache(id: string) {}
}
```

---

## Component Naming (React)

### Components

```typescript
✅ Good - PascalCase
function Button() {}
function UserProfile() {}
function SearchInput() {}
function DataTable() {}

❌ Bad
function button() {}           # Use PascalCase
function userProfile() {}      # Use PascalCase
function search_input() {}     # Not snake_case
```

### Component Props

```typescript
✅ Good - Descriptive, camelCase
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  onClick: () => void
  isLoading: boolean
  children: React.ReactNode
}

❌ Bad
interface ButtonProps {
  type: string               # Ambiguous name
  s: string                  # Too terse
  click: () => void          # Use onClick
  loading: boolean           # Use isLoading
}
```

### Hooks

```typescript
✅ Good - use prefix
function useAuth() {}
function useUser(id: string) {}
function useDebounce<T>(value: T, delay: number) {}
function useLocalStorage(key: string) {}

❌ Bad
function auth() {}             # Missing use prefix
function getUser() {}          # Should be useUser
function debounce() {}         # Missing use prefix
```

### Context

```typescript
✅ Good - Context suffix
const AuthContext = createContext()
const ThemeContext = createContext()
const UserContext = createContext()

// Provider suffix
function AuthProvider() {}
function ThemeProvider() {}
```

---

## Type & Interface Naming

### Interfaces

```typescript
✅ Good - PascalCase, descriptive
interface User {
  id: string
  name: string
}

interface APIResponse<T> {
  data: T
  error?: string
}

interface CreateUserRequest {
  name: string
  email: string
}

❌ Bad
interface IUser {}             # Avoid I prefix (except in special cases)
interface user {}              # Use PascalCase
interface Response {}          # Too generic
```

### Type Aliases

```typescript
✅ Good
type UserId = string
type UserStatus = 'active' | 'inactive' | 'suspended'
type AsyncState<T> = 'idle' | 'loading' | 'success' | 'error'

❌ Bad
type id = string               # Use PascalCase
type status = string           # Too generic
type State = any               # Avoid any
```

### Generics

```typescript
✅ Good - Single letter or descriptive
function identity<T>(value: T): T {}
function map<TInput, TOutput>(items: TInput[], fn: (item: TInput) => TOutput) {}

❌ Bad
function identity<Type>(value: Type) {}    # Just use T
function map<A, B>() {}                    # Use descriptive names
```

---

## Constant Naming

### Constants

```typescript
✅ Good - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT_MS = 5000
const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access'
}

❌ Bad
const maxRetryAttempts = 3     # Use UPPER_SNAKE_CASE
const apiBaseUrl = ''          # Use UPPER_SNAKE_CASE
const timeout = 5000           # Not descriptive enough
```

### Enum Values

```typescript
✅ Good - PascalCase
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST'
}

enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  ServerError = 500
}

❌ Bad
enum UserRole {
  ADMIN = 'ADMIN',     # Use PascalCase for enum keys
  USER = 'USER',
}
```

---

## Database Naming

### Tables

```sql
✅ Good - snake_case, plural
users
blog_posts
user_sessions
order_items

❌ Bad
Users                  -- Use lowercase
blogPosts              -- Use snake_case
user_session           -- Use plural
OrderItems             -- Use lowercase
```

### Columns

```sql
✅ Good - snake_case
id
user_id
created_at
updated_at
is_active
email_address

❌ Bad
userId                 -- Use snake_case
createdAt              -- Use snake_case
isActive               -- Use snake_case
```

### Foreign Keys

```sql
✅ Good - Singular table name + _id
user_id
post_id
author_id
category_id

❌ Bad
users_id               -- Use singular
postId                 -- Use snake_case
authorID               -- Use lowercase
```

---

## API Naming

### REST Endpoints

```
✅ Good - kebab-case, plural resources
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/blog-posts
GET    /api/user-sessions

❌ Bad
GET /api/user              -- Use plural
GET /api/getUsers          -- Don't include verb in URL
GET /api/Users             -- Use lowercase
GET /api/blog_posts        -- Use kebab-case
```

### GraphQL

```graphql
✅ Good - camelCase fields
type User {
  id: ID!
  firstName: String!
  lastName: String!
  emailAddress: String!
}

query {
  getUser(id: "123") {
    firstName
  }
}

❌ Bad
type User {
  ID: ID!              # Use lowercase
  first_name: String   # Use camelCase
}
```

---

## CSS/Tailwind Naming

### CSS Classes (BEM)

```css
✅ Good - kebab-case, BEM methodology
.button {}
.button--primary {}
.button--large {}
.button__icon {}
.card {}
.card__header {}
.card__body {}

❌ Bad
.Button {}                 /* Use lowercase */
.button_primary {}         /* Use -- for modifiers */
.buttonIcon {}             /* Use __ for elements */
```

### Tailwind Utilities

```tsx
✅ Good - Use standard Tailwind
<div className="flex items-center justify-between p-4 bg-blue-500">

✅ Custom classes - kebab-case
<div className="custom-button primary-variant">
```

---

## Summary Checklist

### Files
- [ ] Use kebab-case for non-component files
- [ ] Use PascalCase for React components
- [ ] Match test file names to source files

### Variables
- [ ] Use camelCase for variables
- [ ] Use is/has/can prefixes for booleans
- [ ] Use plural names for arrays

### Functions
- [ ] Start with verbs (get, set, fetch, create, update, delete)
- [ ] Use handle/on for event handlers
- [ ] Use is/has/can for predicates

### Classes & Types
- [ ] Use PascalCase for classes, interfaces, types
- [ ] Avoid I prefix for interfaces
- [ ] Use descriptive generic names

### Constants
- [ ] Use UPPER_SNAKE_CASE
- [ ] Make names descriptive

### Database
- [ ] Use snake_case for tables and columns
- [ ] Use plural for table names
- [ ] Use singular_id for foreign keys

### API
- [ ] Use kebab-case for REST endpoints
- [ ] Use plural resource names
- [ ] Use camelCase for GraphQL

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
