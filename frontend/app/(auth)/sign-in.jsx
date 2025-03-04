import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { baseStyles, colors } from '../styles/authStyles';

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
      
      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('../(root)/(tabs)/home');
      } else {
        // Handle additional verification steps if needed
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError('Additional verification required. Please check your email.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={baseStyles.header}>
        <Text style={baseStyles.title}>Welcome back.</Text>
        <Text style={baseStyles.subtitle}>Log in to your account</Text>
      </View>

      <View style={baseStyles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={baseStyles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.gray}
            style={baseStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={setEmailAddress}
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

        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, isSubmitting && styles.disabledButton]} 
          onPress={onSignInPress}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.loginButtonText}>LOG IN</Text>
          )}
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
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
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
    justifyContent: 'center',
    marginBottom: 30,
    height: 50,
  },
  disabledButton: {
    opacity: 0.7,
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
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
});