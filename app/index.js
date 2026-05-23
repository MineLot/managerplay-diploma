// app/index.js

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Слушатель изменения состояния аутентификации
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      
      if (user) {
        // Пользователь авторизован → переход на главный экран
        router.replace('/(tabs)');
      } else {
        // Пользователь не авторизован → переход на экран авторизации
        router.replace('/auth');
      }
    });

    return unsubscribe;
  }, [router]);

  // Экран загрузки
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Пустой экран (навигация обработает переход)
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});