# Internationalization (i18n) Guide

This project supports multiple languages through i18n (internationalization).

## Supported Languages

- **English (en)** - Default language
- **Русский (ru)** - Russian

## Configuration

### Setting Language

Set the `LANGUAGE` environment variable in your `.env` file:

```env
# For English (default)
LANGUAGE="en"

# For Russian
LANGUAGE="ru"
```

If not set, the application defaults to English.

### Important Notes

- **Code and Database**: All code, variable names, database fields, and internal logic are in English
- **UI Only**: The `LANGUAGE` setting only affects the user interface (UI) text
- **Console Logs**: Console logs remain in English for consistency

## Project Structure

### Translation Files

Translation files are located in `src/i18n/locales/`:

- `en.json` - English translations
- `ru.json` - Russian translations

### Adding New Translations

1. Add the key-value pair to both `en.json` and `ru.json`:

**en.json:**
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

**ru.json:**
```json
{
  "myFeature": {
    "title": "Моя функция",
    "description": "Это моя функция"
  }
}
```

2. Use in your component:

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Text>{t('myFeature.title')}</Text>
      <Text>{t('myFeature.description')}</Text>
    </Box>
  );
};
```

### Translating Styles

Built-in styles use translation keys. The style names are automatically translated based on the current language:

**styles.json:**
```json
{
  "key": "realistic_cinematic",
  "prompt": "photorealistic, cinematic lighting..."
}
```

**Translation files:**
```json
// en.json
{
  "styles": {
    "realistic_cinematic": "Realistic Cinematic"
  }
}

// ru.json
{
  "styles": {
    "realistic_cinematic": "Реалистичный кинематографический"
  }
}
```

Custom user-created styles will use the name provided by the user directly (not translated).

## Examples

### Switching Languages

**Use English:**
```bash
# In .env file
LANGUAGE="en"

# Run the app
npm run dev
```

**Use Russian:**
```bash
# In .env file
LANGUAGE="ru"

# Run the app
npm run dev
```

### Interpolation

You can use variables in translations:

```json
{
  "workflow": {
    "completed": "Completed {{current}}/{{total}} videos"
  }
}
```

```tsx
const { t } = useTranslation();
console.log(t('workflow.completed', { current: 5, total: 10 }));
// Output: "Completed 5/10 videos"
```

## Best Practices

1. **English-first approach**: All code, comments, and internal logic should be in English
2. **UI translations**: Only user-facing text should be translated
3. **Consistent keys**: Use descriptive, hierarchical keys (e.g., `component.section.element`)
4. **Complete translations**: Ensure all keys exist in both language files
5. **No hardcoded text**: Always use translation keys instead of hardcoded strings in components

## Adding New Languages

To add a new language:

1. Create a new translation file in `src/i18n/locales/` (e.g., `es.json` for Spanish)
2. Copy the structure from `en.json` and translate all values
3. Add the new language to `src/i18n/config.ts`:

```typescript
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    es: { translation: es }, // Add new language
  },
  // ...
});
```

4. Update documentation to list the new language
