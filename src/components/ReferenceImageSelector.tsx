import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

interface ReferenceImageSelectorProps {
  onSelect: (imagePath: string | null) => void;
}

export const ReferenceImageSelector: React.FC<ReferenceImageSelectorProps> = ({ onSelect }) => {
  const [mode, setMode] = useState<'choosing' | 'entering'>('choosing');
  const [imagePath, setImagePath] = useState('');

  const handleModeSelect = (item: { value: string }) => {
    if (item.value === 'skip') {
      onSelect(null);
    } else {
      setMode('entering');
    }
  };

  const handlePathSubmit = (path: string) => {
    onSelect(path.trim() || null);
  };

  if (mode === 'choosing') {
    const items = [
      {
        label: 'Пропустить (без reference изображения)',
        value: 'skip',
      },
      {
        label: 'Указать путь к reference изображению',
        value: 'provide',
      },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">🖼️  Reference изображение (опционально):</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            Reference изображение будет использоваться для генерации всех кадров видео.
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Это поможет сохранить единый стиль персонажа или локации.</Text>
        </Box>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={handleModeSelect}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">🖼️  Введите путь к reference изображению:</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Поддерживаются форматы: jpg, jpeg, png, webp</Text>
        <Text dimColor>Пример: /Users/name/image.jpg или ./reference.png</Text>
      </Box>
      <Box>
        <Text color="green">&gt; </Text>
        <TextInput
          value={imagePath}
          onChange={setImagePath}
          onSubmit={handlePathSubmit}
          placeholder="Путь к изображению..."
        />
      </Box>
    </Box>
  );
};
