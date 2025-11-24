import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';

interface DurationSelectorProps {
  onSelect: (duration: number) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  const items = [
    {
      label: t('duration.6_seconds'),
      value: 6,
      description: t('duration.desc_1_video'),
    },
    {
      label: t('duration.12_seconds'),
      value: 12,
      description: t('duration.desc_2_videos'),
    },
    {
      label: t('duration.30_seconds'),
      value: 30,
      description: t('duration.desc_5_videos'),
    },
    {
      label: t('duration.45_seconds'),
      value: 45,
      description: t('duration.desc_7_8_videos'),
    },
    {
      label: t('duration.60_seconds'),
      value: 60,
      description: t('duration.desc_10_videos'),
    },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">⏱️  {t('duration.title')}</Text>
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
