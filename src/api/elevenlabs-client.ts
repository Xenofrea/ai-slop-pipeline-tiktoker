import { FalBaseClient } from './fal-base-client';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export interface ElevenLabsTTSInput extends Record<string, unknown> {
  text: string;
  voice?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsTTSOutput {
  audio: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  timestamps: null | any;
}

export interface TextToSpeechResult {
  audioPath: string;
  audioUrl: string;
  duration: number;
}

export class ElevenLabsTTSClient extends FalBaseClient {
  private voiceId: string;

  constructor(customApiKey?: string) {
    super('fal-ai/elevenlabs/tts/eleven-v3', customApiKey);
    // Дефолтный голос (можно изменить на любой другой)
    this.voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // George - Deep, authoritative male voice
  }

  async generateSpeech(text: string, outputDir: string = './output'): Promise<TextToSpeechResult> {
    console.log('\n' + '='.repeat(60));
    console.log('🔊  ГЕНЕРАЦИЯ ОЗВУЧКИ (ELEVENLABS via FAL)');
    console.log('='.repeat(60));
    console.log('📥 Текст:', text.substring(0, 100) + '...');
    console.log('📥 Длина текста:', text.length, 'символов');
    console.log('🎤 Voice ID:', this.voiceId);
    console.log('🤖 Model:', 'fal-ai/elevenlabs/tts/eleven-v3');

    const requestPayload: ElevenLabsTTSInput = {
      text,
      voice: this.voiceId,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    };

    console.log('   🔧 FULL REQUEST PAYLOAD:');
    console.log(JSON.stringify(requestPayload, null, 2));

    const job = await this.submitJob(requestPayload);
    const result = await this.waitForCompletion(job.jobId) as unknown as ElevenLabsTTSOutput;

    console.log('\n📤 OUTPUT:');
    console.log('   🔊 Audio URL:', result.audio?.url || 'N/A');
    console.log('   📊 File Size:', result.audio?.file_size ? (result.audio.file_size / 1024).toFixed(2) + ' KB' : 'N/A');
    console.log('   🔄 RAW API RESPONSE:');
    console.log(JSON.stringify(result, null, 2));

    if (!result.audio?.url) {
      throw new Error('No audio URL in result');
    }

    // Создаём директорию для вывода, если её нет
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const audioPath = path.join(outputDir, `narration_${Date.now()}.mp3`);

    // Скачиваем аудио
    console.log('\n💾 Скачивание аудио файла...');
    const response = await fetch(result.audio.url);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(audioPath, audioBuffer);

    console.log('✅ Аудио сохранено:', audioPath);
    console.log('📊 Размер файла:', (audioBuffer.length / 1024).toFixed(2), 'KB');

    // Примерная оценка длительности (средняя скорость речи ~ 150 слов/мин)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // в секундах

    console.log('⏱️  Примерная длительность:', estimatedDuration.toFixed(1), 'секунд');
    console.log('='.repeat(60) + '\n');

    return {
      audioPath,
      audioUrl: result.audio.url,
      duration: estimatedDuration,
    };
  }

  setVoiceId(voiceId: string) {
    this.voiceId = voiceId;
    console.log('🎤 Voice ID изменён на:', voiceId);
  }
}
