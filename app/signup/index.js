// app/signup/index.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { baseStyles, colors } from '../styles/authStyles';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSignup = () => {
    // Add your signup logic here
    console.log('Signup attempted with:', { email, password, agreed });
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={baseStyles.header}>
        <Text style={baseStyles.title}>Welcome to Sher.</Text>
        <Text style={baseStyles.subtitle}>Create an account</Text>
      </View>

      <View style={baseStyles.form}>
        <View style={baseStyles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.gray}
            style={baseStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={baseStyles.inputContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.gray}
            style={baseStyles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={baseStyles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={colors.gray}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
          >
            {agreed && (
              <Ionicons name="checkmark" size={16} color={colors.accent} />
            )}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree with{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.signupButton}
          onPress={handleSignup}
        >
          <Text style={styles.signupButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={baseStyles.dividerContainer}>
          <Text style={baseStyles.dividerText}>OR SIGN UP WITH</Text>
        </View>

        <View style={baseStyles.socialContainer}>
          <TouchableOpacity style={baseStyles.socialButton}>
            <Ionicons name="logo-google" size={24} color={colors.google} />
          </TouchableOpacity>
          <TouchableOpacity style={baseStyles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color={colors.facebook} />
          </TouchableOpacity>
          <TouchableOpacity style={baseStyles.socialButton}>
            <Ionicons name="logo-apple" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Login Section */}
        <View style={styles.loginContainer}>
          <Text style={styles.accountText}>Already have an account?</Text>
          <Animated.View style={{ transform: [{ scale: animatedValue }], width: '100%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed
              ]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => router.push('/login')}
              android_ripple={{ color: colors.gray }}
            >
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    color: colors.white,
    fontSize: 14,
  },
  termsLink: {
    color: colors.accent,
  },
  signupButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Enhanced Login Section Styles
  loginContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 15,
  },
  accountText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    width: '100%',
  },
  loginButtonPressed: {
    backgroundColor: colors.gray,
    borderColor: colors.white,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});