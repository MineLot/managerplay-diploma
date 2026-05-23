// app/screens/DayManagerScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addScore, loadProgress } from '../lib/GameProgress';

const DayManagerScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('tasks'); // 'tasks', 'result'
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    score: 0,
    completedDays: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [quadrants, setQuadrants] = useState({
    importantUrgent: [],
    importantNotUrgent: [],
    notImportantUrgent: [],
    notImportantNotUrgent: []
  });
  const [analysis, setAnalysis] = useState(null);
  const navigation = useNavigation();

  // Список задач для распределения
  const allTasks = [
    {
      id: 'task1',
      title: 'Подготовить отчёт к совещанию',
      description: 'Собрать данные за неделю и оформить презентацию',
      isImportant: true,
      isUrgent: true
    },
    {
      id: 'task2',
      title: 'Провести 1:1 с подчинённым',
      description: 'Обсудить цели и сложности сотрудника',
      isImportant: true,
      isUrgent: false
    },
    {
      id: 'task3',
      title: 'Ответить на 20 писем',
      description: 'Обработать входящую почту',
      isImportant: false,
      isUrgent: true
    },
    {
      id: 'task4',
      title: 'Продумать стратегию на квартал',
      description: 'Разработать план развития отдела',
      isImportant: true,
      isUrgent: false
    },
    {
      id: 'task5',
      title: 'Срочное совещание с топ-менеджментом',
      description: 'Обсудить кризисную ситуацию',
      isImportant: true,
      isUrgent: true
    },
    {
      id: 'task6',
      title: 'Проверить отчёты команды',
      description: 'Убедиться, что все задачи выполнены',
      isImportant: false,
      isUrgent: true
    },
    {
      id: 'task7',
      title: 'Разработать систему мотивации',
      description: 'Создать программу поощрения сотрудников',
      isImportant: true,
      isUrgent: false
    },
    {
      id: 'task8',
      title: 'Обновить документацию',
      description: 'Актуализировать внутренние инструкции',
      isImportant: false,
      isUrgent: false
    }
  ];

  const handleBackToHome = () => {
    navigation.navigate('MainTabs');
  };

  // Загрузка прогресса пользователя
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const progress = await loadProgress();
        setUserProgress(progress);
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
      } finally {
        setIsLoading(false);
        // Инициализация задач
        setTasks(allTasks);
        setQuadrants({
          importantUrgent: [],
          importantNotUrgent: [],
          notImportantUrgent: [],
          notImportantNotUrgent: []
        });
      }
    };

    loadUserData();
  }, []);

  // Обработка перемещения задачи в квадрант
  const handleTaskDrop = (taskId, quadrant) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const updatedTasks = tasks.filter(t => t.id !== taskId);

    // Обновление квадрантов
    const updatedQuadrants = { ...quadrants };
    updatedQuadrants[quadrant].push(task);

    setTasks(updatedTasks);
    setQuadrants(updatedQuadrants);
  };

  // Обработка возврата задачи в список
  const handleTaskReturn = (quadrant, taskIndex) => {
    const task = quadrants[quadrant][taskIndex];
    const updatedTasks = [...tasks, task];

    const updatedQuadrants = { ...quadrants };
    updatedQuadrants[quadrant] = updatedQuadrants[quadrant].filter((_, i) => i !== taskIndex);

    setTasks(updatedTasks);
    setQuadrants(updatedQuadrants);
  };

  // Анализ распределения задач
  const analyzeDistribution = () => {
    const correctPlacements = {
      importantUrgent: 0,
      importantNotUrgent: 0,
      notImportantUrgent: 0,
      notImportantNotUrgent: 0
    };

    // Проверка правильности распределения
    Object.keys(quadrants).forEach(quadrant => {
      quadrants[quadrant].forEach(task => {
        const isCorrect = (
          (quadrant === 'importantUrgent' && task.isImportant && task.isUrgent) ||
          (quadrant === 'importantNotUrgent' && task.isImportant && !task.isUrgent) ||
          (quadrant === 'notImportantUrgent' && !task.isImportant && task.isUrgent) ||
          (quadrant === 'notImportantNotUrgent' && !task.isImportant && !task.isUrgent)
        );

        if (isCorrect) {
          correctPlacements[quadrant]++;
        }
      });
    });

    // Расчёт баланса
    const totalTasks = allTasks.length;
    const correctCount = Object.values(correctPlacements).reduce((sum, count) => sum + count, 0);
    const accuracy = Math.round((correctCount / totalTasks) * 100);

    // Распределение по квадрантам
    const quadrantDistribution = {
      importantUrgent: quadrants.importantUrgent.length,
      importantNotUrgent: quadrants.importantNotUrgent.length,
      notImportantUrgent: quadrants.notImportantUrgent.length,
      notImportantNotUrgent: quadrants.notImportantNotUrgent.length
    };

    // Генерация рекомендаций
    let recommendations = [];
    
    if (quadrantDistribution.importantUrgent > 3) {
      recommendations.push('⚠️ Слишком много срочных и важных задач. Это может привести к выгоранию. Попробуйте делегировать или перераспределить.');
    }
    
    if (quadrantDistribution.importantNotUrgent === 0) {
      recommendations.push('⚠️ Вы не уделяете время стратегическому планированию. Важно работать над долгосрочными целями.');
    }
    
    if (quadrantDistribution.notImportantUrgent > 2) {
      recommendations.push('⚠️ Много срочных, но неважных задач. Возможно, их можно автоматизировать или делегировать.');
    }
    
    if (quadrantDistribution.importantNotUrgent > 0 && quadrantDistribution.importantUrgent <= 3) {
      recommendations.push('✅ Отлично! Вы правильно распределяете приоритеты и уделяете время стратегическому развитию.');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Хороший баланс! Вы правильно распределили приоритеты.');
    }

    return {
      correctPlacements,
      accuracy,
      quadrantDistribution,
      recommendations
    };
  };

  // Обработка завершения распределения
  const handleCompleteDistribution = async () => {
    const result = analyzeDistribution();
    setAnalysis(result);

    try {
      // Начисление очков
      const points = Math.round(result.accuracy * 0.5); // 0-50 очков в зависимости от точности
      
      // Обновление прогресса
      const updatedProgress = await addScore(points, {
        completedDays: (userProgress.completedDays || 0) + 1,
      });

      if (updatedProgress) {
        setUserProgress(updatedProgress);
        
        // Показываем результат
        setCurrentScreen('result');
        
        // Проверка достижения "Тайм-менеджер"
        if (updatedProgress.completedDays >= 3 && !updatedProgress.achievements.includes('time_manager')) {
          Alert.alert(
            '🎉 Достижение разблокировано!',
            'Вы получили достижение "Тайм-менеджер" за завершение 3 дней в игре!',
            [{ text: 'Отлично!' }]
          );
        }
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить прогресс.');
      }
    } catch (error) {
      console.error('Ошибка обновления прогресса:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить прогресс. Попробуйте ещё раз.');
    }
  };

  // Возврат к распределению
  const handleRestart = () => {
    setTasks(allTasks);
    setQuadrants({
      importantUrgent: [],
      importantNotUrgent: [],
      notImportantUrgent: [],
      notImportantNotUrgent: []
    });
    setAnalysis(null);
    setCurrentScreen('tasks');
  };

  // Отображение экрана распределения задач
  const renderTasksScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← В главную</Text>
        </TouchableOpacity>
        <Text style={styles.title}>День менеджера</Text>
        <Text style={styles.subtitle}>Распределите задачи по матрице Эйзенхауэра</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Список задач */}
        <View style={styles.tasksListContainer}>
          <Text style={styles.sectionTitle}>Задачи на сегодня</Text>
          {tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={() => {
                // Показать выбор квадранта
                Alert.alert(
                  'Выберите квадрант',
                  `Куда поместить задачу "${task.title}"?`,
                  [
                    { text: 'Срочно и важно', onPress: () => handleTaskDrop(task.id, 'importantUrgent') },
                    { text: 'Важно, но не срочно', onPress: () => handleTaskDrop(task.id, 'importantNotUrgent') },
                    { text: 'Срочно, но не важно', onPress: () => handleTaskDrop(task.id, 'notImportantUrgent') },
                    { text: 'Ни срочно, ни важно', onPress: () => handleTaskDrop(task.id, 'notImportantNotUrgent') },
                    { text: 'Отмена', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Матрица Эйзенхауэра */}
        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            <View style={[styles.quadrant, styles.quadrantRed]}>
              <Text style={styles.quadrantTitle}>Срочно и важно</Text>
              {quadrants.importantUrgent.map((task, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quadrantTask}
                  onPress={() => handleTaskReturn('importantUrgent', index)}
                >
                  <Text style={styles.quadrantTaskTitle}>{task.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.quadrant, styles.quadrantYellow]}>
              <Text style={styles.quadrantTitle}>Срочно, но не важно</Text>
              {quadrants.notImportantUrgent.map((task, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quadrantTask}
                  onPress={() => handleTaskReturn('notImportantUrgent', index)}
                >
                  <Text style={styles.quadrantTaskTitle}>{task.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.matrixRow}>
            <View style={[styles.quadrant, styles.quadrantGreen]}>
              <Text style={styles.quadrantTitle}>Важно, но не срочно</Text>
              {quadrants.importantNotUrgent.map((task, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quadrantTask}
                  onPress={() => handleTaskReturn('importantNotUrgent', index)}
                >
                  <Text style={styles.quadrantTaskTitle}>{task.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.quadrant, styles.quadrantGray]}>
              <Text style={styles.quadrantTitle}>Ни срочно, ни важно</Text>
              {quadrants.notImportantNotUrgent.map((task, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quadrantTask}
                  onPress={() => handleTaskReturn('notImportantNotUrgent', index)}
                >
                  <Text style={styles.quadrantTaskTitle}>{task.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Кнопка завершения */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.completeButton,
              tasks.length === 0 ? styles.completeButtonEnabled : styles.completeButtonDisabled
            ]}
            onPress={handleCompleteDistribution}
            disabled={tasks.length > 0}
          >
            <Text style={styles.completeButtonText}>
              {tasks.length > 0 ? 'Распределите все задачи' : 'Проанализировать день'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // Отображение экрана результата
  const renderResultScreen = () => {
    if (!analysis) return null;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleRestart} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад к задачам</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Результат анализа</Text>
          <View style={styles.emptySpace} />
        </View>
        
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Точность распределения</Text>
            <Text style={styles.accuracyText}>{analysis.accuracy}%</Text>
            
            <View style={styles.accuracyBarContainer}>
              <View style={[styles.accuracyBar, { width: `${analysis.accuracy}%` }]} />
            </View>
            
            <Text style={styles.resultSubtitle}>
              {analysis.accuracy >= 80 ? 'Отлично!' : analysis.accuracy >= 60 ? 'Хорошо!' : 'Можно улучшить'}
            </Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Распределение по квадрантам</Text>
            
            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionNumber}>{analysis.quadrantDistribution.importantUrgent}</Text>
                <Text style={styles.distributionLabel}>Срочно и важно</Text>
              </View>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionNumber}>{analysis.quadrantDistribution.notImportantUrgent}</Text>
                <Text style={styles.distributionLabel}>Срочно, но не важно</Text>
              </View>
            </View>
            
            <View style={styles.distributionRow}>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionNumber}>{analysis.quadrantDistribution.importantNotUrgent}</Text>
                <Text style={styles.distributionLabel}>Важно, но не срочно</Text>
              </View>
              <View style={styles.distributionItem}>
                <Text style={styles.distributionNumber}>{analysis.quadrantDistribution.notImportantNotUrgent}</Text>
                <Text style={styles.distributionLabel}>Ни срочно, ни важно</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Рекомендации</Text>
            
            {analysis.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.pointsCard}>
            <Text style={styles.pointsLabel}>Награда:</Text>
            <Text style={styles.pointsValue}>
              +{Math.round(analysis.accuracy * 0.5)} очков
            </Text>
          </View>
          
          <View style={styles.restartButtonContainer}>
            <TouchableOpacity 
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <Text style={styles.restartButtonText}>Начать новый день</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Основной рендер
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка задач...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'tasks' && renderTasksScreen()}
      {currentScreen === 'result' && renderResultScreen()}
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
  mainContent: {
    paddingBottom: 20,
  },
  tasksListContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  matrixContainer: {
    marginBottom: 20,
  },
  matrixRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quadrant: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quadrantRed: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  quadrantYellow: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  quadrantGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  quadrantGray: {
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
  },
  quadrantTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  quadrantTask: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quadrantTaskTitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 18,
  },
  actionButtonContainer: {
    marginTop: 20,
  },
  completeButton: {
    backgroundColor: '#94A3B8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonEnabled: {
    backgroundColor: '#2563EB',
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContent: {
    paddingBottom: 20,
  },
  resultCard: {
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  accuracyText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
  },
  accuracyBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accuracyBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  distributionItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  distributionNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  recommendationItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  recommendationText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  pointsCard: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  restartButtonContainer: {
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 300,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default DayManagerScreen;