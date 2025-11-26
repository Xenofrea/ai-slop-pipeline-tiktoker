import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useTranslation } from 'react-i18next';
import { VideoGenerationWorkflow } from '../workflows/video-generation-workflow';
import { VideoStep } from '../types/video-step';
import { CostBreakdown } from '../utils/cost-calculator';

interface VideoGenerationProps {
  storyText: string;
  duration: number;
  aspectRatio: '16:9' | '9:16';
  referenceImage: string | null;
  stylePrompt: string;
  voiceId: string;
  videoSteps?: VideoStep[];
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

export const VideoGeneration: React.FC<VideoGenerationProps> = ({ storyText, duration, aspectRatio, referenceImage, stylePrompt, voiceId, videoSteps, useFreeModels = false, onComplete }) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>(videoSteps ? 'generating-videos' : 'generating-prompts');
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [finalVideoPath, setFinalVideoPath] = useState<string>('');
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  useEffect(() => {
    const runWorkflow = async () => {
      try {
        const workflow = new VideoGenerationWorkflow(useFreeModels);

        let prompts: string[];

        // If we have videoSteps, use them; otherwise generate prompts
        if (videoSteps && videoSteps.length > 0) {
          prompts = videoSteps.map(step => step.prompt);
          console.log(`\n✅ Using ${prompts.length} prepared steps\n`);
        } else {
          // Generate prompts
          setStage('generating-prompts');
          setProgress(t('generation.title'));
          prompts = await workflow.generateVideoPrompts(storyText, duration);
          console.log(`\n✅ Created ${prompts.length} prompts\n`);
        }

        // Generate videos AND audio in parallel
        setStage('generating-videos');
        setProgress(`Parallel generation of ${prompts.length} videos and audio...`);

        const [videoPaths, audioPath] = await Promise.all([
          // Generate and download videos (download happens automatically after each video)
          workflow.generateVideos(
            prompts,
            duration,
            aspectRatio,
            referenceImage,
            stylePrompt,
            (current, total) => {
              setProgress(`Generation and saving: ${current}/${total} videos completed...`);
            },
            videoSteps // Pass videoSteps to use prepared images
          ),
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

        // Get cost breakdown
        const costCalc = workflow.getCostCalculator();
        const breakdown = costCalc.calculateCost();
        setCostBreakdown(breakdown);

        // Print cost breakdown to console
        costCalc.printCostBreakdown();

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

        {costBreakdown && (
          <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="yellow" padding={1}>
            <Text color="cyan" bold>💰 {t('cost.title')}</Text>

            {costBreakdown.details.images.count > 0 && (
              <Box marginTop={1}>
                <Text dimColor>🖼️  {t('cost.images')}: </Text>
                <Text color="yellow">{costBreakdown.details.images.count} × ${costBreakdown.imageGeneration.toFixed(4)}</Text>
              </Box>
            )}

            {costBreakdown.details.videos.count > 0 && (
              <Box marginTop={1}>
                <Text dimColor>🎬 {t('cost.videos')}: </Text>
                <Text color="yellow">{costBreakdown.details.videos.count} × ${costBreakdown.videoGeneration.toFixed(4)}</Text>
              </Box>
            )}

            {costBreakdown.details.audio.characters > 0 && (
              <Box marginTop={1}>
                <Text dimColor>🔊 {t('cost.audio')}: </Text>
                <Text color="yellow">{costBreakdown.details.audio.characters} chars × ${costBreakdown.audioGeneration.toFixed(4)}</Text>
              </Box>
            )}

            <Box marginTop={1}>
              <Text color="green" bold>💵 {t('cost.total')}: ${costBreakdown.total.toFixed(4)}</Text>
            </Box>
          </Box>
        )}
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
