// app/screens/ProgressScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { loadProgress, resetProgress } from '../lib/GameProgress';

export default function ProgressScreen() {
  const [progress, setProgress] = useState({
    level: 1,
    score: 0,
    completedCases: 0,
    completedDays: 0,
    completedTasks: 0,
    achievements: [],
  });

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const handleReset = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите обнулить весь прогресс? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Обнулить',
          style: 'destructive',
          onPress: async () => {
            const resetProgressData = await resetProgress();
            setProgress(resetProgressData);
            Alert.alert('Успех', 'Прогресс успешно обнулён!');
          },
        },
      ]
    );
  };

  // Расчёт прогресса до следующего уровня
  const scoreToNextLevel = (progress.level + 1) * 200;
  const progressPercentage = Math.min(100, (progress.score / scoreToNextLevel) * 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Прогресс</Text>
      </View>

      {/* Карточка уровня */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ваш уровень</Text>
        <Text style={styles.level}>{progress.level}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {progress.score} / {scoreToNextLevel} очков до следующего уровня
        </Text>
      </View>

      {/* Статистика */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Кейс-битва</Text>
          <Text style={styles.statValue}>{progress.completedCases} / 5</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>День менеджера</Text>
          <Text style={styles.statValue}>{progress.completedDays} / 10</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>7 дней роста</Text>
          <Text style={styles.statValue}>{progress.completedTasks} / 7</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Всего очков</Text>
          <Text style={styles.statValue}>{progress.score}</Text>
        </View>
      </View>

      {/* Достижения */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Достижения</Text>
        <Text style={styles.achievementsCount}>
          Открыто: {progress.achievements.length} / 5
        </Text>
        
        <View style={styles.achievementsGrid}>
          {[
            { id: 'beginner', name: 'Новичок', icon: '⭐', requirement: '50 очков' },
            { id: 'strategist', name: 'Стратег', icon: '⚔️', requirement: '5 кейсов' },
            { id: 'time_manager', name: 'Тайм-менеджер', icon: '⏰', requirement: '3 дня' },
            { id: 'growth_master', name: 'Мастер роста', icon: '🚀', requirement: '7 дней' },
            { id: 'expert', name: 'Эксперт', icon: '🏆', requirement: '5 уровень' },
          ].map((achievement) => {
            const isUnlocked = progress.achievements.includes(achievement.id);
            return (
              <View
                key={achievement.id}
                style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementRequirement}>{achievement.requirement}</Text>
                {isUnlocked && (
                  <View style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>✓ Открыто</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Кнопка сброса */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>🔄 Обнулить прогресс</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  level: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  achievementsCount: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  achievementCardUnlocked: {
    backgroundColor: '#F0FDF4',
    opacity: 1,
    borderColor: '#10B981',
    borderWidth: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementRequirement: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  achievementBadge: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});