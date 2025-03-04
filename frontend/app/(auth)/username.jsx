import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { baseStyles, colors, signupStyles } from '../styles/authStyles';
import { useUser } from '@clerk/clerk-expo';
import api from '../api/api';

const CreateUsernameScreen = ({ navigation, route }) => {
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

      // Username is available, create user
      const email = user?.emailAddresses[0].emailAddress;
      
      if (!email) {
        setError('Unable to get your email. Please try again.');
        setLoading(false);
        return;
      }
      
      const userData = {
        username,
        email
      };

      const result = await api.addUser(userData);
      
      // User created successfully
      setLoading(false);
      navigation.navigate('Home');
    } catch (err) {
      console.error('Error creating user:', err);
      setError('An error occurred while creating your account');
      setLoading(false);
    }
  };

  return (
    <View style={baseStyles.container}>
      <View style={baseStyles.header}>
        {/* <TouchableOpacity 
          style={{ padding: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../assets/back-arrow.png')} 
            style={{ width: 24, height: 24, tintColor: colors.white }}
          />
        </TouchableOpacity> */}
        <Image 
          source={require('../../assets/lion.png')} 
          style={{ position: 'absolute', right: 0, width: 40, height: 40 }}
        />
      </View>
      
      <Text style={baseStyles.title}>Create your @username</Text>
      
      <View style={baseStyles.form}>
        <View style={baseStyles.inputContainer}>
          <TextInput
            style={baseStyles.input}
            placeholder="@username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
        
        <View style={{ flex: 1 }} />
        
        <TouchableOpacity 
          style={signupStyles.signupButton}
          onPress={handleUsernameSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <Text style={signupStyles.signupButtonText}>CREATE</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateUsernameScreen;