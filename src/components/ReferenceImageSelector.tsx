import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';

interface ReferenceImageSelectorProps {
  onSelect: (imagePath: string | null) => void;
}

export const ReferenceImageSelector: React.FC<ReferenceImageSelectorProps> = ({ onSelect }) => {
  const { t } = useTranslation();
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
        label: t('reference.skip'),
        value: 'skip',
      },
      {
        label: t('reference.provide'),
        value: 'provide',
      },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan">🖼️  {t('reference.title')}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            {t('reference.desc_1')}
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>{t('reference.desc_2')}</Text>
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
        <Text color="cyan">🖼️  {t('reference.path_title')}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>{t('reference.path_desc_1')}</Text>
        <Text dimColor>{t('reference.path_desc_2')}</Text>
      </Box>
      <Box>
        <Text color="green">&gt; </Text>
        <TextInput
          value={imagePath}
          onChange={setImagePath}
          onSubmit={handlePathSubmit}
          placeholder={t('reference.path_placeholder')}
        />
      </Box>
    </Box>
  );
};
