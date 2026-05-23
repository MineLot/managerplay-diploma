// app/lib/GameProgress.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@managerplay_progress';

// Структура прогресса
const DEFAULT_PROGRESS = {
  level: 1,
  score: 0,
  completedCases: 0,
  completedDays: 0,
  completedTasks: 0,
  achievements: [],
  lastPlayed: null,
  completedCaseIds: [],
  completedDayIds: [],
  completedTaskDays: [],
};

// Загрузка прогресса
export const loadProgress = async () => {
  try {
    const savedProgress = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    return DEFAULT_PROGRESS;
  } catch (error) {
    console.error('Ошибка загрузки прогресса:', error);
    return DEFAULT_PROGRESS;
  }
};

// Сохранение прогресса
export const saveProgress = async (progress) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения прогресса:', error);
    return false;
  }
};

// Обнуление прогресса
export const resetProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return DEFAULT_PROGRESS;
  } catch (error) {
    console.error('Ошибка сброса прогресса:', error);
    return DEFAULT_PROGRESS;
  }
};

// Начисление очков
export const addScore = async (points, options = {}) => {
  try {
    const currentProgress = await loadProgress();
    
    // Рассчитываем новый уровень
    const newScore = currentProgress.score + points;
    const newLevel = Math.floor(newScore / 200) + 1;
    
    // Обновляем прогресс
    const updatedProgress = {
      ...currentProgress,
      score: newScore,
      level: newLevel,
      lastPlayed: new Date().toISOString(),
      ...options,
    };
    
    // Проверка достижений
    updatedProgress.achievements = checkAchievements(updatedProgress);
    
    await saveProgress(updatedProgress);
    return updatedProgress;
  } catch (error) {
    console.error('Ошибка начисления очков:', error);
    return null;
  }
};

// Проверка достижений
const checkAchievements = (progress) => {
  const achievements = [...progress.achievements];
  
  // Достижение "Новичок" — 50 очков
  if (progress.score >= 50 && !achievements.includes('beginner')) {
    achievements.push('beginner');
  }
  
  // Достижение "Стратег" — 5 завершённых кейсов
  if (progress.completedCases >= 5 && !achievements.includes('strategist')) {
    achievements.push('strategist');
  }
  
  // Достижение "Тайм-менеджер" — 3 завершённых дня
  if (progress.completedDays >= 3 && !achievements.includes('time_manager')) {
    achievements.push('time_manager');
  }
  
  // Достижение "Мастер роста" — 7 завершённых дней челленджа
  if (progress.completedTasks >= 7 && !achievements.includes('growth_master')) {
    achievements.push('growth_master');
  }
  
  // Достижение "Эксперт" — уровень 5+
  if (progress.level >= 5 && !achievements.includes('expert')) {
    achievements.push('expert');
  }
  
  return achievements;
};

// Получение названия достижения
export const getAchievementName = (achievementId) => {
  const names = {
    beginner: 'Новичок',
    strategist: 'Стратег',
    time_manager: 'Тайм-менеджер',
    growth_master: 'Мастер роста',
    expert: 'Эксперт',
  };
  return names[achievementId] || achievementId;
};

// Получение описания достижения
export const getAchievementDescription = (achievementId) => {
  const descriptions = {
    beginner: 'Наберите 50 очков',
    strategist: 'Завершите 5 кейсов',
    time_manager: 'Завершите 3 дня в игре "День менеджера"',
    growth_master: 'Завершите 7-дневный челлендж',
    expert: 'Достигните 5 уровня',
  };
  return descriptions[achievementId] || 'Достижение';
};

// Получение иконки достижения
export const getAchievementIcon = (achievementId) => {
  const icons = {
    beginner: '⭐',
    strategist: '⚔️',
    time_manager: '⏰',
    growth_master: '🚀',
    expert: '🏆',
  };
  return icons[achievementId] || '🎯';
};