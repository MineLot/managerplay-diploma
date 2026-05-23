// app/screens/DayResultScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const DayResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const {
    accuracy = 0,
    quadrantDistribution = {},
    recommendations = [],
    points = 0
  } = route.params || {};

  const handleRestart = () => {
    // Возврат к распределению задач
    navigation.navigate('DayManager');
  };

  const handleBackToHome = () => {
    // Возврат на главный экран
    navigation.navigate('Главная');
  };

  // Определение сообщения на основе точности
  const getAccuracyMessage = () => {
    if (accuracy >= 80) {
      return {
        title: 'Отлично!',
        subtitle: 'Вы отлично распределили приоритеты',
        color: '#10B981'
      };
    } else if (accuracy >= 60) {
      return {
        title: 'Хорошо!',
        subtitle: 'Вы правильно распределили большинство задач',
        color: '#F59E0B'
      };
    } else {
      return {
        title: 'Можно улучшить',
        subtitle: 'Попробуйте ещё раз распределить задачи',
        color: '#EF4444'
      };
    }
  };

  const accuracyMessage = getAccuracyMessage();

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>← На главную</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Результат анализа</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Карточка результата */}
        <View style={[styles.resultCard, { borderColor: accuracyMessage.color }]}>
          <Text style={styles.resultTitle}>{accuracyMessage.title}</Text>
          <Text style={styles.resultSubtitle}>{accuracyMessage.subtitle}</Text>
          
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Точность распределения</Text>
            <Text style={styles.accuracyText}>{accuracy}%</Text>
            
            <View style={styles.accuracyBarContainer}>
              <View 
                style={[
                  styles.accuracyBar, 
                  { width: `${accuracy}%`, backgroundColor: accuracyMessage.color }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Начисленные очки */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Начислено очков</Text>
          <Text style={styles.pointsValue}>+{points}</Text>
        </View>

        {/* Распределение по квадрантам */}
        <View style={styles.quadrantsCard}>
          <Text style={styles.quadrantsTitle}>Распределение по квадрантам</Text>
          
          <View style={styles.quadrantRow}>
            <View style={styles.quadrantItem}>
              <View style={[styles.quadrantIcon, styles.quadrantIconRed]} />
              <Text style={styles.quadrantLabel}>Срочно и важно</Text>
              <Text style={styles.quadrantValue}>{quadrantDistribution.importantUrgent || 0}</Text>
            </View>
            <View style={styles.quadrantItem}>
              <View style={[styles.quadrantIcon, styles.quadrantIconYellow]} />
              <Text style={styles.quadrantLabel}>Срочно, но не важно</Text>
              <Text style={styles.quadrantValue}>{quadrantDistribution.notImportantUrgent || 0}</Text>
            </View>
          </View>
          
          <View style={styles.quadrantRow}>
            <View style={styles.quadrantItem}>
              <View style={[styles.quadrantIcon, styles.quadrantIconGreen]} />
              <Text style={styles.quadrantLabel}>Важно, но не срочно</Text>
              <Text style={styles.quadrantValue}>{quadrantDistribution.importantNotUrgent || 0}</Text>
            </View>
            <View style={styles.quadrantItem}>
              <View style={[styles.quadrantIcon, styles.quadrantIconGray]} />
              <Text style={styles.quadrantLabel}>Ни срочно, ни важно</Text>
              <Text style={styles.quadrantValue}>{quadrantDistribution.notImportantNotUrgent || 0}</Text>
            </View>
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>Рекомендации</Text>
          
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Кнопки действий */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>Начать новый день</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleBackToHome}
          >
            <Text style={styles.continueButtonText}>Вернуться на главную</Text>
          </TouchableOpacity>
        </View>

        {/* Статистика дня */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Статистика дня</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Всего задач:</Text>
            <Text style={styles.statValue}>
              {Object.values(quadrantDistribution).reduce((sum, count) => sum + count, 0)}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Правильно распределено:</Text>
            <Text style={styles.statValue}>
              {Math.round(Object.values(quadrantDistribution).reduce((sum, count) => sum + count, 0) * accuracy / 100)}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Среднее время на задачу:</Text>
            <Text style={styles.statValue}>~3 мин</Text>
          </View>
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  accuracyContainer: {
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 16,
  },
  accuracyBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
  },
  accuracyBar: {
    height: '100%',
    borderRadius: 6,
  },
  pointsCard: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quadrantsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quadrantsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  quadrantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quadrantItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  quadrantIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  quadrantIconRed: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  quadrantIconYellow: {
    backgroundColor: '#FFF7ED',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  quadrantIconGreen: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  quadrantIconGray: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#94A3B8',
  },
  quadrantLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  quadrantValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
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
  buttonsContainer: {
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
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
    fontSize: 15,
    color: '#64748B',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});

export default DayResultScreen;