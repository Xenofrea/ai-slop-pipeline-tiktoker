import OpenAI from 'openai';

export interface TextGenerationResult {
  text: string;
  variant: number;
}

export class TextGeneratorClient {
  private client: OpenAI;
  private model: string;

  constructor(useFreeModel: boolean = false) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    this.model = useFreeModel
      ? (process.env.OPENROUTER_MODEL_FREE || 'x-ai/grok-4.1-fast:free')
      : (process.env.OPENROUTER_MODEL || 'openai/chagpt');

    console.log(`📝 Используется модель текста: ${this.model}${useFreeModel ? ' (FREE)' : ''}`);
  }

  async generateStoryVariants(description: string, duration: number = 60): Promise<TextGenerationResult[]> {
    const startTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('📝  ГЕНЕРАЦИЯ ВАРИАНТОВ ТЕКСТА');
    console.log('='.repeat(60));
    console.log('📥 Описание:', description);
    console.log('⏱️  Длительность:', duration, 'секунд');

    // Расчет количества слов (150 слов в минуту)
    const wordsCount = Math.floor((duration / 60) * 150);

    const systemPrompt = `Ты - креативный сценарист для коротких видео.
Твоя задача - создать увлекательный текст для ${duration}-секундного видео на основе описания пользователя.

ТРЕБОВАНИЯ:
- Текст должен быть рассчитан примерно на ${duration} секунд озвучки (около ${wordsCount} слов)
- Текст должен быть динамичным, интересным и подходить для короткого видео
- Используй яркие визуальные образы, которые легко передать в видео
- Текст должен быть связным и иметь четкую структуру
- Используй драматургию: завязка, развитие, кульминация, развязка

ФОРМАТ ОТВЕТА:
Верни только чистый текст истории, без дополнительных пояснений или разметки.`;

    console.log('\n🚀 ПАРАЛЛЕЛЬНАЯ генерация 3 вариантов...');

    // Генерируем все варианты параллельно
    const variantPromises = [0, 1, 2].map(async (i) => {
      const variantStart = Date.now();
      console.log(`🔄 Запуск генерации варианта ${i + 1}/3...`);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: description }],
        temperature: 0.9 + i * 0.1, // Разная температура для большего разнообразия
        max_tokens: 800,
      });

      const text = response.choices[0]?.message?.content?.trim() || '';
      const variantTime = ((Date.now() - variantStart) / 1000).toFixed(1);

      console.log(`✅ Вариант ${i + 1} сгенерирован (${text.length} символов) - ${variantTime}s`);

      return {
        text,
        variant: i + 1,
      };
    });

    const variants = await Promise.all(variantPromises);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n📤 Сгенерировано вариантов:', variants.length);
    console.log(`⏱️  Общее время: ${totalTime}s`);
    console.log('='.repeat(60) + '\n');

    return variants;
  }

  async generateVideoPrompts(storyText: string, duration: number = 60): Promise<string[]> {
    const startTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('🎬  ГЕНЕРАЦИЯ ПРОМПТОВ ДЛЯ ВИДЕО');
    console.log('='.repeat(60));
    console.log('📥 Длина текста:', storyText.length, 'символов');
    console.log('⏱️  Длительность видео:', duration, 'секунд');

    // Используем короткие 4-секундные сегменты для более динамичного видео
    const segmentDuration = 4;
    const segmentCount = Math.ceil(duration / segmentDuration);

    console.log('📊 Количество сегментов:', segmentCount);
    console.log('⏱️  Длительность сегмента:', segmentDuration, 'секунд');

    const systemPrompt = `Ты - эксперт по созданию промптов для AI генерации видео.
Твоя задача - разбить текст истории на сегменты и создать визуальные промпты для каждого сегмента.

ТРЕБОВАНИЯ:
- Раздели текст на ${segmentCount} сегментов (по ${segmentDuration} секунд каждый для ${duration}-секундного видео)
- Для каждого сегмента создай детальный визуальный промпт для генерации видео
- Промпты должны быть на английском языке
- Каждый промпт должен описывать конкретную визуальную сцену
- Используй кинематографические термины: camera angle, lighting, movement, composition
- Промпты должны быть согласованы между собой (единый стиль, персонажи, локации)

ФОРМАТ ОТВЕТА:
Верни только JSON массив из РОВНО ${segmentCount} промптов:
["prompt 1", "prompt 2", "prompt 3", ...]

ПРИМЕР ПРОМПТА:
"Cinematic shot of a truck driver at sunset, warm golden hour lighting, camera slowly pushing in, documentary style, realistic, 4k quality"`;

    console.log('\n🔄 Генерация промптов...');

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Текст истории:\n\n${storyText}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';

    // Извлекаем JSON из ответа (может быть в markdown блоке)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    const prompts: string[] = JSON.parse(jsonString);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Сгенерировано промптов: ${prompts.length} - ${totalTime}s`);
    prompts.forEach((prompt, i) => {
      console.log(`\n  ${i + 1}. ${prompt.substring(0, 80)}...`);
    });
    console.log('='.repeat(60) + '\n');

    return prompts;
  }
}
