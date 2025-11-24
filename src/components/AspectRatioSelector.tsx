import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

interface AspectRatioSelectorProps {
  onSelect: (ratio: '16:9' | '9:16') => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ onSelect }) => {
  const items = [
    {
      label: '9:16 (Вертикальное - TikTok/Reels)',
      value: '9:16' as const,
      description: 'Оптимально для мобильных устройств, TikTok, Instagram Reels, YouTube Shorts',
    },
    {
      label: '16:9 (Горизонтальное - YouTube)',
      value: '16:9' as const,
      description: 'Стандартный формат для YouTube, десктопа, телевизоров',
    },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          📐 Выберите формат видео:
        </Text>
      </Box>

      <SelectInput
        items={items}
        onSelect={(item: { value: '16:9' | '9:16' }) => onSelect(item.value)}
      />
    </Box>
  );
};
