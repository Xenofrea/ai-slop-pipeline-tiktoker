/**
 * Расчет параметров видео на основе желаемой длительности
 */
export interface VideoDurationConfig {
  totalDuration: number;      // Общая длительность в секундах
  segmentDuration: number;    // Длительность одного сегмента (6 или 8 секунд)
  segmentCount: number;       // Количество сегментов
  wordsPerMinute: number;     // Слов в минуту для озвучки
  estimatedWords: number;     // Примерное количество слов в тексте
}

export class DurationCalculator {
  /**
   * Рассчитывает конфигурацию видео
   * @param totalDuration - Желаемая общая длительность в секундах
   */
  static calculate(totalDuration: number): VideoDurationConfig {
    // Средняя скорость озвучки: 150 слов в минуту
    const wordsPerMinute = 150;
    const estimatedWords = Math.floor((totalDuration / 60) * wordsPerMinute);

    // Определяем длительность сегмента (6 или 8 секунд)
    // Для коротких видео используем 6 секунд, для длинных - 8
    const segmentDuration = totalDuration <= 60 ? 6 : 8;

    // Рассчитываем количество сегментов
    const segmentCount = Math.ceil(totalDuration / segmentDuration);

    return {
      totalDuration,
      segmentDuration,
      segmentCount,
      wordsPerMinute,
      estimatedWords,
    };
  }

  /**
   * Получает строку длительности для API (6s или 8s)
   */
  static getDurationString(config: VideoDurationConfig): '6s' | '8s' {
    return config.segmentDuration === 6 ? '6s' : '8s';
  }

  /**
   * Форматирует конфигурацию для отображения
   */
  static formatConfig(config: VideoDurationConfig): string {
    return `
Конфигурация видео:
  • Общая длительность: ${config.totalDuration} сек (${(config.totalDuration / 60).toFixed(1)} мин)
  • Количество сегментов: ${config.segmentCount}
  • Длительность сегмента: ${config.segmentDuration} сек
  • Примерное количество слов: ${config.estimatedWords}
    `.trim();
  }
}
