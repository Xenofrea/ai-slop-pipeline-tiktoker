import fs from 'fs';
import path from 'path';

export interface StylePreset {
  name: string;
  prompt: string;
}

export class StyleManager {
  private static stylesFilePath = path.join(process.cwd(), 'styles.json');

  /**
   * Загружает стили из файла
   */
  static loadStyles(): StylePreset[] {
    try {
      if (!fs.existsSync(this.stylesFilePath)) {
        // Создаём файл с дефолтными стилями, если его нет
        this.createDefaultStylesFile();
      }

      const data = fs.readFileSync(this.stylesFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Ошибка загрузки стилей:', error);
      return this.getDefaultStyles();
    }
  }

  /**
   * Сохраняет стили в файл
   */
  static saveStyles(styles: StylePreset[]): void {
    try {
      fs.writeFileSync(
        this.stylesFilePath,
        JSON.stringify(styles, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Ошибка сохранения стилей:', error);
    }
  }

  /**
   * Добавляет новый кастомный стиль в начало списка
   */
  static addCustomStyle(name: string, prompt: string): void {
    const styles = this.loadStyles();

    // Проверяем, нет ли уже такого стиля
    const existingIndex = styles.findIndex(s => s.name === name);
    if (existingIndex !== -1) {
      // Если есть, удаляем старый
      styles.splice(existingIndex, 1);
    }

    // Добавляем в начало
    styles.unshift({ name, prompt });

    // Ограничиваем количество стилей (максимум 20)
    if (styles.length > 20) {
      styles.splice(20);
    }

    this.saveStyles(styles);
    console.log(`✅ Стиль "${name}" сохранён`);
  }

  /**
   * Дефолтные стили
   */
  private static getDefaultStyles(): StylePreset[] {
    return [
      {
        name: 'Реалистичный кинематографический',
        prompt: 'photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k',
      },
      {
        name: 'Аниме стиль',
        prompt: 'anime style, vibrant colors, Studio Ghibli aesthetic, cel shaded, detailed illustration',
      },
      {
        name: 'Киберпанк',
        prompt: 'cyberpunk aesthetic, neon lights, futuristic cityscape, dark atmosphere, high contrast',
      },
      {
        name: 'Масляная живопись',
        prompt: 'oil painting, impressionist style, soft brushstrokes, artistic, painterly effect',
      },
      {
        name: 'Минимализм',
        prompt: 'minimalist, clean lines, pastel colors, simple composition, modern aesthetic',
      },
    ];
  }

  /**
   * Создаёт файл с дефолтными стилями
   */
  private static createDefaultStylesFile(): void {
    const defaultStyles = this.getDefaultStyles();
    this.saveStyles(defaultStyles);
    console.log('📁 Создан файл styles.json с дефолтными стилями');
  }
}
