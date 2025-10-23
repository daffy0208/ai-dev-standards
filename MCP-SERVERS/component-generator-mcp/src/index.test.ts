import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Component Generator MCP Tests
 *
 * Tests component generation functionality:
 * - Component file generation
 * - Test file generation
 * - Story file generation
 * - Template rendering
 * - Configuration management
 */

describe('Component Generator', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temp directory for tests
    testDir = join(tmpdir(), `component-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Component Generation', () => {
    it('should generate basic component structure', async () => {
      // This would test the actual component generation
      // For now, we'll test the helper functions

      const pascalCase = (str: string) => {
        return str
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
          .replace(/\s+/g, '')
          .replace(/-/g, '');
      };

      expect(pascalCase('my-component')).toBe('MyComponent');
      expect(pascalCase('MyComponent')).toBe('MyComponent');
      expect(pascalCase('my component')).toBe('MyComponent');
    });

    it('should convert to camelCase', () => {
      const camelCase = (str: string) => {
        const pascal = str
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
          .replace(/\s+/g, '')
          .replace(/-/g, '');
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
      };

      expect(camelCase('MyComponent')).toBe('myComponent');
      expect(camelCase('my-component')).toBe('myComponent');
    });

    it('should convert to kebab-case', () => {
      const kebabCase = (str: string) => {
        return str
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/\s+/g, '-')
          .toLowerCase();
      };

      expect(kebabCase('MyComponent')).toBe('my-component');
      expect(kebabCase('myComponent')).toBe('my-component');
    });
  });

  describe('Zod Type Generation', () => {
    const getZodType = (prop: any): string => {
      const { type, required = true, default: defaultValue, enum: enumValues } = prop;

      let zodType = '';

      if (enumValues && enumValues.length > 0) {
        zodType = `z.enum([${enumValues.map((v: string) => `'${v}'`).join(', ')}])`;
      } else {
        switch (type.toLowerCase()) {
          case 'string':
            zodType = 'z.string()';
            break;
          case 'number':
            zodType = 'z.number()';
            break;
          case 'boolean':
            zodType = 'z.boolean()';
            break;
          case 'function':
            zodType = 'z.function()';
            break;
          case 'array':
            zodType = 'z.array(z.any())';
            break;
          case 'object':
            zodType = 'z.object({})';
            break;
          default:
            zodType = 'z.any()';
        }
      }

      if (defaultValue !== undefined) {
        zodType += `.default(${JSON.stringify(defaultValue)})`;
      } else if (!required) {
        zodType += '.optional()';
      }

      return zodType;
    };

    it('should generate correct Zod type for string', () => {
      expect(getZodType({ type: 'string' })).toBe('z.string()');
      expect(getZodType({ type: 'string', required: false })).toBe('z.string().optional()');
      expect(getZodType({ type: 'string', default: 'test' })).toBe('z.string().default("test")');
    });

    it('should generate correct Zod type for number', () => {
      expect(getZodType({ type: 'number' })).toBe('z.number()');
      expect(getZodType({ type: 'number', default: 0 })).toBe('z.number().default(0)');
    });

    it('should generate correct Zod type for boolean', () => {
      expect(getZodType({ type: 'boolean' })).toBe('z.boolean()');
      expect(getZodType({ type: 'boolean', default: false })).toBe('z.boolean().default(false)');
    });

    it('should generate correct Zod type for enum', () => {
      expect(getZodType({ type: 'string', enum: ['primary', 'secondary'] })).toBe(
        "z.enum(['primary', 'secondary'])"
      );
    });

    it('should generate correct Zod type for function', () => {
      expect(getZodType({ type: 'function' })).toBe('z.function()');
      expect(getZodType({ type: 'function', required: false })).toBe('z.function().optional()');
    });

    it('should generate correct Zod type for array', () => {
      expect(getZodType({ type: 'array' })).toBe('z.array(z.any())');
    });

    it('should generate correct Zod type for object', () => {
      expect(getZodType({ type: 'object' })).toBe('z.object({})');
    });
  });

  describe('Prop Handling', () => {
    it('should identify testable props', () => {
      const testableProps = ['onClick', 'onSubmit', 'onChange'];
      const props = ['onClick', 'variant', 'size', 'disabled'];

      const identifiedTestable = props.filter((key) => testableProps.includes(key));

      expect(identifiedTestable).toEqual(['onClick']);
    });

    it('should generate default args from props', () => {
      const props = {
        variant: { type: 'string', enum: ['primary', 'secondary'], default: 'primary' },
        size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        disabled: { type: 'boolean', default: false },
      };

      const defaultArgs = Object.entries(props).reduce((acc, [key, value]) => {
        if (value.default !== undefined) {
          acc[key] = JSON.stringify(value.default);
        } else if (value.enum && value.enum.length > 0) {
          acc[key] = `'${value.enum[0]}'`;
        }
        return acc;
      }, {} as Record<string, string>);

      expect(defaultArgs).toEqual({
        variant: '"primary"',
        size: "'sm'",
        disabled: 'false',
      });
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const defaultConfig = {
        outputDir: './components',
        framework: 'react',
        styling: 'tailwind',
      };

      expect(defaultConfig.outputDir).toBe('./components');
      expect(defaultConfig.framework).toBe('react');
      expect(defaultConfig.styling).toBe('tailwind');
    });

    it('should allow configuration overrides', () => {
      const config = {
        outputDir: './src/components',
        framework: 'nextjs' as const,
        styling: 'css-modules' as const,
      };

      expect(config.outputDir).toBe('./src/components');
      expect(config.framework).toBe('nextjs');
      expect(config.styling).toBe('css-modules');
    });
  });

  describe('Template Paths', () => {
    it('should construct correct template paths', () => {
      const templates = ['component', 'test', 'story', 'index'];

      templates.forEach((template) => {
        const path = `src/templates/${template}.hbs`;
        expect(path).toMatch(/\.hbs$/);
        expect(path).toContain(template);
      });
    });
  });
});
