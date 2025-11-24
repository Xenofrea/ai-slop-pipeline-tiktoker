import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';

interface AspectRatioSelectorProps {
  onSelect: (ratio: '16:9' | '9:16') => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  const items = [
    {
      label: t('aspect_ratio.vertical'),
      value: '9:16' as const,
      description: t('aspect_ratio.vertical_desc'),
    },
    {
      label: t('aspect_ratio.horizontal'),
      value: '16:9' as const,
      description: t('aspect_ratio.horizontal_desc'),
    },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          📐 {t('aspect_ratio.title')}
        </Text>
      </Box>

      <SelectInput
        items={items}
        onSelect={(item: { value: '16:9' | '9:16' }) => onSelect(item.value)}
      />
    </Box>
  );
};
