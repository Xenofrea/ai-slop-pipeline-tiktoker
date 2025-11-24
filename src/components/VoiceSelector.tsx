import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { useTranslation } from 'react-i18next';

interface VoiceSelectorProps {
  onSelect: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [customMode, setCustomMode] = useState(false);
  const [customVoiceId, setCustomVoiceId] = useState('');

  const voices = [
    {
      label: `🎤 ${t('voice.voice_1')}`,
      value: '3EuKHIEZbSzrHGNmdYsx',
    },
    {
      label: `🎤 ${t('voice.voice_2')}`,
      value: 'TUQNWEvVPBLzMBSVDPUA',
    },
    {
      label: `🎤 ${t('voice.voice_3')}`,
      value: 'Aa6nEBJJMKJwJkCx8VU2',
    },
    {
      label: `✏️ ${t('voice.custom')}`,
      value: 'custom',
    },
  ];

  const handleSelect = (item: { label: string; value: string }) => {
    if (item.value === 'custom') {
      setCustomMode(true);
    } else {
      onSelect(item.value);
    }
  };

  const handleCustomVoiceIdSubmit = (voiceId: string) => {
    onSelect(voiceId);
  };

  // Custom Voice ID input mode
  if (customMode) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan" bold>✏️ {t('voice.custom_title')}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>{t('voice.custom_desc')}</Text>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customVoiceId}
            onChange={setCustomVoiceId}
            onSubmit={handleCustomVoiceIdSubmit}
            placeholder={t('voice.custom_placeholder')}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🎤 {t('voice.title')}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>{t('voice.desc')}</Text>
      </Box>

      <SelectInput items={voices} onSelect={handleSelect} />
    </Box>
  );
};
