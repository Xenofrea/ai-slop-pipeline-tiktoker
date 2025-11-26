import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { useTranslation } from 'react-i18next';
import { TextGeneratorClient, TextGenerationResult } from '../api/text-generator-client';

interface StoryVariantSelectorProps {
  description: string;
  duration: number;
  useFreeModels?: boolean;
  onVariantsGenerated: (variants: TextGenerationResult[]) => void;
  onSelect: (variant: TextGenerationResult) => void;
}

type Mode = 'list' | 'edit-variant' | 'edit-text' | 'modify-prompt' | 'regenerating' | 'modifying' | 'custom';

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
  const [mode, setMode] = useState<Mode>('list');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [customText, setCustomText] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [editedText, setEditedText] = useState('');

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

  const handleRegenerateVariant = async () => {
    setMode('regenerating');
    try {
      const client = new TextGeneratorClient(useFreeModels);
      const newText = await client.regenerateSingleVariant(description, duration);

      setVariants(prev => {
        const updated = [...prev];
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          text: newText,
        };
        return updated;
      });

      setMode('edit-variant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMode('edit-variant');
    }
  };

  const handleModifyVariant = async () => {
    if (!modifyPrompt.trim()) {
      return;
    }

    setMode('modifying');
    try {
      const client = new TextGeneratorClient(useFreeModels);
      const modifiedText = await client.modifyVariant(
        variants[selectedIndex].text,
        modifyPrompt,
        duration
      );

      setVariants(prev => {
        const updated = [...prev];
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          text: modifiedText,
        };
        return updated;
      });

      setModifyPrompt('');
      setMode('edit-variant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMode('edit-variant');
    }
  };

  const handleSaveEditedText = () => {
    setVariants(prev => {
      const updated = [...prev];
      updated[selectedIndex] = {
        ...updated[selectedIndex],
        text: editedText,
      };
      return updated;
    });
    setMode('edit-variant');
  };

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
      <Box flexDirection="column">
        <Text color="red">❌ {t('variants.error')} {error}</Text>
        <Box marginTop={1}>
          <Text dimColor>Press any key to continue...</Text>
        </Box>
      </Box>
    );
  }

  // Regenerating mode
  if (mode === 'regenerating') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>Regenerating Variant {selectedIndex + 1}</Text>
        <Box marginTop={1}>
          <Text color="yellow">
            <Spinner type="dots" />
          </Text>
          <Text> Generating new variant...</Text>
        </Box>
      </Box>
    );
  }

  // Modifying mode
  if (mode === 'modifying') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>Modifying Variant {selectedIndex + 1}</Text>
        <Box marginTop={1}>
          <Text color="yellow">
            <Spinner type="dots" />
          </Text>
          <Text> Applying modifications...</Text>
        </Box>
      </Box>
    );
  }

  // Custom text input mode
  if (mode === 'custom') {
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
            onSubmit={(text) => {
              const customVariant: TextGenerationResult = {
                text: text,
                variant: 0,
              };
              onSelect(customVariant);
            }}
            placeholder={t('variants.custom_mode_placeholder')}
          />
        </Box>
      </Box>
    );
  }

  // Edit text directly mode
  if (mode === 'edit-text') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>Edit Variant {selectedIndex + 1}</Text>
        <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
          <Text dimColor>Enter new text:</Text>
          <Box marginTop={1}>
            <TextInput
              value={editedText}
              onChange={setEditedText}
              onSubmit={handleSaveEditedText}
            />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to save, Ctrl+C to cancel</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // Modify with prompt mode
  if (mode === 'modify-prompt') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>Modify Variant {selectedIndex + 1}</Text>
        <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
          <Text dimColor>Current text:</Text>
          <Text>{variants[selectedIndex]?.text.substring(0, 200)}...</Text>
          <Box marginTop={1}>
            <Text dimColor>Enter modification instructions:</Text>
          </Box>
          <Box marginTop={1}>
            <Text>Prompt: </Text>
            <TextInput
              value={modifyPrompt}
              onChange={setModifyPrompt}
              onSubmit={handleModifyVariant}
              placeholder="e.g., make it more dramatic"
            />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to apply, Ctrl+C to cancel</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // Edit variant mode - show options for selected variant
  if (mode === 'edit-variant') {
    const actions = [
      { label: `✅ ${t('variants.use_variant')}`, value: 'use' },
      { label: `✏️ ${t('variants.edit_text')}`, value: 'edit-text' },
      { label: `🔧 ${t('variants.modify_prompt')}`, value: 'modify-prompt' },
      { label: `🔄 ${t('variants.regenerate_variant')}`, value: 'regenerate' },
      { label: `⬅️ ${t('variants.back')}`, value: 'back' },
    ];

    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan" bold>{t('variants.variant')} {selectedIndex + 1} - {t('variants.options')}</Text>

        <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
          <Text>{variants[selectedIndex]?.text}</Text>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>{t('variants.select_action')}</Text>
        </Box>

        <SelectInput
          items={actions}
          onSelect={(item) => {
            if (item.value === 'edit-text') {
              setEditedText(variants[selectedIndex].text);
              setMode('edit-text');
            } else if (item.value === 'modify-prompt') {
              setMode('modify-prompt');
            } else if (item.value === 'regenerate') {
              handleRegenerateVariant();
            } else if (item.value === 'use') {
              onSelect(variants[selectedIndex]);
            } else if (item.value === 'back') {
              setMode('list');
            }
          }}
        />
      </Box>
    );
  }

  // List mode - show all variants
  const items = [
    ...variants.map((variant, index) => ({
      label: `${t('variants.variant')} ${index + 1}`,
      value: `variant-${index}`,
      description: variant.text.substring(0, 100) + '...',
    })),
    {
      label: `✏️ ${t('variants.custom')}`,
      value: 'custom',
      description: t('variants.custom_desc'),
    },
    {
      label: `🔄 ${t('variants.regenerate_all')}`,
      value: 'regenerate-all',
      description: t('variants.regenerate_all_desc'),
    },
  ];

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
          onSelect={(item) => {
            if (item.value === 'regenerate-all') {
              setGenerationCount(prev => prev + 1);
            } else if (item.value === 'custom') {
              setMode('custom');
            } else if (item.value.startsWith('variant-')) {
              const index = parseInt(item.value.split('-')[1]);
              setSelectedIndex(index);
              setMode('edit-variant');
            }
          }}
        />
      </Box>
    </Box>
  );
};
