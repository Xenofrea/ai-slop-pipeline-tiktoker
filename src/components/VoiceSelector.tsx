import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';

interface VoiceSelectorProps {
  onSelect: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onSelect }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customVoiceId, setCustomVoiceId] = useState('');

  const voices = [
    {
      label: '🎤 Голос 1 - Josh (Мужской, глубокий)',
      value: '3EuKHIEZbSzrHGNmdYsx',
    },
    {
      label: '🎤 Голос 2 - Rachel (Женский, спокойный)',
      value: 'TUQNWEvVPBLzMBSVDPUA',
    },
    {
      label: '🎤 Голос 3 - Clyde (Мужской, средний)',
      value: 'Aa6nEBJJMKJwJkCx8VU2',
    },
    {
      label: '✏️ Ввести свой Voice ID',
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

  // Режим ввода своего Voice ID
  if (customMode) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan" bold>✏️ Введите ElevenLabs Voice ID:</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Найдите Voice ID в своей библиотеке ElevenLabs</Text>
        </Box>
        <Box>
          <Text color="green">&gt; </Text>
          <TextInput
            value={customVoiceId}
            onChange={setCustomVoiceId}
            onSubmit={handleCustomVoiceIdSubmit}
            placeholder="Введите Voice ID..."
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🎤 Выберите голос для озвучки:
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>Используйте стрелки ↑↓ для навигации, Enter для выбора</Text>
      </Box>

      <SelectInput items={voices} onSelect={handleSelect} />
    </Box>
  );
};
