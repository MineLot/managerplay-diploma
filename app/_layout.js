// app/_layout.js

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

// Экраны
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ProgressScreen from './screens/ProgressScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import ProfileScreen from './screens/ProfileScreen';

import CaseBattleScreen from './screens/CaseBattleScreen';
import CaseDetailScreen from './screens/CaseDetailScreen';
import FeedbackScreen from './screens/FeedbackScreen';

import DayManagerScreen from './screens/DayManagerScreen';
import DayResultScreen from './screens/DayResultScreen';

import SevenDaysScreen from './screens/SevenDaysScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ==================== СТЕКИ МИНИ-ИГР ====================
const CaseBattleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CaseBattleList" component={CaseBattleScreen} />
    <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
    <Stack.Screen name="Feedback" component={FeedbackScreen} />
  </Stack.Navigator>
);

const DayManagerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DayManager" component={DayManagerScreen} />
    <Stack.Screen name="DayResult" component={DayResultScreen} />
  </Stack.Navigator>
);

const SevenDaysStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SevenDays" component={SevenDaysScreen} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
  </Stack.Navigator>
);

// ==================== НИЖНЯЯ ПАНЕЛЬ ====================
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        height: 65,
        paddingBottom: 5,
      },
      tabBarLabelStyle: { fontSize: 11, marginBottom: 4, fontWeight: '500' },
      tabBarIconStyle: { marginTop: 4 },
    }}
  >
    <Tab.Screen name="Главная" component={HomeScreen} />
    <Tab.Screen name="Прогресс" component={ProgressScreen} />
    <Tab.Screen name="Достижения" component={AchievementsScreen} />
    <Tab.Screen name="Профиль" component={ProfileScreen} />
  </Tab.Navigator>
);

// ==================== КОРНЕВАЯ НАВИГАЦИЯ ====================
function RootStack() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // ⚠️ ВАЖНО: NavigationContainer УДАЛЁН. Expo Router уже предоставляет его.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
      <Stack.Screen name="CaseBattle" component={CaseBattleStack} />
      <Stack.Screen name="DayManagerGame" component={DayManagerStack} />
      <Stack.Screen name="SevenDaysGame" component={SevenDaysStack} />
    </Stack.Navigator>
  );
}

export default function Layout() {
  return <RootStack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});