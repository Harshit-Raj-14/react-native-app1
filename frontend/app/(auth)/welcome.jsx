import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { baseStyles, colors } from '../styles/authStyles';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Container for positioning */}
      <View style={styles.mainContainer}>
        {/* Header Text - positioned at 1/4 from top */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}> Welcome to Sher.</Text>
        </View>
        
        {/* Button Container - positioned from middle of screen */}
        <View style={styles.buttonContainer}>
          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          </TouchableOpacity>
          
          {/* Log In Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.loginButtonText}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: '25%', // 1/4 from the top
    width: '100%',
    alignItems: 'center', // Center align the container
    justifyContent: 'center', // Add vertical centering
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 38,
    fontFamily: 'Montserrat-Bold', // Using the custom font loaded in index.js
    color: colors.white,
    textAlign: 'center', 
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: '50%', // Start from middle of screen
    left: 20,
    right: 20,
  },
  signupButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 60,
  },
  signupButtonText: {
    color: colors.black,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.button,
    height: 60,
  },
  loginButtonText: {
    color: colors.button,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;