#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Парсим аргументы командной строки
const args = process.argv.slice(2);
const useFreeModels = args.includes('--free');

if (useFreeModels) {
  console.log('💰 Режим FREE: используются бесплатные модели\n');
}

// Проверяем наличие необходимых API ключей
if (!process.env.FAL_API_KEY) {
  console.error('❌ Ошибка: FAL_API_KEY не установлен в .env файле');
  process.exit(1);
}

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ Ошибка: OPENROUTER_API_KEY не установлен в .env файле');
  process.exit(1);
}

// Рендерим приложение
const { waitUntilExit } = render(
  <App
    useFreeModels={useFreeModels}
    onExit={() => {
      process.exit(0);
    }}
  />
);

// Обработка выхода
waitUntilExit().then(() => {
  console.log('\n👋 До свидания!\n');
});
