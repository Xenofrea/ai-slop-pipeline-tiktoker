import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
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
  const [stage, setStage] = useState<Stage>('generating-prompts');
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [finalVideoPath, setFinalVideoPath] = useState<string>('');

  useEffect(() => {
    const runWorkflow = async () => {
      try {
        const workflow = new VideoGenerationWorkflow(useFreeModels);

        // Генерация промптов
        setStage('generating-prompts');
        setProgress('Создание промптов для видео...');
        const prompts = await workflow.generateVideoPrompts(storyText, duration);
        console.log(`\n✅ Создано ${prompts.length} промптов\n`);

        // Генерация видео И аудио параллельно
        setStage('generating-videos');
        setProgress(`Параллельная генерация ${prompts.length} видео и озвучки...`);

        const [videoPaths, audioPath] = await Promise.all([
          // Генерация и скачивание видео (скачивание происходит автоматически после каждого видео)
          workflow.generateVideos(prompts, duration, aspectRatio, referenceImage, stylePrompt, (current, total) => {
            setProgress(`Генерация и сохранение: ${current}/${total} видео завершено...`);
          }),
          // Генерация аудио параллельно
          (async () => {
            setStage('generating-audio');
            const audio = await workflow.generateAudio(storyText, voiceId);
            console.log(`\n✅ Озвучка создана: ${audio}\n`);
            return audio;
          })(),
        ]);

        console.log(`\n✅ Сгенерировано и сохранено ${videoPaths.length} видео и озвучка!\n`);

        // Склейка видео
        setStage('merging-videos');
        setProgress('Склейка видео в одно...');
        const mergedVideoPath = await workflow.mergeVideos(videoPaths);
        console.log(`\n✅ Видео склеено: ${mergedVideoPath}\n`);

        // Добавление аудио
        setStage('adding-audio');
        setProgress('Добавление озвучки к видео...');
        const finalPath = await workflow.addAudioToVideo(mergedVideoPath, audioPath);
        console.log(`\n✅ Финальное видео готово: ${finalPath}\n`);

        // Показываем сводку сессии
        workflow.getSession().printSummary();

        setFinalVideoPath(finalPath);
        setStage('complete');
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (err) {
        console.error('❌ Ошибка в workflow:', err);
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
        <Text color="red">❌ Ошибка: {error}</Text>
      </Box>
    );
  }

  if (stage === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>✅ Видео успешно создано!</Text>
        <Text>📁 Файл: {finalVideoPath}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>🎬 Создание видео...</Text>
      </Box>

      <Box>
        <Text color="yellow">
          <Spinner type="dots" />
        </Text>
        <Text> {getStageEmoji(stage)} {progress}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Пожалуйста, подождите. Генерация видео может занять несколько минут.</Text>
      </Box>
    </Box>
  );
};
