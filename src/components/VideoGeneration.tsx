import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useTranslation } from 'react-i18next';
import { VideoGenerationWorkflow } from '../workflows/video-generation-workflow';

interface VideoGenerationProps {
  storyText: string;
  duration: number;
  aspectRatio: '16:9' | '9:16';
  referenceImage: string | null;
  stylePrompt: string;
  voiceId: string;
  useFreeModels?: boolean;
  onComplete: () => void;
}

type Stage =
  | 'generating-prompts'
  | 'generating-images'
  | 'generating-videos'
  | 'generating-audio'
  | 'merging-videos'
  | 'adding-audio'
  | 'complete'
  | 'error';

export const VideoGeneration: React.FC<VideoGenerationProps> = ({ storyText, duration, aspectRatio, referenceImage, stylePrompt, voiceId, useFreeModels = false, onComplete }) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>('generating-prompts');
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [finalVideoPath, setFinalVideoPath] = useState<string>('');

  useEffect(() => {
    const runWorkflow = async () => {
      try {
        const workflow = new VideoGenerationWorkflow(useFreeModels);

        // Generate prompts
        setStage('generating-prompts');
        setProgress(t('generation.title'));
        const prompts = await workflow.generateVideoPrompts(storyText, duration);
        console.log(`\n✅ Created ${prompts.length} prompts\n`);

        // Generate videos AND audio in parallel
        setStage('generating-videos');
        setProgress(`Parallel generation of ${prompts.length} videos and audio...`);

        const [videoPaths, audioPath] = await Promise.all([
          // Generate and download videos (download happens automatically after each video)
          workflow.generateVideos(prompts, duration, aspectRatio, referenceImage, stylePrompt, (current, total) => {
            setProgress(`Generation and saving: ${current}/${total} videos completed...`);
          }),
          // Generate audio in parallel
          (async () => {
            setStage('generating-audio');
            const audio = await workflow.generateAudio(storyText, voiceId);
            console.log(`\n✅ Audio created: ${audio}\n`);
            return audio;
          })(),
        ]);

        console.log(`\n✅ Generated and saved ${videoPaths.length} videos and audio!\n`);

        // Merge videos
        setStage('merging-videos');
        setProgress('Merging videos into one...');
        const mergedVideoPath = await workflow.mergeVideos(videoPaths);
        console.log(`\n✅ Videos merged: ${mergedVideoPath}\n`);

        // Add audio
        setStage('adding-audio');
        setProgress('Adding audio to video...');
        const finalPath = await workflow.addAudioToVideo(mergedVideoPath, audioPath);
        console.log(`\n✅ Final video ready: ${finalPath}\n`);

        // Show session summary
        workflow.getSession().printSummary();

        setFinalVideoPath(finalPath);
        setStage('complete');
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (err) {
        console.error('❌ Workflow error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStage('error');
      }
    };

    runWorkflow();
  }, [storyText, onComplete]);

  const getStageEmoji = (currentStage: Stage): string => {
    const emojis: Record<Stage, string> = {
      'generating-prompts': '📝',
      'generating-images': '🖼️',
      'generating-videos': '🎬',
      'generating-audio': '🔊',
      'merging-videos': '🎞️',
      'adding-audio': '🎵',
      'complete': '✅',
      'error': '❌',
    };
    return emojis[currentStage] || '⏳';
  };

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ {t('generation.error')} {error}</Text>
      </Box>
    );
  }

  if (stage === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>✅ {t('generation.complete')}</Text>
        <Text>📁 {t('generation.file')} {finalVideoPath}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>🎬 {t('generation.title')}</Text>
      </Box>

      <Box>
        <Text color="yellow">
          <Spinner type="dots" />
        </Text>
        <Text> {getStageEmoji(stage)} {progress}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>{t('generation.wait')}</Text>
      </Box>
    </Box>
  );
};
