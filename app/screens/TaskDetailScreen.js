// app/screens/TaskDetailScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addScore, loadProgress } from '../lib/GameProgress';

const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const {
    day = 1,
    title = 'Задание дня',
    description = '',
    tips = '',
    points = 10
  } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    score: 0,
    completedTasks: 0,
    achievements: []
  });

  // Проверка, выполнено ли задание ранее
  useEffect(() => {
    const checkTaskCompletion = async () => {
      try {
        const progress = await loadProgress();
        setUserProgress(progress);
        
        // Проверка, выполнялось ли задание этого дня ранее
        const isTaskDone = progress.completedTaskDays?.includes(day);
        setIsCompleted(isTaskDone);
      } catch (error) {
        console.error('Ошибка проверки выполнения задания:', error);
      }
    };

    checkTaskCompletion();
  }, [day]);

  // Обработка выполнения задания
  const handleCompleteTask = async () => {
    if (isCompleted) {
      Alert.alert('Уже выполнено', 'Вы уже выполнили это задание сегодня');
      return;
    }

    Alert.alert(
      'Подтвердите выполнение',
      'Вы уверены, что выполнили это задание?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да, выполнено',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Загрузка текущего прогресса
              const currentProgress = await loadProgress();

              // Начисление очков
              const updatedProgress = await addScore(points, {
                completedTasks: (currentProgress.completedTasks || 0) + 1,
                completedTaskDays: [...(currentProgress.completedTaskDays || []), day],
              });

              if (updatedProgress) {
                setUserProgress(updatedProgress);
                setIsCompleted(true);
                
                // Проверка достижения "Мастер роста"
                if (updatedProgress.completedTasks >= 7 && !updatedProgress.achievements.includes('growth_master')) {
                  Alert.alert(
                    '🎉 Достижение разблокировано!',
                    'Вы завершили 7-дневный челлендж! Получено достижение "Мастер роста".',
                    [{ text: 'Отлично!' }]
                  );
                }
                
                Alert.alert(
                  '✅ Отлично!',
                  `Вы получили +${points} очков!`,
                  [{ text: 'Продолжить', onPress: () => navigation.navigate('SevenDays') }]
                );
              } else {
                Alert.alert('Ошибка', 'Не удалось сохранить прогресс.');
              }
            } catch (error) {
              console.error('Ошибка сохранения прогресса:', error);
              Alert.alert('Ошибка', 'Не удалось сохранить прогресс. Попробуйте ещё раз.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Возврат к календарю
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>День {day}</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Карточка задания */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{title}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>+{points}</Text>
            </View>
          </View>
          
          <Text style={styles.taskDescription}>{description}</Text>
        </View>

        {/* Советы */}
        {tips && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Советы:</Text>
            <Text style={styles.tipsText}>{tips}</Text>
          </View>
        )}

        {/* Прогресс пользователя */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Ваш прогресс</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Уровень</Text>
              <Text style={styles.statValue}>{userProgress.level}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Очки</Text>
              <Text style={styles.statValue}>{userProgress.score}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Дней</Text>
              <Text style={styles.statValue}>{userProgress.completedTasks || 0}</Text>
            </View>
          </View>
        </View>

        {/* Кнопка выполнения */}
        <View style={styles.actionContainer}>
          {isCompleted ? (
            <View style={styles.completedContainer}>
              <View style={styles.completedBadge}>
                <Text style={styles.completedIcon}>✓</Text>
              </View>
              <Text style={styles.completedTitle}>Задание выполнено!</Text>
              <Text style={styles.completedSubtitle}>
                Вы получили +{points} очков
              </Text>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={() => navigation.navigate('SevenDays')}
              >
                <Text style={styles.continueButtonText}>Вернуться к календарю</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.completeButton, isLoading && styles.buttonDisabled]} 
              onPress={handleCompleteTask}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.completeButtonText}>Отметить выполнение</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Напоминание */}
        {!isCompleted && (
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>📝 Напоминание:</Text>
            <Text style={styles.reminderText}>
              После выполнения задания нажмите кнопку выше, чтобы получить очки и открыть следующий день.
            </Text>
          </View>
        )}

        {/* Достижения */}
        {userProgress.achievements.length > 0 && (
          <View style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>Ваши достижения</Text>
            <View style={styles.achievementsList}>
              {userProgress.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <Text style={styles.achievementName}>
                    {achievement === 'beginner' ? 'Новичок' :
                     achievement === 'strategist' ? 'Стратег' :
                     achievement === 'time_manager' ? 'Тайм-менеджер' :
                     achievement === 'growth_master' ? 'Мастер роста' :
                     achievement === 'expert' ? 'Эксперт' : 'Достижение'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  emptySpace: {
    width: 24,
  },
  content: {
    paddingBottom: 30,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  pointsBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  pointsBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  actionContainer: {
    marginBottom: 20,
  },
  completedContainer: {
    alignItems: 'center',
  },
  completedBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#10B981',
  },
  completedIcon: {
    fontSize: 48,
    color: '#10B981',
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
});

export default TaskDetailScreen;