# Illustration Generator MCP Server

Generate custom illustrations, characters, and scenes with AI-powered illustration generation.

## Features

### Tools

#### `generateIllustration`
Generate custom illustrations from text descriptions with various artistic styles.

**Parameters:**
- `description` (string, required): Detailed illustration description
- `style` (string, required): Style - flat, 3d, hand-drawn, minimalist, geometric, isometric, line-art
- `colorPalette` (array): Color palette (default: modern tech colors)
- `aspectRatio` (string): Ratio - 1:1, 16:9, 4:3, 3:2, 9:16
- `complexity` (string): Detail level - simple, moderate, detailed, complex
- `format` (string): Output format - svg, png, jpg, webp

**Example:**
```typescript
{
  description: "A person working on a laptop in a modern office",
  style: "flat",
  colorPalette: ["#4F46E5", "#EC4899", "#10B981"],
  aspectRatio: "16:9",
  complexity: "moderate",
  format: "svg"
}
```

#### `generateCharacter`
Generate character illustrations with specific traits and poses.

**Parameters:**
- `traits` (object, required): Character traits
  - `age` (string): Age range
  - `gender` (string): Gender presentation
  - `profession` (string): Occupation or role
  - `personality` (string): Personality traits
  - `clothing` (string): Clothing style
- `style` (string, required): Style - cartoon, realistic, anime, chibi, pixel-art, vector
- `pose` (string): Pose - standing, sitting, walking, running, custom
- `expression` (string): Expression - happy, sad, neutral, excited, angry, surprised
- `backgroundColor` (string): Background color or transparent

**Example:**
```typescript
{
  traits: {
    profession: "software developer",
    personality: "focused and friendly",
    clothing: "casual business"
  },
  style: "flat",
  pose: "sitting",
  expression: "happy"
}
```

#### `generateScene`
Generate complete scene illustrations with environments and objects.

**Parameters:**
- `description` (string, required): Scene description
- `environment` (string): Type - indoor, outdoor, urban, nature, abstract, workspace
- `timeOfDay` (string): Lighting - morning, afternoon, evening, night
- `mood` (string): Mood - calm, energetic, mysterious, professional, playful
- `perspective` (string): View - front, side, top-down, isometric, 3-quarter
- `includeCharacters` (boolean): Include people in scene

**Example:**
```typescript
{
  description: "A modern coworking space with natural light",
  environment: "workspace",
  timeOfDay: "afternoon",
  mood: "professional",
  perspective: "3-quarter",
  includeCharacters: true
}
```

#### `customizeIllustration`
Customize existing illustrations with modifications.

**Parameters:**
- `illustrationId` (string, required): ID of illustration to modify
- `modifications` (object, required): Modifications to apply
  - `colorScheme` (array): New color palette
  - `style` (string): New style
  - `elements` (object): Elements to add/remove
  - `scale` (number): Scaling factor

**Example:**
```typescript
{
  illustrationId: "ill-1234567890",
  modifications: {
    colorScheme: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    elements: {
      add: ["laptop", "coffee cup"],
      remove: ["phone"]
    }
  }
}
```

### Resources

#### `illustration-generator://library`
JSON collection of all generated illustrations with metadata.

#### `illustration-generator://styles`
Complete guide to illustration styles and best practices.

## Setup

### Installation

```bash
cd MCP-SERVERS/illustration-generator-mcp
npm install
npm run build
```

### Configuration

```json
{
  "mcpServers": {
    "illustration-generator": {
      "command": "node",
      "args": ["path/to/illustration-generator-mcp/dist/index.js"]
    }
  }
}
```

## Supported Skills

- **visual-designer**: Generate design assets and visual content
- **brand-designer**: Create brand illustrations and mascots
- **ux-designer**: Generate UI illustrations and empty states

## Illustration Styles

### Flat Design
**Characteristics:**
- Simple geometric shapes
- Solid colors, no gradients
- Clean and minimal
- Fast to produce

**Best for:** Landing pages, app interfaces, presentations
**Examples:** Google Material Design, Dropbox illustrations

### 3D Illustrations
**Characteristics:**
- Depth and dimension
- Lighting and shadows
- Realistic textures
- High visual impact

**Best for:** Hero sections, product showcases, premium brands
**Examples:** Apple product pages, Stripe illustrations

### Hand-Drawn
**Characteristics:**
- Organic, imperfect lines
- Sketchy appearance
- Personal touch
- Approachable feel

**Best for:** Blogs, creative portfolios, indie brands
**Examples:** Mailchimp, Hootsuite illustrations

### Minimalist
**Characteristics:**
- Essential elements only
- 1-3 colors max
- Generous whitespace
- Elegant simplicity

**Best for:** Premium brands, luxury products, services
**Examples:** Apple marketing, luxury fashion

### Geometric
**Characteristics:**
- Mathematical shapes
- Pattern-based
- Abstract concepts
- Technical precision

**Best for:** Tech products, data visualization, startups
**Examples:** GitHub, Microsoft illustrations

### Isometric
**Characteristics:**
- 30-degree perspective
- Consistent angles
- 3D without perspective
- Technical clarity

**Best for:** Infographics, tutorials, architecture
**Examples:** Atlassian, Asana diagrams

### Line Art
**Characteristics:**
- Outlines only
- No fill colors
- Clean and precise
- Scalable

**Best for:** Icons, technical drawings, instructions
**Examples:** Technical manuals, assembly guides

## Character Design Guide

### Body Proportions

**Realistic:** 7-8 heads tall
**Cartoon:** 3-5 heads tall
**Chibi:** 2-3 heads tall

### Expression Guidelines

- **Happy:** Raised cheeks, open smile, bright eyes
- **Sad:** Downturned mouth, lowered eyebrows
- **Excited:** Wide eyes, big smile, animated pose
- **Neutral:** Balanced features, calm expression
- **Angry:** Furrowed brows, tense jaw
- **Surprised:** Wide eyes, open mouth, raised eyebrows

### Pose Suggestions

- **Standing:** Confident, neutral, professional
- **Sitting:** Relaxed, working, casual
- **Walking:** Dynamic, moving forward, active
- **Running:** Energetic, urgent, athletic
- **Custom:** Specific to your needs

## Scene Composition

### Environment Types

**Indoor:**
- Office, home, cafe, studio
- Controlled lighting
- Furniture and details
- Intimate feel

**Outdoor:**
- Nature, urban, parks
- Natural lighting
- Open space
- Dynamic weather

**Workspace:**
- Desk, computer, tools
- Professional context
- Organized layout
- Productivity focus

### Lighting & Mood

| Time | Lighting | Mood | Use Case |
|------|----------|------|----------|
| Morning | Soft, warm | Energetic, fresh | Productivity apps |
| Afternoon | Bright, clear | Professional | Business tools |
| Evening | Warm, golden | Relaxed | Social apps |
| Night | Cool, dim | Calm, intimate | Wellness apps |

## Color Psychology

### Primary Palettes

**Tech/Modern:**
- Blue: Trust, professionalism
- Purple: Innovation, creativity
- Green: Growth, success

**Creative/Playful:**
- Pink: Fun, youthful
- Orange: Energy, enthusiasm
- Yellow: Optimism, happiness

**Professional/Corporate:**
- Navy: Authority, stability
- Gray: Neutral, balanced
- Black: Sophistication, power

## Use Cases

1. **Landing Pages**: Hero illustrations, feature graphics
2. **Empty States**: Placeholder illustrations for UI
3. **Onboarding**: Tutorial and guide illustrations
4. **Marketing**: Social media graphics, ads
5. **Documentation**: Technical illustrations, guides
6. **Presentations**: Slide graphics, infographics
7. **Branding**: Mascots, brand characters

## Best Practices

### Design Principles

1. **Consistency**: Use same style across all illustrations
2. **Simplicity**: Remove unnecessary details
3. **Clarity**: Ensure message is clear
4. **Scalability**: Test at different sizes
5. **Accessibility**: Ensure sufficient contrast

### File Optimization

- **SVG**: Use for icons, simple illustrations (< 50KB)
- **PNG**: Use for complex illustrations with transparency
- **JPG**: Use for photos and realistic renders
- **WebP**: Modern format, best compression

### Performance

- Lazy load illustrations below the fold
- Use appropriate sizes (no 4K for thumbnails)
- Compress images (TinyPNG, ImageOptim)
- Consider progressive loading
- Cache generated illustrations

## Integration Examples

### React Component

```tsx
import { generateIllustration } from '@/lib/illustrations';

function Hero() {
  const [illustration, setIllustration] = useState(null);

  useEffect(() => {
    generateIllustration({
      description: "Person using our app",
      style: "flat",
      aspectRatio: "16:9"
    }).then(result => setIllustration(result.data));
  }, []);

  return (
    <div>
      {illustration && (
        <img src={illustration.imageUrl} alt={illustration.description} />
      )}
    </div>
  );
}
```

### Preload Critical Illustrations

```html
<link rel="preload" as="image" href="/illustrations/hero.webp" />
```

## Limitations

- AI generation requires additional API services
- Complex scenes may need manual refinement
- Character consistency across variations
- Style transfer accuracy varies
- Generation time: 10-60 seconds

## Development

```bash
npm install
npm run build
npm test
npm run dev
```

## License

MIT
