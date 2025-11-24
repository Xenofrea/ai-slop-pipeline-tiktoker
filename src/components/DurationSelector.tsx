import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

interface DurationSelectorProps {
  onSelect: (duration: number) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({ onSelect }) => {
  const items = [
    {
      label: '6 секунд',
      value: 6,
      description: '1 видео по 6 секунд',
    },
    {
      label: '12 секунд',
      value: 12,
      description: '2 видео по 6 секунд',
    },
    {
      label: '30 секунд',
      value: 30,
      description: '5 видео по 6 секунд',
    },
    {
      label: '45 секунд',
      value: 45,
      description: '7-8 видео по 6 секунд',
    },
    {
      label: '60 секунд (1 минута)',
      value: 60,
      description: '10 видео по 6 секунд',
    },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">⏱️  Выберите длину итогового видео (используйте стрелки ↑↓):</Text>
      </Box>

      {items.map((item, index) => (
        <Box key={index} marginBottom={1}>
          <Text dimColor>  {item.label} - {item.description}</Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <SelectInput
          items={items.map(item => ({
            label: item.label,
            value: item.value,
          }))}
          onSelect={(item: { value: number }) => onSelect(item.value)}
        />
      </Box>
    </Box>
  );
};
