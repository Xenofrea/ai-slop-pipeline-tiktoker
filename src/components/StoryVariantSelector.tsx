import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { TextGeneratorClient, TextGenerationResult } from '../api/text-generator-client';

interface StoryVariantSelectorProps {
  description: string;
  duration: number;
  useFreeModels?: boolean;
  onVariantsGenerated: (variants: TextGenerationResult[]) => void;
  onSelect: (variant: TextGenerationResult) => void;
}

export const StoryVariantSelector: React.FC<StoryVariantSelectorProps> = ({
  description,
  duration,
  useFreeModels = false,
  onVariantsGenerated,
  onSelect,
}) => {
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<TextGenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const generateVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const client = new TextGeneratorClient(useFreeModels);
      const generated = await client.generateStoryVariants(description, duration);
      setVariants(generated);
      onVariantsGenerated(generated);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    generateVariants();
  }, [description, duration, generationCount]);

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">⏳ Генерация вариантов текста...</Text>
        <Text dimColor>Это может занять несколько секунд...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">❌ Ошибка: {error}</Text>
      </Box>
    );
  }

  const items = [
    ...variants.map((variant, index) => ({
      label: `Вариант ${index + 1}`,
      value: variant,
      description: variant.text.substring(0, 100) + '...',
    })),
    {
      label: '✏️ Ввести свой текст',
      value: 'custom' as any,
      description: 'Написать собственную историю',
    },
    {
      label: '🔄 Перегенерировать варианты',
      value: null as any,
      description: 'Создать новые 3 варианта текста',
    },
  ];

  const handleSelect = (item: { value: TextGenerationResult | null | 'custom' }) => {
    if (item.value === null) {
      // Перегенерация
      setGenerationCount(prev => prev + 1);
    } else if (item.value === 'custom') {
      // Режим ввода своего текста
      setCustomMode(true);
    } else {
      onSelect(item.value);
    }
  };

  const handleCustomTextSubmit = (text: string) => {
    const customVariant: TextGenerationResult = {
      text: text,
      variant: 0, // Custom variant
    };
    onSelect(customVariant);
  };

  // Режим ввода своего текста
  if (customMode) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan" bold>✏️ Введите свой текст для видео:</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Напишите историю, которую хотите превратить в видео</Text>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customText}
            onChange={setCustomText}
            onSubmit={handleCustomTextSubmit}
            placeholder="Введите текст..."
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">📚 Выберите вариант текста (используйте стрелки ↑↓):</Text>
      </Box>

      {variants.map((variant, index) => (
        <Box key={index} flexDirection="column" marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
          <Text bold color="yellow">
            Вариант {index + 1}:
          </Text>
          <Text>{variant.text}</Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={handleSelect}
        />
      </Box>
    </Box>
  );
};
