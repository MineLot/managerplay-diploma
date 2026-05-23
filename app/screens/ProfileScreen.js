// app/screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { loadProgress, resetProgress, getAchievementName, getAchievementIcon, getAchievementDescription } from '../lib/GameProgress';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    name: 'Менеджер',
    position: 'Middle-менеджер',
    level: 1,
    score: 0,
    completedCases: 0,
    completedDays: 0,
    completedTasks: 0,
    achievements: [],
  });

  useEffect(() => {
  loadUserData();
  console.log('Прогресс обновлен:', userData);
  }, [userData]);

  const loadUserData = async () => {
    try {
      const progress = await loadProgress();
      setUserData({
        name: 'Менеджер',
        position: 'Middle-менеджер',
        level: progress.level || 1,
        score: progress.score || 0,
        completedCases: progress.completedCases || 0,
        completedDays: progress.completedDays || 0,
        completedTasks: progress.completedTasks || 0,
        achievements: progress.achievements || [],
      });
    } catch (error) {
      console.error('Ошибка загрузки данных профиля:', error);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите обнулить весь прогресс? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Обнулить',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            loadUserData();
            Alert.alert('Успех', 'Прогресс успешно обнулён!');
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Шапка профиля */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.position}>{userData.position}</Text>
      </View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData.level}</Text>
          <Text style={styles.statLabel}>Уровень</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData.score}</Text>
          <Text style={styles.statLabel}>Очки</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData.completedCases}</Text>
          <Text style={styles.statLabel}>Кейсов</Text>
        </View>
      </View>

      {/* Достижения */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Достижения ({userData.achievements.length}/5)</Text>
        <View style={styles.achievementsGrid}>
          {[
            { id: 'beginner', icon: '⭐', name: 'Новичок', desc: 'Наберите 50 очков' },
            { id: 'strategist', icon: '⚔️', name: 'Стратег', desc: 'Завершите 5 кейсов' },
            { id: 'time_manager', icon: '⏰', name: 'Тайм-менеджер', desc: 'Завершите 3 дня' },
            { id: 'growth_master', icon: '🚀', name: 'Мастер роста', desc: 'Завершите 7 дней' },
            { id: 'expert', icon: '🏆', name: 'Эксперт', desc: 'Достигните 5 уровня' },
          ].map((achievement) => {
            const isUnlocked = userData.achievements.includes(achievement.id);
            return (
              <View
                key={achievement.id}
                style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
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

      {/* Статистика игр */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Статистика игр</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statRowLeft}>
            <Text style={styles.statRowTitle}>Кейс-битва</Text>
            <Text style={styles.statRowValue}>{userData.completedCases} / 5</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, userData.completedCases / 5 * 100)}%` }]} />
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statRowLeft}>
            <Text style={styles.statRowTitle}>День менеджера</Text>
            <Text style={styles.statRowValue}>{userData.completedDays} / 10</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, userData.completedDays / 10 * 100)}%` }]} />
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statRowLeft}>
            <Text style={styles.statRowTitle}>7 дней роста</Text>
            <Text style={styles.statRowValue}>{userData.completedTasks} / 7</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, userData.completedTasks / 7 * 100)}%` }]} />
          </View>
        </View>
      </View>

      {/* Информация */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Информация</Text>
        <Text style={styles.infoText}>
          ManagerPlay — приложение для развития управленческих навыков через геймификацию.
        </Text>
        <Text style={styles.infoText}>
          Версия: 1.0.0
        </Text>
        <Text style={styles.infoText}>
          Разработано для ВКР, ВГУ 2026
        </Text>
      </View>

      {/* Кнопки действий */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={loadUserData}>
          <Text style={styles.actionButtonText}>🔄 Обновить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleResetProgress}>
          <Text style={styles.resetButtonText}>🗑️ Обнулить прогресс</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
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
    padding: 20,
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
    fontSize: 40,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementBadge: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  achievementBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statRow: {
    marginBottom: 16,
  },
  statRowLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statRowTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  statRowValue: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});