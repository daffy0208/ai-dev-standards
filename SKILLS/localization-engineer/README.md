# Localization Engineer Skill

Expert in internationalization (i18n), multi-language support, and localization.

## Quick Start

```bash
# Activate skill
claude-code --skill localization-engineer
```

## What This Skill Does

- 🌍 Implements multi-language support (next-intl)
- 📅 Formats dates/times per locale
- 💰 Formats numbers and currencies
- 🔄 Builds language switchers
- 📝 Manages translations
- 🌐 Supports RTL languages

## Common Tasks

### Setup i18n

```
"Set up internationalization for a Next.js app with English, Spanish, and Japanese"
```

### Add Translations

```
"Create translation files for the navigation menu and auth pages"
```

### Language Switcher

```
"Build a language switcher dropdown with flags"
```

### Format Dates

```
"Format this date according to the user's locale"
```

## Technologies

- **next-intl** - Next.js i18n library
- **Intl API** - Native formatting
- **TypeScript** - Type-safe translations
- **React** - UI components

## Example Output

```typescript
// Multi-language component
const t = useTranslations('auth')

<button>{t('login')}</button>
// en: "Log in"
// es: "Iniciar sesión"
// ja: "ログイン"
```

## Related Skills

- `copywriter` - Writing translations
- `seo-optimizer` - Multilingual SEO
- `accessibility-auditor` - Accessible i18n

## Learn More

See [SKILL.md](./SKILL.md) for comprehensive localization patterns.
