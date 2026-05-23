// app/screens/FeedbackScreen.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const {
    caseId,
    title,
    isCorrect,
    selectedOption,
    feedback,
    points
  } = route.params || {};

  const handleContinue = () => {
    // Возврат к списку кейсов
    navigation.navigate('CaseBattleList');
  };

  const handleNextCase = () => {
    // Логика перехода к следующему кейсу (можно реализовать позже)
    navigation.navigate('CaseBattleList');
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleContinue} style={styles.backButton}>
          <Text style={styles.backButtonText}>← К списку</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Результат</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Карточка результата */}
        <View style={[styles.resultCard, isCorrect ? styles.correctCard : styles.incorrectCard]}>
          <View style={styles.resultIconContainer}>
            <Text style={[styles.resultIcon, isCorrect ? styles.correctIcon : styles.incorrectIcon]}>
              {isCorrect ? '✓' : '✗'}
            </Text>
          </View>
          
          <Text style={[styles.resultTitle, isCorrect ? styles.correctTitle : styles.incorrectTitle]}>
            {isCorrect ? 'Отлично!' : 'Подумайте ещё'}
          </Text>
          
          <Text style={styles.resultSubtitle}>
            {isCorrect ? 'Вы приняли правильное решение' : 'Этот вариант можно улучшить'}
          </Text>
        </View>

        {/* Начисленные очки */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Начислено очков</Text>
          <Text style={styles.pointsValue}>+{points}</Text>
        </View>

        {/* Выбранный вариант */}
        <View style={styles.selectedOptionCard}>
          <Text style={styles.selectedOptionTitle}>Ваш выбор:</Text>
          <Text style={styles.selectedOptionText}>{selectedOption}</Text>
        </View>

        {/* Обратная связь */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Обратная связь:</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        {/* Кнопка продолжения */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Продолжить</Text>
          </TouchableOpacity>
        </View>

        {/* Совет дня */}
        {isCorrect && (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Совет дня:</Text>
            <Text style={styles.tipText}>
              Продолжайте развивать навык принятия решений. Регулярная практика помогает формировать управленческое мышление.
            </Text>
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  correctCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  incorrectCard: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  correctIcon: {
    fontSize: 48,
    color: '#10B981',
    backgroundColor: '#F0FDF4',
    width: 80,
    height: 80,
    borderRadius: 40,
    lineHeight: 80,
    textAlign: 'center',
  },
  incorrectIcon: {
    fontSize: 48,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    width: 80,
    height: 80,
    borderRadius: 40,
    lineHeight: 80,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  correctTitle: {
    color: '#10B981',
  },
  incorrectTitle: {
    color: '#EF4444',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
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
  selectedOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  selectedOptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  feedbackCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
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

export default FeedbackScreen;