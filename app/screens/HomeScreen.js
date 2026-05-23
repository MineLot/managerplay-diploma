// app/screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  // Переход к мини-играм
  const navigateToGame = (gameName) => {
    switch (gameName) {
      case 'caseBattle':
        navigation.navigate('CaseBattle');
        break;
      case 'dayManager':
        navigation.navigate('DayManagerGame');
        break;
      case 'sevenDays':
        navigation.navigate('SevenDaysGame');
        break;
      default:
        break;
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' }}
      style={styles.background}
      imageStyle={{ opacity: 0.1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Приветствие */}
        <View style={styles.header}>
          <Text style={styles.title}>ManagerPlay</Text>
          <Text style={styles.subtitle}>Развивайте управленческие навыки через игру</Text>
        </View>

        {/* Заголовок игр */}
        <Text style={styles.gamesTitle}>Мини-игры</Text>

        {/* Игра 1: Кейс-битва */}
        <TouchableOpacity 
          style={[styles.gameCard, styles.gameCard1]} 
          onPress={() => navigateToGame('caseBattle')}
          activeOpacity={0.9}
        >
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>⚔️</Text>
          </View>
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>Кейс-битва</Text>
            <Text style={styles.gameDescription} numberOfLines={2}>
              Анализируйте реальные управленческие ситуации и принимайте решения
            </Text>
          </View>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>+15 очков</Text>
          </View>
        </TouchableOpacity>

        {/* Игра 2: День менеджера */}
        <TouchableOpacity 
          style={[styles.gameCard, styles.gameCard2]} 
          onPress={() => navigateToGame('dayManager')}
          activeOpacity={0.9}
        >
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>⏰</Text>
          </View>
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>День менеджера</Text>
            <Text style={styles.gameDescription} numberOfLines={2}>
              Распределяйте задачи по матрице Эйзенхауэра и улучшайте тайм-менеджмент
            </Text>
          </View>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>до +50 очков</Text>
          </View>
        </TouchableOpacity>

        {/* Игра 3: 7 дней роста */}
        <TouchableOpacity 
          style={[styles.gameCard, styles.gameCard3]} 
          onPress={() => navigateToGame('sevenDays')}
          activeOpacity={0.9}
        >
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>🚀</Text>
          </View>
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>7 дней роста</Text>
            <Text style={styles.gameDescription} numberOfLines={2}>
              Выполняйте ежедневные задания и формируйте полезные привычки менеджера
            </Text>
          </View>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>+10 очков/день</Text>
          </View>
        </TouchableOpacity>

        {/* Совет дня */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Совет дня</Text>
          <Text style={styles.tipText}>
            Лучшие менеджеры тратят 80% времени на важные, но не срочные задачи — это ключ к стратегическому росту.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  levelLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  gamesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gameCard1: {
    borderLeftWidth: 6,
    borderLeftColor: '#2563EB',
  },
  gameCard2: {
    borderLeftWidth: 6,
    borderLeftColor: '#10B981',
  },
  gameCard3: {
    borderLeftWidth: 6,
    borderLeftColor: '#F59E0B',
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 28,
  },
  gameContent: {
    flex: 1,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  gameBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  gameBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#2563EB',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});