// app/screens/CaseDetailScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addScore, loadProgress } from '../lib/GameProgress';

const CaseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { caseId, title, description, options } = route.params || {};
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({ level: 1, score: 0 });

  // Загрузка прогресса при монтировании
  useEffect(() => {
    loadProgress().then(setUserProgress);
  }, []);

  // Обработка выбора ответа
  const handleOptionSelect = async (option) => {
    if (selectedOption) return; // Предотвращаем повторный выбор
    
    setSelectedOption(option);
    setIsLoading(true);

    try {
      // Загрузка текущего прогресса
      const currentProgress = await loadProgress();
      
      // Проверка, проходил ли пользователь этот кейс ранее
      const isCaseCompleted = currentProgress.completedCaseIds?.includes(caseId);
      
      if (isCaseCompleted) {
        Alert.alert('Уже пройдено', 'Вы уже проходили этот кейс ранее.');
        // Показываем фидбек без начисления очков
        showFeedback(option);
        setIsLoading(false);
        return;
      }

      // Начисление очков
      const points = option.isCorrect ? 15 : 5;
      
      // Обновление прогресса
      const updatedProgress = await addScore(points, {
        completedCases: (currentProgress.completedCases || 0) + 1,
        completedCaseIds: [...(currentProgress.completedCaseIds || []), caseId],
      });
      console.log('Начисление очков:', points);
      console.log('Текущий прогресс:', currentProgress);

      if (updatedProgress) {
        setUserProgress(updatedProgress);
        
        // Показываем фидбек
        showFeedback(option, points);
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить прогресс.');
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить результат. Попробуйте ещё раз.');
      setSelectedOption(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Показ фидбека
  const showFeedback = (option, points = 0) => {
    const feedbackMessage = option.isCorrect 
      ? 'Отлично! Ваш выбор демонстрирует зрелый управленческий подход. Вы учитываете интересы всех сторон и ищете конструктивное решение.'
      : 'Подумайте ещё раз. Этот подход может решить сиюминутную проблему, но не устраняет её корневую причину.';
    
    Alert.alert(
      option.isCorrect ? '✅ Правильно!' : '⚠️ Почти!',
      `${feedbackMessage}\n\nВы получили +${points} очков!`,
      [
        {
          text: 'Продолжить',
          onPress: () => {
            // Возвращаемся к списку кейсов
            navigation.goBack();
          },
        },
      ]
    );
  };

  // Возврат к списку кейсов
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
        <Text style={styles.headerTitle}>Кейс-битва</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Заголовок кейса */}
        <View style={styles.caseHeader}>
          <Text style={styles.caseTitle}>{title}</Text>
        </View>

        {/* Описание ситуации */}
        <View style={styles.caseDescriptionContainer}>
          <Text style={styles.caseDescription}>{description}</Text>
        </View>

        {/* Варианты ответов */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Выберите ваше решение:</Text>
          
          {options?.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption?.id === option.id && styles.optionCardSelected,
                selectedOption && selectedOption.id !== option.id && styles.optionCardDisabled
              ]}
              onPress={() => !selectedOption && handleOptionSelect(option)}
              disabled={selectedOption !== null || isLoading}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{option.text}</Text>
                
                {selectedOption?.id === option.id && (
                  <View style={styles.optionResult}>
                    <Text style={[
                      styles.optionResultText,
                      option.isCorrect ? styles.correctText : styles.incorrectText
                    ]}>
                      {option.isCorrect ? '✓ Правильно' : '✗ Нужно улучшить'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Информация о прогрессе */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressInfoTitle}>Ваш прогресс:</Text>
          <Text style={styles.progressInfoText}>
            Уровень: {userProgress.level} | Очки: {userProgress.score}
          </Text>
        </View>

        {/* Подсказка */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Совет:</Text>
          <Text style={styles.tipText}>
            Думайте не только о краткосрочном результате, но и о долгосрочных последствиях вашего решения для команды и бизнеса.
          </Text>
        </View>
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
  caseHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  caseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 32,
  },
  caseDescriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  caseDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'column',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  optionResult: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
  },
  optionResultText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  correctText: {
    color: '#10B981',
  },
  incorrectText: {
    color: '#EF4444',
  },
  progressInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  progressInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  progressInfoText: {
    fontSize: 14,
    color: '#475569',
  },
  tipContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default CaseDetailScreen;