import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { StyleManager, StylePreset } from '../utils/style-manager';

interface StyleCustomizationProps {
  onComplete: (stylePrompt: string) => void;
}

type Mode = 'selecting' | 'entering-custom-prompt' | 'entering-custom-name';

export const StyleCustomization: React.FC<StyleCustomizationProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<Mode>('selecting');
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    // Загружаем стили при монтировании компонента
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
      // Сохраняем стиль
      StyleManager.addCustomStyle(trimmedName, customPrompt);
    }
    onComplete(customPrompt);
  };

  const systemPrompt = `🎨 СИСТЕМНЫЙ ПРОМПТ ДЛЯ ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ:

При генерации каждого изображения используется промпт из текста + стилевые инструкции.

Базовый формат: "<описание сцены>, <ваш стиль>"

Выберите предустановленный стиль или создайте свой.
Кастомные стили сохраняются в файл styles.json`;

  if (mode === 'selecting') {
    // Создаём список пунктов для выбора
    const items = [
      {
        label: '⏭️  Пропустить (без стиля)',
        value: 'skip',
      },
      {
        label: '✏️  Создать свой стиль',
        value: 'custom',
      },
      ...styles.map((style, index) => ({
        label: `${index + 1}. ${style.name}`,
        value: `preset-${index}`,
        isPreset: true,
        prompt: style.prompt,
      })),
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">🎨 Кастомизация стиля изображений</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
          <Text dimColor>{systemPrompt}</Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="yellow">📋 Доступные стили:</Text>
        </Box>

        {styles.length > 0 && (
          <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
            {styles.slice(0, 5).map((style, index) => (
              <Box key={index} marginBottom={0}>
                <Text dimColor>
                  {index + 1}. {style.name}: <Text italic>{style.prompt.substring(0, 50)}...</Text>
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
          <Text color="cyan">🎨 Введите инструкции по стилю:</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Эти инструкции будут добавлены к каждому промпту для изображений</Text>
        </Box>
        <Box marginBottom={1}>
          <Text color="yellow">💡 Примеры:</Text>
          <Box paddingLeft={2} flexDirection="column">
            <Text dimColor>anime style, Studio Ghibli aesthetic</Text>
            <Text dimColor>photorealistic, cinematic, dramatic lighting</Text>
            <Text dimColor>oil painting, impressionist, soft brushstrokes</Text>
          </Box>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customPrompt}
            onChange={setCustomPrompt}
            onSubmit={handleCustomPromptSubmit}
            placeholder="Введите стиль..."
          />
        </Box>
      </Box>
    );
  }

  // mode === 'entering-custom-name'
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">💾 Сохранить этот стиль?</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Введите название для стиля (или оставьте пустым для пропуска):</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="yellow">Ваш стиль:</Text>
        <Text dimColor> {customPrompt}</Text>
      </Box>
      <Box>
        <Text color="green">&gt; </Text>
        <TextInput
          value={customName}
          onChange={setCustomName}
          onSubmit={handleCustomNameSubmit}
          placeholder="Название стиля (опционально)..."
        />
      </Box>
    </Box>
  );
};
