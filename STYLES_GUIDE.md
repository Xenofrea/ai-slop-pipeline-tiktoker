# Руководство по стилям

## Файл styles.json

Файл `styles.json` содержит предустановленные стили для генерации изображений.

## Формат

```json
[
  {
    "name": "Название стиля",
    "prompt": "инструкции для генерации"
  }
]
```

## Предустановленные стили

### 1. Реалистичный кинематографический
```
photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k
```

### 2. Аниме стиль
```
anime style, vibrant colors, Studio Ghibli aesthetic, cel shaded, detailed illustration
```

### 3. Киберпанк
```
cyberpunk aesthetic, neon lights, futuristic cityscape, dark atmosphere, high contrast
```

### 4. Масляная живопись
```
oil painting, impressionist style, soft brushstrokes, artistic, painterly effect
```

### 5. Минимализм
```
minimalist, clean lines, pastel colors, simple composition, modern aesthetic
```

## Как работает

1. При запуске приложения загружаются стили из `styles.json`
2. Вы можете выбрать стиль стрелками ↑↓
3. Стилевые инструкции добавляются к каждому промпту для изображений

## Создание кастомных стилей

1. Выберите "Создать свой стиль" в меню
2. Введите стилевые инструкции
3. (Опционально) Введите название для сохранения

**Кастомные стили автоматически добавляются в начало списка в `styles.json`**

## Редактирование вручную

Вы можете редактировать `styles.json` напрямую:

```json
[
  {
    "name": "Мой крутой стиль",
    "prompt": "fantasy art, magical atmosphere, ethereal lighting"
  },
  {
    "name": "Реалистичный кинематографический",
    "prompt": "photorealistic, cinematic lighting, dramatic composition, film grain, high quality, 4k"
  }
]
```

## Советы по созданию стилей

### Хорошие примеры:
- `vintage photography, sepia tones, grainy texture, 1970s aesthetic`
- `watercolor painting, soft edges, pastel colors, artistic`
- `sci-fi, futuristic, neon colors, high tech, digital art`
- `dark fantasy, dramatic shadows, gothic atmosphere, mysterious`

### Что включать в промпт:
- Художественный стиль (anime, photorealistic, painting, etc.)
- Освещение (dramatic lighting, soft light, neon, etc.)
- Цветовая палитра (vibrant, pastel, monochrome, etc.)
- Атмосфера (moody, cheerful, mysterious, etc.)
- Технические детали (4k, high quality, detailed, etc.)

### Что НЕ включать:
- Описание конкретных объектов (они уже в промпте из текста)
- Слишком специфичные инструкции, которые могут конфликтовать с основным промптом

## Ограничения

- Максимум 20 стилей в файле
- Старые стили автоматически удаляются при превышении лимита
- Новые кастомные стили всегда добавляются в начало
