import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <Text color="yellow">⏳ {t('variants.loading')}</Text>
        <Text dimColor>{t('variants.loading_desc')}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">❌ {t('variants.error')} {error}</Text>
      </Box>
    );
  }

  const items = [
    ...variants.map((variant, index) => ({
      label: `${t('variants.variant')} ${index + 1}`,
      value: variant,
      description: variant.text.substring(0, 100) + '...',
    })),
    {
      label: `✏️ ${t('variants.custom')}`,
      value: 'custom' as any,
      description: t('variants.custom_desc'),
    },
    {
      label: `🔄 ${t('variants.regenerate')}`,
      value: null as any,
      description: t('variants.regenerate_desc'),
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

  // Custom text input mode
  if (customMode) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan" bold>✏️ {t('variants.custom_mode_title')}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>{t('variants.custom_mode_desc')}</Text>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customText}
            onChange={setCustomText}
            onSubmit={handleCustomTextSubmit}
            placeholder={t('variants.custom_mode_placeholder')}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">📚 {t('variants.title')}</Text>
      </Box>

      {variants.map((variant, index) => (
        <Box key={index} flexDirection="column" marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
          <Text bold color="yellow">
            {t('variants.variant')} {index + 1}:
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
