import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { baseStyles, colors } from '../styles/authStyles';

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add your login logic here
    console.log('Login attempted with:', { email, password });
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={baseStyles.header}>
        <Text style={baseStyles.title}>Welcome back.</Text>
        <Text style={baseStyles.subtitle}>Log in to your account</Text>
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

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>

        <View style={baseStyles.dividerContainer}>
          <Text style={baseStyles.dividerText}>OR LOG IN WITH</Text>
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

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/sign-up')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: colors.white,
    fontSize: 14,
  },
  signupLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
});