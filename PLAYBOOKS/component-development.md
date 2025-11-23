# Component Development Playbook

Comprehensive guide for creating reusable, accessible, and well-tested components.

## Table of Contents

1. [Overview](#overview)
2. [Component Design Principles](#component-design-principles)
3. [TypeScript Patterns](#typescript-patterns)
4. [Accessibility Guidelines](#accessibility-guidelines)
5. [Testing Components](#testing-components)
6. [Documentation](#documentation)
7. [Storybook Setup](#storybook-setup)
8. [Component Library Publishing](#component-library-publishing)
9. [Common Pitfalls](#common-pitfalls)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Building reusable components requires careful attention to API design, accessibility, performance, and developer experience.

### Component Types

1. **Presentational** - Pure UI, no business logic
2. **Container** - Connect to state/data
3. **Layout** - Structure and positioning
4. **Utility** - Shared functionality (hooks, contexts)

### Quality Checklist

- [ ] TypeScript types for all props
- [ ] Full accessibility support (ARIA, keyboard)
- [ ] Comprehensive tests (unit, integration, visual)
- [ ] Documentation with examples
- [ ] Performance optimized (memoization, lazy loading)
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] Error boundaries

---

## Component Design Principles

### 1. Single Responsibility

```typescript
// ❌ Bad: Component does too much
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user
    // Fetch posts
    // Handle errors
  }, []);

  return (
    <div>
      {/* User profile */}
      {/* Posts list */}
      {/* Analytics */}
      {/* Settings */}
    </div>
  );
}

// ✅ Good: Separated concerns
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserProfile />
      <PostsList />
      <Analytics />
      <Settings />
    </DashboardLayout>
  );
}
```

### 2. Composability

```typescript
// ✅ Composable Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card-footer">{children}</div>;
}

// Compose as needed
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### 3. Controlled vs Uncontrolled

```typescript
// Controlled component
interface ControlledInputProps {
  value: string;
  onChange: (value: string) => void;
}

function ControlledInput({ value, onChange }: ControlledInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// Uncontrolled component
interface UncontrolledInputProps {
  defaultValue?: string;
  onBlur?: (value: string) => void;
}

function UncontrolledInput({ defaultValue, onBlur }: UncontrolledInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      onBlur={() => onBlur?.(inputRef.current?.value || '')}
    />
  );
}

// Hybrid: Support both patterns
interface FlexibleInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function FlexibleInput({ value, defaultValue, onChange }: FlexibleInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <input
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
```

---

## TypeScript Patterns

### Proper Prop Types

```typescript
import React from 'react';

// Basic props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Extend HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

// Generic component
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
}

function Select<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue
}: SelectProps<T>) {
  return (
    <select
      value={value ? getOptionValue(value) : ''}
      onChange={(e) => {
        const selected = options.find(
          opt => getOptionValue(opt).toString() === e.target.value
        );
        if (selected) onChange(selected);
      }}
    >
      {options.map(option => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
}

// Discriminated unions
type ButtonProps =
  | {
      variant: 'link';
      href: string;
      onClick?: never;
    }
  | {
      variant?: 'primary' | 'secondary';
      href?: never;
      onClick: () => void;
    };
```

### Polymorphic Components

```typescript
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & React.ComponentPropsWithoutRef<E>;

function Text<E extends React.ElementType = 'span'>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || 'span';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Text>Default span</Text>
<Text as="p">Paragraph</Text>
<Text as="h1">Heading</Text>
<Text as="a" href="/link">Link</Text>
```

---

## Accessibility Guidelines

### ARIA Attributes

```typescript
function Modal({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      // Trap focus
      const previouslyFocused = document.activeElement as HTMLElement;
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        <button
          aria-label="Close modal"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
function Dropdown({
  trigger,
  items,
  onSelect
}: {
  trigger: React.ReactNode;
  items: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex].id);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Screen Reader Support

```typescript
function ProgressBar({
  value,
  max = 100,
  label
}: {
  value: number;
  max?: number;
  label: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      aria-valuetext={`${percentage.toFixed(0)}%`}
    >
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
      <span className="sr-only">{label}: {percentage.toFixed(0)}%</span>
    </div>
  );
}
```

---

## Testing Components

### Unit Tests with Vitest + React Testing Library

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('btn-primary');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('btn-danger');
  });
});
```

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Click me</Button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has correct ARIA attributes', () => {
    render(<Button loading>Loading</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    button.focus();

    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();

    handleClick.mockClear();
    await userEvent.keyboard('{ }'); // Space
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Form Integration', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();

    render(
      <Form onSubmit={handleSubmit}>
        <Input name="email" label="Email" type="email" />
        <Input name="password" label="Password" type="password" />
        <Button type="submit">Submit</Button>
      </Form>
    );

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows validation errors', async () => {
    render(
      <Form>
        <Input name="email" label="Email" type="email" required />
        <Button type="submit">Submit</Button>
      </Form>
    );

    await userEvent.click(screen.getByText('Submit'));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });
});
```

---

## Documentation

### Component Documentation Template

````typescript
/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @example Loading state
 * ```tsx
 * <Button loading>Processing...</Button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  ...props
}: ButtonProps) {
  // Implementation
}
````

### README Template

````markdown
# Button Component

Versatile button component with multiple variants and states.

## Installation

```bash
npm install @yourorg/components
```

## Usage

```tsx
import { Button } from '@yourorg/components'

function App() {
  return (
    <Button variant="primary" onClick={handleClick}>
      Click me
    </Button>
  )
}
```

## Props

| Prop       | Type                                   | Default     | Description          |
| ---------- | -------------------------------------- | ----------- | -------------------- |
| `variant`  | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style variant |
| `size`     | `'sm' \| 'md' \| 'lg'`                 | `'md'`      | Button size          |
| `disabled` | `boolean`                              | `false`     | Disable the button   |
| `loading`  | `boolean`                              | `false`     | Show loading spinner |
| `onClick`  | `(event: MouseEvent) => void`          | -           | Click handler        |

## Examples

### Primary Button

```tsx
<Button variant="primary">Primary</Button>
```

### Loading State

```tsx
<Button loading>Processing...</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

## Accessibility

- Full keyboard support (Enter/Space)
- ARIA attributes for screen readers
- Focus management
- High contrast mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
````

---

## Storybook Setup

### Install Storybook

```bash
npx storybook@latest init
```

### Write Stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary'
  }
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true
  }
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true
  }
};

// Interactive story
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  )
};
```

---

## Component Library Publishing

### Package Configuration

```json
{
  "name": "@yourorg/components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### Rollup Configuration

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  external: ['react', 'react-dom'],
  plugins: [typescript({ tsconfig: './tsconfig.json' }), postcss({ extract: true, minimize: true })]
}
```

---

## Common Pitfalls

1. **Not memoizing expensive computations** → Use `useMemo`
2. **Missing key props in lists** → Always provide unique keys
3. **Not handling loading/error states** → Show appropriate UI
4. **Poor accessibility** → Follow ARIA guidelines
5. **No TypeScript types** → Provide full type coverage
6. **Inconsistent API** → Follow established patterns

---

## Troubleshooting

### Issue: Component Re-renders Too Often

**Solution**: Use `React.memo` and `useCallback`

```typescript
const MemoizedComponent = React.memo(function Component({ data }) {
  return <div>{data}</div>;
});

const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Issue: Accessibility Warnings

**Solution**: Add proper ARIA attributes and labels

---

## Related Resources

### Skills

- frontend-builder
- design-system-architect
- accessibility-engineer

### Components

- `/COMPONENTS/ui-components/` - UI component library

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
