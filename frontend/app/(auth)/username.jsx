import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { baseStyles, colors } from '../styles/authStyles';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import api from '../api/api';

export default function CreateUsernameScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  const handleUsernameSubmit = async () => {
    // Validate username
    if (!username || username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Check for spaces and special characters
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First check if username exists
      try {
        await api.getUser(username);
        // If we get here, the username exists
        setError('Username already taken');
        setLoading(false);
        return;
      } catch (err) {
        // If we get an error, the username probably doesn't exist (404)
        // We can proceed with user creation
        if (err.response && err.response.status !== 404) {
          // If it's not a 404 error, there's another problem
          setError('An error occurred. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Username is available, create user in your database
      const email = user?.emailAddresses[0].emailAddress;
     
      if (!email) {
        setError('Unable to get your email. Please try again.');
        setLoading(false);
        return;
      }
     
      // Generate a secure random password (this is just a placeholder in your DB)
      // You don't need to send or store the actual password since Clerk handles auth
      const randomPassword = Math.random().toString(36).slice(-10) + 
                             Math.random().toString(36).slice(-10) +
                             '!Aa1';
     
      // Prepare user data according to your schema
      const userData = {
        username: username,
        email: email,
        password_hash: randomPassword // This will be hashed on the server
      };

      // Add user to your database
      const result = await api.addUser(userData);
     
      // User created successfully
      setLoading(false);
      
      // Navigate to home or next screen
      router.push('/wallet');
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.error || 'An error occurred while creating your account');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <View style={baseStyles.header}>
        <Image
          source={require('../../assets/lion.png')}
          style={{ position: 'absolute', right: 0, width: 40, height: 40 }}
        />
      </View>
     
      <Text style={baseStyles.title}>Create your @username</Text>
      <Text style={styles.subtitle}>This will be your unique identifier on Sher</Text>
     
      <View style={baseStyles.form}>
        <View style={baseStyles.inputContainer}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={[baseStyles.input, styles.usernameInput]}
            placeholder="username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
          />
        </View>
       
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <Text style={styles.hint}>
          You can use letters, numbers, and underscores. Minimum 3 characters.
        </Text>
       
        <View style={{ flex: 1 }} />
       
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleUsernameSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={styles.createButtonText}>CREATE</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    color: colors.gray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  atSymbol: {
    color: colors.accent,
    fontSize: 18,
    marginRight: 5,
    paddingLeft: 12,
  },
  usernameInput: {
    flex: 1,
    paddingLeft: 0,
  },
  hint: {
    color: colors.gray,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
    width: '100%',
  },
  createButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
});