// app/(tabs)/index.jsx

import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(3000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsSplashComplete(true);
    });
  }, []);

  if (isSplashComplete) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('../../assets/lion.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.text}>Sher</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023430',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: '#FFA500',
  },
  text: {
    color: '#FFA500',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});