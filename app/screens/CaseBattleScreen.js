// app/screens/CaseBattleScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const CaseBattleScreen = () => {
  const [currentScreen, setCurrentScreen] = useState('list'); // 'list', 'case', 'feedback'
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    score: 0,
    completedCases: 0,
    achievements: []
  });
  const navigation = useNavigation();

  // Кейсы для игры
  const cases = [
    {
      id: 'case1',
      title: 'Конфликт в команде',
      description: 'В вашей команде возник конфликт между опытным сотрудником, который сопротивляется изменениям, и молодым, инициативным, но грубоватым сотрудником. Как вы поступите?',
      options: [
        { id: 'opt1', text: 'Проведу отдельные встречи с каждым сотрудником, чтобы понять их позицию', isCorrect: true },
        { id: 'opt2', text: 'Соберу команду на совещание и потребую, чтобы все соблюдали дисциплину', isCorrect: false },
        { id: 'opt3', text: 'Переведу опытного сотрудника в другой отдел, чтобы избежать конфликта', isCorrect: false },
        { id: 'opt4', text: 'Предложу сотрудникам решить конфликт самостоятельно', isCorrect: false }
      ],
      feedback: {
        correct: 'Отлично! Отдельные встречи позволяют понять мотивы и найти решение, учитывающее интересы обеих сторон. Это проявление эмпатии и умение слушать.',
        incorrect: 'Этот подход может усугубить конфликт. Строгий контроль не решает причину конфликта, а перевод сотрудника может привести к потере ценного опыта. Лучше работать с корневыми причинами.'
      }
    },
    {
      id: 'case2',
      title: 'Делегирование задач',
      description: 'Вы должны делегировать важную задачу, но ваш подчинённый уже перегружен. Как вы поступите?',
      options: [
        { id: 'opt1', text: 'Перенесу часть задач с других сотрудников, чтобы освободить время для этого сотрудника', isCorrect: true },
        { id: 'opt2', text: 'Дам задачу, но укажу, что приоритетность ниже, чем у текущих задач', isCorrect: false },
        { id: 'opt3', text: 'Сам выполню задачу, чтобы не перегружать сотрудника', isCorrect: false },
        { id: 'opt4', text: 'Отменю задачу, так как сотрудник слишком занят', isCorrect: false }
      ],
      feedback: {
        correct: 'Правильно! Перераспределение задач показывает, что вы цените баланс нагрузки и умеете управлять приоритетами. Это проявление стратегического мышления.',
        incorrect: 'Этот подход может привести к неравномерной загрузке команды. Делегирование требует планирования и перераспределения ресурсов, а не просто откладывания задач.'
      }
    },
    {
      id: 'case3',
      title: 'Обратная связь',
      description: 'Сотрудник подошел к вам и сказал: «Сделал отчёт, но чувствую, что не оценили». Как вы ответите?',
      options: [
        { id: 'opt1', text: 'Молодец, но в следующий раз делай аккуратнее', isCorrect: false },
        { id: 'opt2', text: 'Спасибо! Твой отчёт помог принять решение по проекту', isCorrect: true },
        { id: 'opt3', text: 'Я проверю, но сейчас у меня много дел', isCorrect: false },
        { id: 'opt4', text: 'Посмотрю, когда найду время', isCorrect: false }
      ],
      feedback: {
        correct: 'Отлично! Выражение благодарности и конкретное указание на ценность работы мотивирует сотрудника и укрепляет доверие. Это проявление эмоционального интеллекта.',
        incorrect: 'Этот ответ не дает сотруднику ощущения ценности его работы. Для эффективной обратной связи важно конкретизировать, что именно было сделано хорошо.'
      }
    },
    {
      id: 'case4',
      title: 'Работа с возражениями',
      description: 'Клиент отказался от вашего предложения, сказав: «Цена слишком высока». Как вы поступите?',
      options: [
        { id: 'opt1', text: 'Предложу скидку, чтобы закрыть сделку', isCorrect: false },
        { id: 'opt2', text: 'Объясню, почему цена обоснована, и предложу альтернативные варианты', isCorrect: true },
        { id: 'opt3', text: 'Соглашусь с клиентом и предложу другой продукт', isCorrect: false },
        { id: 'opt4', text: 'Попрошу клиента подумать и вернуться позже', isCorrect: false }
      ],
      feedback: {
        correct: 'Правильно! Обоснование цены и предложение альтернатив показывает, что вы цените клиента и понимаете его потребности. Это проявление переговорной стратегии.',
        incorrect: 'Э подход может привести к потере прибыли и не решает проблемы клиента. Важно понять причины возражений и предложить решение.'
      }
    },
    {
      id: 'case5',
      title: 'Управление приоритетами',
      description: 'У вас 3 срочные задачи, но время ограничено. Как вы распределите приоритеты?',
      options: [
        { id: 'opt1', text: 'Сделаю всё сам, чтобы не пропустить дедлайны', isCorrect: false },
        { id: 'opt2', text: 'Определю, какие задачи можно делегировать, и распределю нагрузку', isCorrect: true },
        { id: 'opt3', text: 'Попрошу команду работать сверхурочно', isCorrect: false },
        { id: 'opt4', text: 'Отложу менее важные задачи, пока не закончу основные', isCorrect: false }
      ],
      feedback: {
        correct: 'Отлично! Распределение задач и делегирование показывает, что вы умеете управлять ресурсами и приоритетами. Это проявление стратегического управления.',
        incorrect: 'Этот подход может привести к выгоранию и снижению качества. Эффективное управление приоритетами включает анализ и распределение задач.'
      }
    }
  ];
  /*
   // Загрузка прогресса
  useEffect(() => {
    loadProgress().then(setUserProgress);

  }, []);
  */
  // Возврат в главную страницу
  const handleBackToHome = () => {
    navigation.navigate('MainTabs');
  };
  
  // /*
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

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProgress({
            level: userDoc.data().level || 1,
            score: userDoc.data().score || 0,
            completedCases: userDoc.data().completedCases || 0,
            achievements: userDoc.data().achievements || []
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [navigation]);

  // Обработка выбора кейса
  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
    setCurrentScreen('case');
  };

  // Обработка выбора варианта ответа
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCurrentScreen('feedback');
    
    // Обновление прогресса в
    const updateProgress = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const points = option.isCorrect ? 15 : 5;
        const newScore = userProgress.score + points;
        const newCompletedCases = userProgress.completedCases + 1;
        
        // Расчет нового уровня
        const newLevel = Math.floor(newScore / 200) + 1;
        
        // Обновление в Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          score: newScore,
          completedCases: newCompletedCases,
          level: newLevel,
          lastPlayed: serverTimestamp()
        });
        
        // Обновление локального состояния
        setUserProgress({
          ...userProgress,
          score: newScore,
          completedCases: newCompletedCases,
          level: newLevel
        });
      } catch (error) {
        console.error('Ошибка обновления прогресса:', error);
      }
    };

    updateProgress();
  }; 
  // */
  // Обработка завершения кейса
  const handleFinishCase = () => {
    setCurrentScreen('list');
    setSelectedCase(null);
    setSelectedOption(null);
  };

  // Возвращение к списку кейсов
  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedCase(null);
    setSelectedOption(null);
  };

  // Обработка нажатия на "Продолжить"
  const handleContinue = () => {
    if (currentScreen === 'feedback') {
      handleFinishCase();
    } else {
      handleBackToList();
    }
  };

  // Отображение экрана списка кейсов
  const renderCaseList = () => (
    
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>← В главную</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Кейс-битва</Text>
        <Text style={styles.subtitle}>Выберите ситуацию для анализа</Text>
        <View style={styles.emptySpace} />
      </View>
      
  
      
      <ScrollView contentContainerStyle={styles.casesList}>
        {cases.map((caseItem) => (
          <TouchableOpacity 
            key={caseItem.id} 
            style={styles.caseCard}
            onPress={() => handleCaseSelect(caseItem)}
          >
            <Text style={styles.caseTitle}>{caseItem.title}</Text>
            <Text style={styles.caseDescription} numberOfLines={2}>
              {caseItem.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Отображение экрана кейса
  const renderCaseScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Кейс-битва</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <View style={styles.caseContent}>
        <Text style={styles.caseTitle}>{selectedCase.title}</Text>
        <Text style={styles.caseDescription}>{selectedCase.description}</Text>
        
        <View style={styles.optionsContainer}>
          {selectedCase.options.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.optionCard}
              onPress={() => handleOptionSelect(option)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Отображение экрана фидбека
  const renderFeedbackScreen = () => (

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Кейс-бит</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <View style={styles.feedbackContent}>
        <View style={[styles.feedbackCard, selectedOption.isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
          <Text style={styles.feedbackTitle}>
            {selectedOption.isCorrect ? 'Отлично!' : 'Подумайте ещё'}
          </Text>
          <Text style={styles.feedbackText}>
            {selectedOption.isCorrect ? selectedCase.feedback.correct : selectedCase.feedback.incorrect}
          </Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>
            {selectedOption.isCorrect ? '+15' : '+5'} очков
          </Text>
        </View>
        
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continue}>
              {currentScreen === 'feedback' ? 'Продолжить' : 'Назад к кейсам'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Основной рендер
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Загрузка кейсов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen  === 'list' && renderCaseList()}
      {currentScreen === 'case' && renderCaseScreen()}
      {currentScreen === 'feedback' && renderFeedbackScreen()}
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
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
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
    backgroundColor:'#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  casesList: {
    paddingBottom: 20,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  caseDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  caseContent: {
    flex: 1,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  feedbackContent: {
    flex: 1,
    justifyContent: 'center',
  },
  feedbackCard: {
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
  correctFeedback: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  incorrectFeedback: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E293B',
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  continueButtonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 300,
  },
  continueButtonText: {
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

export default CaseBattleScreen;