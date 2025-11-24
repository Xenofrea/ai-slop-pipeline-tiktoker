import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useTranslation } from 'react-i18next';
import { DurationSelector } from './DurationSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { StoryVariantSelector } from './StoryVariantSelector';
import { ReferenceImageSelector } from './ReferenceImageSelector';
import { StyleCustomization } from './StyleCustomization';
import { VoiceSelector } from './VoiceSelector';
import { VideoGeneration } from './VideoGeneration';
import { TextGenerationResult } from '../api/text-generator-client';

type Step = 'input' | 'selecting-duration' | 'selecting-aspect' | 'selecting-variant' | 'selecting-reference' | 'customizing-style' | 'selecting-voice' | 'generating-videos' | 'done';

interface AppProps {
  useFreeModels?: boolean;
  onExit: () => void;
}

export const App: React.FC<AppProps> = ({ useFreeModels = false, onExit }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('input');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [variants, setVariants] = useState<TextGenerationResult[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<TextGenerationResult | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [voiceId, setVoiceId] = useState<string>('3EuKHIEZbSzrHGNmdYsx'); // Default: Josh

  const handleDescriptionSubmit = (value: string) => {
    setDescription(value);
    setStep('selecting-duration');
  };

  const handleDurationSelect = (selectedDuration: number) => {
    setDuration(selectedDuration);
    setStep('selecting-aspect');
  };

  const handleAspectRatioSelect = (ratio: '16:9' | '9:16') => {
    setAspectRatio(ratio);
    setStep('selecting-variant');
  };

  const handleVariantSelect = (variant: TextGenerationResult) => {
    setSelectedVariant(variant);
    setStep('selecting-reference');
  };

  const handleReferenceSelect = (imagePath: string | null) => {
    setReferenceImage(imagePath);
    setStep('customizing-style');
  };

  const handleStyleComplete = (style: string) => {
    setStylePrompt(style);
    setStep('selecting-voice');
  };

  const handleVoiceSelect = (selectedVoiceId: string) => {
    setVoiceId(selectedVoiceId);
    setStep('generating-videos');
  };

  const handleComplete = () => {
    setStep('done');
    setTimeout(() => {
      onExit();
    }, 2000);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🎬 {t('app.title')}
        </Text>
      </Box>

      {step === 'input' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>📝 {t('input.description_label')}</Text>
          </Box>
          <Box>
            <Text color="green">&gt; </Text>
            <TextInput
              value={description}
              onChange={setDescription}
              onSubmit={handleDescriptionSubmit}
              placeholder={t('input.description_placeholder')}
            />
          </Box>
        </Box>
      )}

      {step === 'selecting-duration' && (
        <DurationSelector onSelect={handleDurationSelect} />
      )}

      {step === 'selecting-aspect' && (
        <AspectRatioSelector onSelect={handleAspectRatioSelect} />
      )}

      {step === 'selecting-variant' && (
        <StoryVariantSelector
          description={description}
          duration={duration}
          useFreeModels={useFreeModels}
          onVariantsGenerated={setVariants}
          onSelect={handleVariantSelect}
        />
      )}

      {step === 'selecting-reference' && (
        <ReferenceImageSelector onSelect={handleReferenceSelect} />
      )}

      {step === 'customizing-style' && (
        <StyleCustomization onComplete={handleStyleComplete} />
      )}

      {step === 'selecting-voice' && (
        <VoiceSelector onSelect={handleVoiceSelect} />
      )}

      {step === 'generating-videos' && selectedVariant && (
        <VideoGeneration
          storyText={selectedVariant.text}
          duration={duration}
          aspectRatio={aspectRatio}
          referenceImage={referenceImage}
          stylePrompt={stylePrompt}
          voiceId={voiceId}
          useFreeModels={useFreeModels}
          onComplete={handleComplete}
        />
      )}

      {step === 'done' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="green" bold>✅ {t('done.message')}</Text>
          <Text dimColor>{t('done.exit')}</Text>
        </Box>
      )}
    </Box>
  );
};
