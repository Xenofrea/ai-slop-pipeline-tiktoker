import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { VideoStep } from '../types/video-step';

interface StepEditorProps {
  step: VideoStep;
  onUpdate: (updatedStep: VideoStep) => void;
  onRegenerate: (stepIndex: number, prompt: string) => void;
  onUploadImage: (stepIndex: number, imagePath: string) => void;
}

type Mode = 'view' | 'edit-prompt' | 'edit-duration' | 'upload-image';

export const StepEditor: React.FC<StepEditorProps> = ({
  step,
  onUpdate,
  onRegenerate,
  onUploadImage,
}) => {
  const [mode, setMode] = useState<Mode>('view');
  const [editedPrompt, setEditedPrompt] = useState(step.prompt);
  const [editedDuration, setEditedDuration] = useState(step.duration.toString());
  const [imagePath, setImagePath] = useState('');

  const handlePromptSubmit = () => {
    onUpdate({ ...step, prompt: editedPrompt });
    setMode('view');
  };

  const handleDurationSubmit = () => {
    const duration = parseInt(editedDuration, 10);
    if (!isNaN(duration) && duration > 0) {
      onUpdate({ ...step, duration });
    }
    setMode('view');
  };

  const handleImagePathSubmit = () => {
    onUploadImage(step.index, imagePath);
    setMode('view');
  };

  const handleRegenerate = () => {
    onRegenerate(step.index, step.prompt);
  };

  if (step.isGenerating) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
        <Text color="yellow">
          <Spinner type="dots" /> Generating image for step {step.index + 1}...
        </Text>
      </Box>
    );
  }

  if (mode === 'edit-prompt') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <Text bold>Edit Prompt (Step {step.index + 1}):</Text>
        <Box marginTop={1}>
          <TextInput
            value={editedPrompt}
            onChange={setEditedPrompt}
            onSubmit={handlePromptSubmit}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Enter to save, Ctrl+C to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'edit-duration') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <Text bold>Edit Duration (Step {step.index + 1}):</Text>
        <Box marginTop={1}>
          <Text>Duration (seconds): </Text>
          <TextInput
            value={editedDuration}
            onChange={setEditedDuration}
            onSubmit={handleDurationSubmit}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Enter to save, Ctrl+C to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'upload-image') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <Text bold>Upload Custom Image (Step {step.index + 1}):</Text>
        <Box marginTop={1}>
          <Text>Image path: </Text>
          <TextInput
            value={imagePath}
            onChange={setImagePath}
            onSubmit={handleImagePathSubmit}
            placeholder="/path/to/image.jpg"
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Enter to upload, Ctrl+C to cancel</Text>
        </Box>
      </Box>
    );
  }

  const actions = [
    { label: 'Edit Prompt', value: 'edit-prompt' },
    { label: 'Edit Duration', value: 'edit-duration' },
    { label: 'Regenerate Image', value: 'regenerate' },
    { label: 'Upload Custom Image', value: 'upload' },
    { label: 'Next Step', value: 'next' },
  ];

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
      <Text bold color="cyan">Step {step.index + 1}</Text>

      <Box marginTop={1}>
        <Text dimColor>Prompt: </Text>
        <Text>{step.prompt}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Duration: </Text>
        <Text>{step.duration}s</Text>
      </Box>

      {step.imagePath && (
        <Box marginTop={1}>
          <Text color="green">Image: {step.imagePath}</Text>
        </Box>
      )}

      {step.error && (
        <Box marginTop={1}>
          <Text color="red">Error: {step.error}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Select action:</Text>
      </Box>

      <SelectInput
        items={actions}
        onSelect={(item) => {
          if (item.value === 'edit-prompt') {
            setMode('edit-prompt');
          } else if (item.value === 'edit-duration') {
            setMode('edit-duration');
          } else if (item.value === 'regenerate') {
            handleRegenerate();
          } else if (item.value === 'upload') {
            setMode('upload-image');
          }
          // 'next' will be handled by parent component
        }}
      />
    </Box>
  );
};
