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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { baseStyles, colors } from '../styles/authStyles';

export default function Signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  
  // State for UI
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;
  
  // State for Clerk auth
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      
      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      // Set 'pendingVerification' to true to display verification form
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      // If verification was complete, set session active and redirect
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('../(root)/(tabs)/home');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification screen
  if (pendingVerification) {
    return (
      <SafeAreaView style={baseStyles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={baseStyles.header}>
          <Text style={baseStyles.title}>Verify Your Email</Text>
          <Text style={baseStyles.subtitle}>Enter the code sent to {emailAddress}</Text>
        </View>

        <View style={baseStyles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={baseStyles.inputContainer}>
            <TextInput
              placeholder="Verification Code"
              placeholderTextColor={colors.gray}
              style={baseStyles.input}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, isSubmitting && styles.disabledButton]}
            onPress={onVerifyPress}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.signupButtonText}>VERIFY</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resendButton}
            onPress={async () => {
              try {
                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
              } catch (err) {
                setError('Failed to resend code. Please try again.');
              }
            }}
          >
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Sign up screen
  return (
    <SafeAreaView style={baseStyles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={baseStyles.header}>
        <Text style={baseStyles.title}>Welcome to Sher.</Text>
        <Text style={baseStyles.subtitle}>Create an account</Text>
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
          style={[styles.signupButton, isSubmitting && styles.disabledButton]}
          onPress={onSignUpPress}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          )}
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
              onPress={() => router.push('/(auth)/sign-in')}
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
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
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
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  resendButtonText: {
    color: colors.accent,
    fontSize: 14,
  }
});