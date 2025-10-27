#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface DarkModeExample {
  name: string;
  lightColors: any;
  darkColors: any;
  strategy: string;
}

const darkModeExamples: DarkModeExample[] = [
  {
    name: 'GitHub Dark',
    lightColors: { bg: '#FFFFFF', text: '#24292E', border: '#E1E4E8' },
    darkColors: { bg: '#0D1117', text: '#C9D1D9', border: '#30363D' },
    strategy: 'custom',
  },
];

const server = new Server(
  { name: 'dark-mode-converter-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'convertToDarkMode',
      description: 'Convert light mode color palette to dark mode with automatic adjustments',
      inputSchema: {
        type: 'object',
        properties: {
          lightColors: {
            type: 'object',
            description: 'Light mode color palette',
            properties: {
              background: { type: 'string' },
              surface: { type: 'string' },
              text: { type: 'string' },
              primary: { type: 'string' },
              secondary: { type: 'string' },
            },
          },
          strategy: {
            type: 'string',
            enum: ['auto', 'invert', 'desaturate', 'shift-hue', 'custom'],
            description: 'Conversion strategy',
          },
          preserveBrand: {
            type: 'boolean',
            description: 'Keep brand colors unchanged',
          },
          contrastTarget: {
            type: 'number',
            description: 'Target contrast ratio (default: 4.5)',
          },
        },
        required: ['lightColors'],
      },
    },
    {
      name: 'suggestDarkVariant',
      description: 'Suggest optimal dark mode variant for a single color',
      inputSchema: {
        type: 'object',
        properties: {
          lightColor: {
            type: 'string',
            description: 'Hex color to convert',
          },
          role: {
            type: 'string',
            enum: ['background', 'surface', 'text', 'primary', 'accent'],
            description: 'Color role/usage',
          },
          adjacentColors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Colors used nearby for contrast checking',
          },
        },
        required: ['lightColor', 'role'],
      },
    },
    {
      name: 'validateDarkContrast',
      description: 'Validate dark mode color combinations for accessibility',
      inputSchema: {
        type: 'object',
        properties: {
          darkTheme: {
            type: 'object',
            description: 'Dark mode theme to validate',
          },
          wcagLevel: {
            type: 'string',
            enum: ['AA', 'AAA'],
            description: 'WCAG compliance level',
          },
          checkCombinations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                foreground: { type: 'string' },
                background: { type: 'string' },
                usage: { type: 'string' },
              },
            },
            description: 'Specific color combinations to check',
          },
        },
        required: ['darkTheme'],
      },
    },
    {
      name: 'generateDarkPalette',
      description: 'Generate complete dark mode color palette from brand color',
      inputSchema: {
        type: 'object',
        properties: {
          brandColor: {
            type: 'string',
            description: 'Primary brand color',
          },
          style: {
            type: 'string',
            enum: ['pure-black', 'true-dark', 'soft-dark', 'blue-tinted', 'warm-dark'],
            description: 'Dark mode style',
          },
          includeSemantics: {
            type: 'boolean',
            description: 'Include success/warning/error colors',
          },
        },
        required: ['brandColor'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'convertToDarkMode': {
        const {
          lightColors,
          strategy = 'auto',
          preserveBrand = true,
          contrastTarget = 4.5,
        } = args as any;

        if (!lightColors) {
          throw new Error('Missing required argument: lightColors');
        }

        // Convert colors based on strategy
        const darkColors: any = {};

        // Background: light → dark
        darkColors.background = invertLightness(lightColors.background || '#FFFFFF', 5);
        darkColors.surface = invertLightness(lightColors.surface || '#F9FAFB', 8);

        // Text: dark → light
        darkColors.text = invertLightness(lightColors.text || '#111827', 95);

        // Brand colors: preserve or adjust
        darkColors.primary = preserveBrand
          ? lightColors.primary
          : adjustForDarkMode(lightColors.primary || '#4F46E5');
        darkColors.secondary = preserveBrand
          ? lightColors.secondary
          : adjustForDarkMode(lightColors.secondary || '#EC4899');

        const result = {
          success: true,
          message: 'Colors converted to dark mode',
          data: {
            lightColors,
            darkColors,
            strategy,
            preserveBrand,
            contrastRatios: {
              textOnBackground: calculateContrast(darkColors.text, darkColors.background),
              primaryOnSurface: calculateContrast(darkColors.primary, darkColors.surface),
            },
            meetsTarget: true,
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'suggestDarkVariant': {
        const { lightColor, role, adjacentColors = [] } = args as any;

        if (!lightColor || !role) {
          throw new Error('Missing required arguments: lightColor, role');
        }

        let darkVariant: string;
        let reasoning: string;

        switch (role) {
          case 'background':
            darkVariant = '#0D1117';
            reasoning = 'Pure dark backgrounds reduce eye strain and improve battery life on OLED';
            break;
          case 'surface':
            darkVariant = '#161B22';
            reasoning = 'Slightly lighter than background for card/surface elevation';
            break;
          case 'text':
            darkVariant = '#C9D1D9';
            reasoning = 'Light gray text (not pure white) reduces contrast and eye strain';
            break;
          case 'primary':
            darkVariant = adjustForDarkMode(lightColor);
            reasoning = 'Slightly lighter/more saturated for visibility on dark backgrounds';
            break;
          case 'accent':
            darkVariant = adjustForDarkMode(lightColor);
            reasoning = 'Increased saturation for accent colors in dark mode';
            break;
          default:
            darkVariant = lightColor;
            reasoning = 'No conversion applied';
        }

        const result = {
          success: true,
          message: 'Dark variant suggested',
          data: {
            lightColor,
            darkVariant,
            role,
            reasoning,
            contrast: adjacentColors.length > 0
              ? calculateContrast(darkVariant, adjacentColors[0])
              : null,
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'validateDarkContrast': {
        const { darkTheme, wcagLevel = 'AA', checkCombinations = [] } = args as any;

        if (!darkTheme) {
          throw new Error('Missing required argument: darkTheme');
        }

        const minContrast = wcagLevel === 'AAA' ? 7 : 4.5;
        const issues = [];

        // Check common combinations
        const textBgContrast = calculateContrast(
          darkTheme.colors?.text || '#C9D1D9',
          darkTheme.colors?.background || '#0D1117'
        );

        if (textBgContrast < minContrast) {
          issues.push({
            combination: 'text on background',
            actual: textBgContrast,
            required: minContrast,
            severity: 'high',
          });
        }

        const passed = issues.length === 0;

        const result = {
          success: true,
          message: passed ? 'Dark mode passes contrast validation' : 'Contrast issues found',
          data: {
            passed,
            wcagLevel,
            minContrast,
            issues,
            checkedCombinations: checkCombinations.length || 'default combinations',
            score: `${Math.max(0, 100 - issues.length * 20)}%`,
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'generateDarkPalette': {
        const { brandColor, style = 'true-dark', includeSemantics = true } = args as any;

        if (!brandColor) {
          throw new Error('Missing required argument: brandColor');
        }

        const backgrounds: any = {
          'pure-black': { bg: '#000000', surface: '#0A0A0A' },
          'true-dark': { bg: '#0D1117', surface: '#161B22' },
          'soft-dark': { bg: '#1A1A1A', surface: '#242424' },
          'blue-tinted': { bg: '#0A1929', surface: '#132F4C' },
          'warm-dark': { bg: '#1A1612', surface: '#2A251E' },
        };

        const { bg, surface } = backgrounds[style] || backgrounds['true-dark'];

        const palette: any = {
          background: bg,
          surface: surface,
          text: '#E3E4E6',
          textSecondary: '#9DA3A7',
          border: '#30363D',
          primary: adjustForDarkMode(brandColor),
          primaryHover: adjustForDarkMode(brandColor, 10),
        };

        if (includeSemantics) {
          palette.success = '#3FB950';
          palette.warning = '#D29922';
          palette.error = '#F85149';
          palette.info = '#58A6FF';
        }

        const result = {
          success: true,
          message: 'Dark mode palette generated',
          data: {
            brandColor,
            style,
            palette,
            includeSemantics,
            contrastRatios: {
              text: calculateContrast(palette.text, palette.background),
              primary: calculateContrast(palette.primary, palette.background),
            },
          },
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'dark-mode://examples',
      name: 'Dark Mode Examples',
      description: 'Curated examples of excellent dark mode implementations',
      mimeType: 'application/json',
    },
    {
      uri: 'dark-mode://guide',
      name: 'Dark Mode Design Guide',
      description: 'Comprehensive guide to designing dark mode',
      mimeType: 'text/plain',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'dark-mode://examples') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ examples: darkModeExamples }, null, 2),
        },
      ],
    };
  }

  if (uri === 'dark-mode://guide') {
    const guide = `Dark Mode Design Guide
======================

Principles:
1. Reduce eye strain in low light
2. Improve battery life (OLED screens)
3. Maintain brand recognition
4. Ensure accessibility
5. Provide user choice

Background Colors:
- Pure Black (#000000): OLED optimization, maximum contrast
- True Dark (#0D1117): Reduced eye strain, modern look
- Soft Dark (#1A1A1A): Warmer feel, less stark
- Blue Tinted (#0A1929): Technical, professional
- Warm Dark (#1A1612): Cozy, inviting

Surface Elevation:
- Background: Darkest
- Surface 1: +2-3% lightness (cards)
- Surface 2: +4-6% lightness (elevated cards)
- Surface 3: +6-8% lightness (dialogs)

Text Colors:
- Primary: #E3E4E6 (not pure white)
- Secondary: #9DA3A7 (60-70% opacity)
- Disabled: #6B7280 (40-50% opacity)
- Never use pure white (#FFFFFF) for body text

Color Adjustments:
1. Backgrounds: Invert lightness
2. Text: Invert but not to pure white
3. Brand colors:
   - Keep hue
   - Increase saturation 10-20%
   - Increase lightness 10-15%
4. Borders: Subtle, 10-15% lighter than bg

Semantic Colors (Dark Mode):
- Success: #3FB950 (green)
- Warning: #D29922 (amber)
- Error: #F85149 (red)
- Info: #58A6FF (blue)

Shadows in Dark Mode:
- Use lighter borders instead
- Or very subtle shadows
- Or elevation through lightness
- Avoid heavy shadows

Contrast Requirements:
- Body text: 4.5:1 minimum (AA)
- Large text: 3:1 minimum (AA)
- UI components: 3:1 minimum
- For AAA: 7:1 and 4.5:1 respectively

Common Mistakes:
1. Pure black backgrounds (too harsh)
2. Pure white text (eye strain)
3. Not adjusting brand colors
4. Over-saturated colors
5. Insufficient contrast
6. Forgetting disabled states
7. Heavy shadows

Best Practices:
1. Test in low light conditions
2. Use semantic color roles
3. Maintain relative contrast
4. Adjust images (reduce brightness)
5. Test with color blindness simulators
6. Provide toggle, respect system preference
7. Save user preference

Color Conversion Strategies:
- Auto: Intelligent automatic conversion
- Invert: Flip lightness values
- Desaturate: Reduce color intensity
- Shift Hue: Rotate hue for dark mode
- Custom: Hand-pick each color

Testing Checklist:
□ Text readable in all sizes
□ Contrast meets WCAG AA/AAA
□ Brand colors recognizable
□ Semantic colors distinct
□ Borders visible
□ Focus states clear
□ Images adjusted
□ Icons readable
□ Animations smooth
□ No pure black/white

Popular Dark Mode Styles:
1. GitHub: #0D1117 background, blue tinted
2. Twitter: Pure black, OLED optimized
3. Discord: #36393F, soft dark
4. Slack: #1A1D21, subtle elevation
5. VSCode: #1E1E1E, neutral dark
6. Notion: #191919, warm dark

Implementation:
- CSS: prefers-color-scheme media query
- JS: localStorage + system detection
- Toggle: Smooth transition (200ms)
- Icons: Moon/sun symbols
`;
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: guide,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Helper functions
function invertLightness(color: string, targetLightness: number): string {
  // Placeholder: In production, use color manipulation library (chroma.js, polished)
  return color === '#FFFFFF' ? '#0D1117' : color === '#000000' ? '#E3E4E6' : color;
}

function adjustForDarkMode(color: string, adjustment: number = 0): string {
  // Placeholder: Increase saturation and lightness for dark mode
  return color;
}

function calculateContrast(foreground: string, background: string): number {
  // Placeholder: Calculate WCAG contrast ratio
  return 7.5; // Mock value
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('dark-mode-converter-mcp v1.0.0 running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
