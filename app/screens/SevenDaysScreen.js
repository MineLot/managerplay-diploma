// app/screens/SevenDaysScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SevenDaysScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('calendar'); // 'calendar', 'task', 'completed'
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    score: 0,
    completedDays: 0,
    achievements: []
  });
  const [completedDays, setCompletedDays] = useState([]);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const navigation = useNavigation();

  // Задания на 7 дней
  const dailyTasks = [
    {
      day: 1,
      title: 'Проведите 1:1 встречу',
      description: 'Назначьте короткую встречу один на один с одним из подчинённых. Обсудите их цели, сложности и поддержку, которую вы можете оказать.',
      tips: 'Спросите: "Какие у тебя цели на ближайшие 2 недели?" и "Что я могу сделать, чтобы помочь тебе?"',
      points: 10
    },
    {
      day: 2,
      title: 'Делегируйте одну задачу',
      description: 'Выберите задачу, которую можно делегировать, и передайте её подходящему сотруднику. Объясните ожидания и сроки.',
      tips: 'Используйте модель "Что, Зачем, Как": что нужно сделать, зачем это важно, как это сделать.',
      points: 12
    },
    {
      day: 3,
      title: 'Дайте обратную связь по модели SBI',
      description: 'Выберите ситуацию, где сотрудник проявил себя, и дайте конструктивную обратную связь по модели Ситуация-Поведение-Влияние.',
      tips: 'Пример: "На вчерашнем совещании (ситуация), ты предложил альтернативное решение (поведение), что помогло нам сэкономить время (влияние)."',
      points: 15
    },
    {
      day: 4,
      title: 'Проведите анализ своего дня',
      description: 'В конце рабочего дня проанализируйте, как вы распределили время. Запишите, что получилось хорошо и что можно улучшить.',
      tips: 'Используйте матрицу Эйзенхауэра: сколько времени вы потратили на важное и срочное?',
      points: 10
    },
    {
      day: 5,
      title: 'Поблагодарите сотрудника',
      description: 'Найдите момент, чтобы искренне поблагодарить одного из сотрудников за конкретную работу или качество.',
      tips: 'Будьте конкретны: "Спасибо за то, что вчера помог коллеге с дедлайном — это показало твою командную ответственность."',
      points: 8
    },
    {
      day: 6,
      title: 'Задайте вопрос "Почему?" трижды',
      description: 'В следующий раз, когда столкнётесь с проблемой, задайте вопрос "Почему?" три раза подряд, чтобы докопаться до корневой причины.',
      tips: 'Пример: "Почему проект задерживается?" → "Почему сроки были нарушены?" → "Почему не было резерва времени?"',
      points: 12
    },
    {
      day: 7,
      title: 'Сформулируйте личную цель',
      description: 'Запишите одну профессиональную цель на следующую неделю. Сделайте её конкретной, измеримой и достижимой.',
      tips: 'Используйте методику SMART: конкретная, измеримая, достижимая, релевантная, ограниченная по времени.',
      points: 15
    }
  ];


  const handleBackToHome = () => {
    navigation.navigate('MainTabs');
  };
  // Загрузка прогресса пользователя
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.replace('Auth');
          return;
        }

        // Загрузка из локального хранилища
        const storedCompletedDays = await AsyncStorage.getItem(`completedDays_${user.uid}`);
        if (storedCompletedDays) {
          setCompletedDays(JSON.parse(storedCompletedDays));
        }

        // Загрузка из Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProgress({
            level: userDoc.data().level || 1,
            score: userDoc.data().score || 0,
            completedDays: userDoc.data().completedDays || 0,
            achievements: userDoc.data().achievements || []
          });

          // Проверка текущего дня
          const lastCompletedDay = userDoc.data().lastCompletedDay || 0;
          setCurrentDay(lastCompletedDay + 1);
        }
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [navigation]);

  // Проверка, выполнен ли день
  const isDayCompleted = (day) => {
    return completedDays.includes(day);
  };

  // Обработка выбора дня
  const handleDaySelect = (day) => {
    if (day > currentDay) {
      Alert.alert('Недоступно', `Этот день станет доступен после завершения дня ${currentDay - 1}`);
      return;
    }

    const task = dailyTasks.find(t => t.day === day);
    setSelectedDate(task);
    setCurrentScreen('task');
    setIsTaskCompleted(isDayCompleted(day));
  };

  // Обработка выполнения задания
  const handleCompleteTask = async () => {
    if (isDayCompleted(currentDay)) {
      Alert.alert('Уже выполнено', 'Вы уже выполнили задание этого дня');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const task = dailyTasks.find(t => t.day === currentDay);
      const points = task.points;

      // Обновление локального хранилища
      const newCompletedDays = [...completedDays, currentDay];
      await AsyncStorage.setItem(`completedDays_${user.uid}`, JSON.stringify(newCompletedDays));
      setCompletedDays(newCompletedDays);

      // Обновление в Firestore
      const newScore = userProgress.score + points;
      const newCompletedDaysCount = userProgress.completedDays + 1;
      const newLevel = Math.floor(newScore / 200) + 1;

      // Проверка достижений
      let achievements = [...userProgress.achievements];
      if (newCompletedDaysCount >= 7 && !achievements.includes('7_days_growth')) {
        achievements.push('7_days_growth');
        Alert.alert('🎉 Достижение разблокировано!', 'Вы завершили 7-дневный челлендж! Получено достижение "Мастер роста".');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        score: newScore,
        completedDays: newCompletedDaysCount,
        level: newLevel,
        lastCompletedDay: currentDay,
        achievements: achievements,
        lastPlayed: serverTimestamp()
      });

      // Обновление локального состояния
      setUserProgress({
        ...userProgress,
        score: newScore,
        completedDays: newCompletedDaysCount,
        level: newLevel,
        achievements: achievements
      });

      setIsTaskCompleted(true);
      setCurrentScreen('completed');

      // Автоматический переход к следующему дню через 3 секунды
      setTimeout(() => {
        if (currentDay < 7) {
          setCurrentDay(currentDay + 1);
        }
        setCurrentScreen('calendar');
      }, 3000);
    } catch (error) {
      console.error('Ошибка обновления прогресса:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить прогресс. Попробуйте ещё раз.');
    }
  };

  // Возврат к календарю
  const handleBackToCalendar = () => {
    setCurrentScreen('calendar');
    setSelectedDate(null);
    setIsTaskCompleted(false);
  };

  // Отображение календаря
  const renderCalendar = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← В главную</Text>
        </TouchableOpacity>
        <Text style={styles.title}>7 дней роста</Text>
        <Text style={styles.subtitle}>Ежедневные микро-задания для развития управленческих привычек</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Ваш прогресс</Text>
          <Text style={styles.level}>{userProgress.level}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(completedDays.length / 7) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{completedDays.length} / 7 дней завершено</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.calendarContainer}>
        <View style={styles.weekContainer}>
          {dailyTasks.map((task) => (
            <TouchableOpacity 
              key={task.day}
              style={[
                styles.dayCard,
                isDayCompleted(task.day) && styles.dayCardCompleted,
                task.day === currentDay && !isDayCompleted(task.day) && styles.dayCardCurrent
              ]}
              onPress={() => handleDaySelect(task.day)}
              disabled={task.day > currentDay && !isDayCompleted(task.day)}
            >
              <View style={styles.dayHeader}>
                <Text style={[
                  styles.dayNumber,
                  isDayCompleted(task.day) && styles.dayNumberCompleted,
                  task.day === currentDay && !isDayCompleted(task.day) && styles.dayNumberCurrent
                ]}>
                  {task.day}
                </Text>
                {isDayCompleted(task.day) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.dayTitle}>{task.title}</Text>
              {isDayCompleted(task.day) && (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{task.points}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Отображение задания дня
  const renderTaskScreen = () => {
    if (!selectedDate) return null;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToCalendar} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>День {selectedDate.day}</Text>
          <View style={styles.emptySpace} />
        </View>
        
        <ScrollView contentContainerStyle={styles.taskContent}>
          <Text style={styles.taskTitle}>{selectedDate.title}</Text>
          <Text style={styles.taskDescription}>{selectedDate.description}</Text>
          
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Советы:</Text>
            <Text style={styles.tipsText}>{selectedDate.tips}</Text>
          </View>
          
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Награда:</Text>
            <Text style={styles.pointsValue}>+{selectedDate.points} очков</Text>
          </View>
          
          {!isTaskCompleted && (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleCompleteTask}
              >
                <Text style={styles.completeButtonText}>Отметить выполнение</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isTaskCompleted && (
            <View style={styles.completedMessage}>
              <Text style={styles.completedTitle}>✅ Задание выполнено!</Text>
              <Text style={styles.completedText}>Вы получили +{selectedDate.points} очков</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Отображение экрана завершения
  const renderCompletedScreen = () => (
    <View style={styles.container}>
      <View style={styles.centeredContent}>
        <View style={styles.congratsBadge}>
          <Text style={styles.congratsText}>🎉</Text>
        </View>
        
        <Text style={styles.completedTitle}>Отлично!</Text>
        <Text style={styles.completedSubtitle}>Задание дня выполнено</Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardText}>+{dailyTasks[currentDay - 1]?.points || 0} очков</Text>
        </View>
        
        <View style={styles.progressBarContainerLarge}>
          <View style={[styles.progressBar, { width: `${(completedDays.length / 7) * 100}%` }]} />
        </View>
        
        <Text style={styles.progressTextLarge}>
          {completedDays.length + 1} из 7 дней завершено
        </Text>
      </View>
    </View>
  );

  // Основной рендер
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Загрузка челленджа...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'calendar' && renderCalendar()}
      {currentScreen === 'task' && renderTaskScreen()}
      {currentScreen === 'completed' && renderCompletedScreen()}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptySpace: {
    width: 24,
  },
  progressContainer: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  level: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarContainerLarge: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
    width: '80%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  progressTextLarge: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  calendarContainer: {
    paddingBottom: 20,
  },
  weekContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  dayCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  dayCardCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  dayNumberCompleted: {
    color: '#10B981',
  },
  dayNumberCurrent: {
    color: '#2563EB',
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
  },
  taskContent: {
    paddingBottom: 20,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  taskDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 20,
  },
  tipsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  pointsInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  pointsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonContainer: {
    marginTop: 20,
  },
  completeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedMessage: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#475569',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  congratsBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 48,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  rewardContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
});

export default SevenDaysScreen;