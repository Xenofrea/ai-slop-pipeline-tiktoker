import fs from 'fs';
import path from 'path';
import i18n from '../i18n/config';

export interface StylePreset {
  key?: string;  // For built-in styles (optional for custom styles)
  name?: string; // For custom user styles (deprecated for built-in)
  prompt: string;
}

export class StyleManager {
  private static stylesFilePath = path.join(process.cwd(), 'styles.json');

  /**
   * Load styles from file
   */
  static loadStyles(): StylePreset[] {
    try {
      if (!fs.existsSync(this.stylesFilePath)) {
        // Create file with default styles if it doesn't exist
        this.createDefaultStylesFile();
      }

      const data = fs.readFileSync(this.stylesFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading styles:', error);
      return this.getDefaultStyles();
    }
  }

  /**
   * Get localized name for style
   */
  static getStyleName(style: StylePreset): string {
    if (style.key) {
      // Built-in style - use i18n
      return i18n.t(`styles.${style.key}`);
    }
    // Custom style - use name directly
    return style.name || 'Custom Style';
  }

  /**
   * Save styles to file
   */
  static saveStyles(styles: StylePreset[]): void {
    try {
      fs.writeFileSync(
        this.stylesFilePath,
        JSON.stringify(styles, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving styles:', error);
    }
  }

  /**
   * Add new custom style at the beginning of the list
   */
  static addCustomStyle(name: string, prompt: string): void {
    const styles = this.loadStyles();

    // Check if style with this name already exists
    const existingIndex = styles.findIndex(s => s.name === name);
    if (existingIndex !== -1) {
      // If exists, remove the old one
      styles.splice(existingIndex, 1);
    }

    // Add to the beginning
    styles.unshift({ name, prompt });

    // Limit number of styles (maximum 20)
    if (styles.length > 20) {
      styles.splice(20);
    }

    this.saveStyles(styles);
    console.log(`✅ Style "${name}" saved`);
  }

  /**
   * Default styles
   */
  private static getDefaultStyles(): StylePreset[] {
    return [
      {
        key: 'realistic_cinematic',
        prompt: 'photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k',
      },
      {
        key: 'anime',
        prompt: 'anime style, vibrant colors, Studio Ghibli aesthetic, cel shaded, detailed illustration',
      },
      {
        key: 'cyberpunk',
        prompt: 'cyberpunk aesthetic, neon lights, futuristic cityscape, dark atmosphere, high contrast',
      },
      {
        key: 'oil_painting',
        prompt: 'oil painting, impressionist style, soft brushstrokes, artistic, painterly effect',
      },
      {
        key: 'minimalism',
        prompt: 'minimalist, clean lines, pastel colors, simple composition, modern aesthetic',
      },
    ];
  }

  /**
   * Create file with default styles
   */
  private static createDefaultStylesFile(): void {
    const defaultStyles = this.getDefaultStyles();
    this.saveStyles(defaultStyles);
    console.log('📁 Created styles.json file with default styles');
  }
}
