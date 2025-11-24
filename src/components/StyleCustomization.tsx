import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';
import { StyleManager, StylePreset } from '../utils/style-manager';

interface StyleCustomizationProps {
  onComplete: (stylePrompt: string) => void;
}

type Mode = 'selecting' | 'entering-custom-prompt' | 'entering-custom-name';

export const StyleCustomization: React.FC<StyleCustomizationProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('selecting');
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    // Load styles on component mount
    const loadedStyles = StyleManager.loadStyles();
    setStyles(loadedStyles);
  }, []);

  const handleStyleSelect = (item: { value: string; isPreset?: boolean; prompt?: string }) => {
    if (item.value === 'skip') {
      onComplete('');
    } else if (item.value === 'custom') {
      setMode('entering-custom-prompt');
    } else if (item.isPreset && item.prompt) {
      // Используем предустановленный стиль
      onComplete(item.prompt);
    }
  };

  const handleCustomPromptSubmit = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      onComplete('');
      return;
    }
    setCustomPrompt(trimmedPrompt);
    setMode('entering-custom-name');
  };

  const handleCustomNameSubmit = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      // Save style
      StyleManager.addCustomStyle(trimmedName, customPrompt);
    }
    onComplete(customPrompt);
  };

  if (mode === 'selecting') {
    // Create list items for selection
    const items = [
      {
        label: `⏭️  ${t('style.skip')}`,
        value: 'skip',
      },
      {
        label: `✏️  ${t('style.custom')}`,
        value: 'custom',
      },
      ...styles.map((style, index) => ({
        label: `${index + 1}. ${StyleManager.getStyleName(style)}`,
        value: `preset-${index}`,
        isPreset: true,
        prompt: style.prompt,
      })),
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">🎨 {t('style.title')}</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
          <Text dimColor>{t('style.system_prompt')}</Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="yellow">📋 {t('style.available_styles')}</Text>
        </Box>

        {styles.length > 0 && (
          <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
            {styles.slice(0, 5).map((style, index) => (
              <Box key={index} marginBottom={0}>
                <Text dimColor>
                  {index + 1}. {StyleManager.getStyleName(style)}: <Text italic>{style.prompt.substring(0, 50)}...</Text>
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={handleStyleSelect}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'entering-custom-prompt') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">🎨 {t('style.custom_prompt_title')}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>{t('style.custom_prompt_desc')}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text color="yellow">💡 {t('style.examples')}</Text>
          <Box paddingLeft={2} flexDirection="column">
            <Text dimColor>{t('style.example_1')}</Text>
            <Text dimColor>{t('style.example_2')}</Text>
            <Text dimColor>{t('style.example_3')}</Text>
          </Box>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customPrompt}
            onChange={setCustomPrompt}
            onSubmit={handleCustomPromptSubmit}
            placeholder={t('style.custom_prompt_placeholder')}
          />
        </Box>
      </Box>
    );
  }

  // mode === 'entering-custom-name'
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">💾 {t('style.save_title')}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>{t('style.save_desc')}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="yellow">{t('style.your_style')}</Text>
        <Text dimColor> {customPrompt}</Text>
      </Box>
      <Box>
        <Text color="green">&gt; </Text>
        <TextInput
          value={customName}
          onChange={setCustomName}
          onSubmit={handleCustomNameSubmit}
          placeholder={t('style.save_placeholder')}
        />
      </Box>
    </Box>
  );
};
