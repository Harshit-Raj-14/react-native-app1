import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';
import { baseStyles, colors } from '../styles/authStyles';
import api from '../api/api';

export default function ConnectWallet() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  
  // Store wallet information once connected
  const [walletInfo, setWalletInfo] = useState(null);
  
  // Check if user already has a wallet
  useEffect(() => {
    const checkWallet = async () => {
      if (!isLoaded || !user) return;
      
      try {
        const userId = await getUserId();
        if (!userId) return;
        
        // Get user's wallets from your API
        const response = await api.getUserWallets(userId);
        
        if (response && response.length > 0) {
          // User already has a wallet
          setWalletInfo(response[0]);
          setWalletAddress(response[0].public_address);
          setWalletConnected(true);
        }
      } catch (err) {
        console.log('No existing wallet found');
        // It's okay if user doesn't have a wallet yet
      }
    };
    
    checkWallet();
  }, [isLoaded, user]);
  
  const getUserId = async () => {
    if (!isLoaded || !user) return null;
    
    try {
      // Get user by email
      const email = user.primaryEmailAddress.emailAddress;
      const response = await api.getUserByEmail(email);
      return response.id;
    } catch (err) {
      console.error('Error getting user ID:', err);
      return null;
    }
  };
  
  const connectPhantomWallet = async () => {
    setConnecting(true);
    setError('');
    
    try {
      // Check if Phantom is installed
      const isPhantomInstalled = await checkPhantomInstallation();
      
      if (!isPhantomInstalled) {
        // Phantom not installed, provide instructions
        Alert.alert(
          "Phantom Wallet Required",
          "You need to install the Phantom wallet app to continue.",
          [
            { 
              text: "Install Phantom", 
              onPress: () => {
                const url = Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/us/app/phantom-solana-wallet/id1598432977'
                  : 'https://play.google.com/store/apps/details?id=app.phantom';
                Linking.openURL(url);
              }
            },
            { 
              text: "Cancel", 
              style: "cancel" 
            }
          ]
        );
        setConnecting(false);
        return;
      }
      
      // Connect to Phantom wallet via deep linking
      const phantomUrl = `phantom://connect?app=Sher&redirect=sher://wallet-callback`;
      const result = await WebBrowser.openAuthSessionAsync(phantomUrl, 'sher://wallet-callback');
      
      if (result.type === 'success') {
        // Parse URL parameters from the redirect URL
        const url = new URL(result.url);
        const params = new URLSearchParams(url.search);
        
        const publicKey = params.get('publicKey');
        
        if (!publicKey) {
          throw new Error('Failed to get wallet public key');
        }
        
        // For demo purposes, we're using the public key twice
        // In a real app, you would use a proper wallet address or private key mechanism
        // IMPORTANT: Never actually store private keys in your database
        const walletData = {
          public_address: publicKey,
          wallet_address: publicKey, // In reality, this would be different
          wallet_type: 'phantom'
        };
        
        setWalletAddress(publicKey);
        setWalletInfo(walletData);
        setWalletConnected(true);
        
        // Save wallet to database
        await saveWalletToDatabase(walletData);
      }
    } catch (err) {
      console.error('Error connecting to Phantom:', err);
      setError('Failed to connect to Phantom wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };
  
  const checkPhantomInstallation = async () => {
    // Check if Phantom app is installed by attempting to open it
    const canOpenPhantom = await Linking.canOpenURL('phantom://');
    return canOpenPhantom;
  };
  
  const saveWalletToDatabase = async (walletData) => {
    try {
      setLoading(true);
      
      const userId = await getUserId();
      if (!userId) {
        throw new Error('Could not determine user ID');
      }
      
      // Add user_id to wallet data
      const walletWithUserId = {
        ...walletData,
        user_id: userId
      };
      
      // Save wallet to database
      await api.addWallet(walletWithUserId);
      
      // Navigate to home or next screen
      router.push('/(tabs)');
    } catch (err) {
      console.error('Error saving wallet:', err);
      setError('Failed to save wallet information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const copyAddressToClipboard = async () => {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };
  
  const onContinue = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <View style={baseStyles.header}>
        <Image
          source={require('../../assets/lion.png')}
          style={{ position: 'absolute', right: 0, width: 40, height: 40 }}
        />
      </View>
      
      <Text style={baseStyles.title}>Connect Your Wallet</Text>
      <Text style={styles.subtitle}>
        Link your Phantom wallet to secure your account and transactions
      </Text>
      
      <View style={[baseStyles.form, { justifyContent: 'center' }]}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {walletConnected ? (
          <View style={styles.walletConnectedContainer}>
            <View style={styles.walletInfoCard}>
              <Image
                source={require('../../assets/phantom-icon.png')}
                style={styles.walletLogo}
              />
              <Text style={styles.connectedText}>Phantom Wallet Connected</Text>
              
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Public Address</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {walletAddress}
                </Text>
                <TouchableOpacity onPress={copyAddressToClipboard} style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={styles.continueButtonText}>CONTINUE</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.connectContainer}>
            <Image
              source={require('../../assets/phantom-logo.png')}
              style={styles.phantomLogo}
              resizeMode="contain"
            />
            
            <Text style={styles.walletDescription}>
              Phantom is a digital wallet used to store, send, and receive crypto assets on the Solana blockchain.
            </Text>
            
            <TouchableOpacity
              style={styles.connectButton}
              onPress={connectPhantomWallet}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Image
                    source={require('../../assets/phantom-icon.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.connectButtonText}>Connect Phantom</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.push('../(root)/(tabs)/home')}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.gray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  connectContainer: {
    alignItems: 'center',
    width: '100%',
  },
  phantomLogo: {
    width: 200,
    height: 60,
    marginBottom: 20,
  },
  walletDescription: {
    color: colors.gray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  connectButton: {
    backgroundColor: '#4E44CE', // Phantom purple
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    height: 56,
    width: '100%',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipButtonText: {
    color: colors.accent,
    fontSize: 16,
  },
  walletConnectedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  walletInfoCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  walletLogo: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  connectedText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressContainer: {
    width: '100%',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
  },
  addressLabel: {
    color: colors.gray,
    fontSize: 12,
    marginBottom: 5,
  },
  addressText: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    padding: 5,
    alignSelf: 'flex-end',
  },
  copyButtonText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  continueButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
});