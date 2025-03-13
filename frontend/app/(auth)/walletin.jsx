import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

// Import utility functions from utils directory
import { encryptPayload } from "../utils/encryptPayload";
import { decryptPayload } from "../utils/decryptPayload";
import { buildUrl } from "../utils/buildUrl";

export default function WalletIn() {
  const [deeplink, setDeepLink] = useState("");
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState();
  const [session, setSession] = useState();
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  
  // Create our app's deep link URLs
  const onConnectRedirectLink = Linking.createURL("onConnect");
  const onDisconnectRedirectLink = Linking.createURL("onDisconnect");
  
  // Handle deep links
  const handleDeepLink = useCallback(({ url }) => {
    console.log("Received deeplink:", url);
    setDeepLink(url);
  }, []);
  
  // Initialize app's deep linking
  useEffect(() => {
    const setupLinking = async () => {
      try {
        // Get the initial URL if the app was opened with one
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log("Initial URL:", initialUrl);
          setDeepLink(initialUrl);
        }
        
        // Add event listener for deep links while the app is running
        const subscription = Linking.addEventListener("url", handleDeepLink);
        
        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error("Error setting up linking:", error);
        setError("Failed to set up deep linking");
      }
    };
    
    setupLinking();
  }, [handleDeepLink]);
  
  // Process incoming deep links
  useEffect(() => {
    const processDeepLink = async () => {
      try {
        if (!deeplink) return;
        console.log("Processing deeplink:", deeplink);
        
        // Always stop the connecting spinner early
        setConnecting(false);
        
        try {
          const url = new URL(deeplink);
          console.log("URL parsed successfully:", url.toString());
          console.log("URL pathname:", url.pathname);
          console.log("URL search params:", JSON.stringify(Object.fromEntries([...url.searchParams])));
          
          const params = url.searchParams;
          
          // Handle error response from Phantom
          if (params.get("errorCode")) {
            const error = Object.fromEntries([...params]);
            const message = error?.errorMessage ?? JSON.stringify(Object.fromEntries([...params]), null, 2);
            Alert.alert("Error", message);
            console.log("Phantom error:", message);
            return;
          }
          
          // Debug: Check exact path matching
          console.log("Checking path. onConnect test result:", /onConnect/.test(url.pathname));
          console.log("Checking path. Exact match result:", url.pathname === "/onConnect" || url.pathname === "onConnect");
          
          // Handle successful connection from Phantom
          // Try multiple path patterns to handle different URL formats
          if (url.pathname.includes("onConnect")) {
            console.log("Processing connection response - path matched");
            const phantom_encryption_public_key = params.get("phantom_encryption_public_key");
            const data = params.get("data");
            const nonce = params.get("nonce");
            
            console.log("Phantom encryption public key:", phantom_encryption_public_key);
            console.log("Data present:", !!data);
            console.log("Nonce present:", !!nonce);
            
            if (!phantom_encryption_public_key || !data || !nonce) {
              console.error("Missing required parameters from Phantom");
              setError("Missing required parameters from Phantom");
              return;
            }
            
            console.log("Creating shared secret");
            const sharedSecretDapp = nacl.box.before(
              bs58.decode(phantom_encryption_public_key),
              dappKeyPair.secretKey
            );
            
            try {
              console.log("Attempting to decrypt payload");
              const connectData = decryptPayload(
                data,
                nonce,
                sharedSecretDapp
              );
              
              console.log("Connection data:", connectData);
              
              if (!connectData || !connectData.public_key) {
                console.error("Invalid connection data:", connectData);
                setError("Invalid connection data received");
                return;
              }
              
              // Store the public key in a way you can access later
              const walletPublicKey = new PublicKey(connectData.public_key);
              const publicKeyString = walletPublicKey.toString();
              
              // Log the public key prominently for easy access
              console.log("------------------------------------");
              console.log("WALLET PUBLIC KEY:", publicKeyString);
              console.log("------------------------------------");
              
              // You can store the public key in AsyncStorage if needed
              // await AsyncStorage.setItem('phantomWalletPublicKey', publicKeyString);
              
              setSharedSecret(sharedSecretDapp);
              setSession(connectData.session);
              setPhantomWalletPublicKey(walletPublicKey);
              
              // Show success message
              Alert.alert("Success", "Wallet connected successfully!");
              console.log("Wallet connected successfully!");
            } catch (decryptError) {
              console.error("Decryption error:", decryptError);
              console.error("Decryption error details:", JSON.stringify(decryptError));
              setError("Failed to decrypt connection data: " + decryptError.message);
            }
          } else {
            console.log("Path did not match onConnect pattern");
          }
          
          // Handle disconnect from Phantom
          if (/onDisconnect/.test(url.pathname)) {
            setPhantomWalletPublicKey(null);
            setSession(null);
            setSharedSecret(null);
            console.log("Disconnected");
            Alert.alert("Disconnected", "Wallet has been disconnected.");
          }
          
        } catch (urlError) {
          console.error("Error parsing URL:", urlError);
          console.error("Error parsing URL details:", JSON.stringify(urlError));
          console.error("Problem URL:", deeplink);
          setError("Failed to parse URL from Phantom");
        }
      } catch (error) {
        console.error("Error processing deeplink:", error);
        console.error("Error details:", JSON.stringify(error));
        setError("Failed to process response from Phantom: " + error.message);
      } finally {
        // Always ensure connecting is false, even in case of errors
        setConnecting(false);
        // Clear the deeplink to avoid processing it again
        setDeepLink("");
      }
    };
    
    processDeepLink();
  }, [deeplink, dappKeyPair.secretKey]);
  
  // Skip the Phantom installation check for now
  const isPhantomInstalled = async () => {
    try {
      // First attempt using canOpenURL
      const canOpenLink = await Linking.canOpenURL("phantom://");
      console.log("Can open phantom URL:", canOpenLink);
      
      // On Android, canOpenURL sometimes fails even if the app is installed
      // On iOS, it's more reliable
      if (Platform.OS === 'android') {
        // For Android, we'll assume Phantom might be installed even if canOpenURL returns false
        console.log("On Android, assuming Phantom might be installed");
        return true;
      }
      
      return canOpenLink;
    } catch (error) {
      console.error("Error checking if Phantom is installed:", error);
      // If there's an error, we'll still try to open Phantom
      return true;
    }
  };
  
  // Force reset connecting state after timeout
  useEffect(() => {
    if (connecting) {
      const timer = setTimeout(() => {
        console.log("Force resetting connecting state after timeout");
        setConnecting(false);
      }, 30000); // 30 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [connecting]);
  
  // Connect to Phantom wallet
  const connect = async () => {
    try {
      setConnecting(true);
      setError("");
      
      // Log deep link format for debugging
      console.log("Our connect redirect link:", onConnectRedirectLink);
      console.log("Our app base URL:", Linking.createURL(""));
      
      // Check if Phantom is installed, but we'll continue anyway
      const phantomInstalled = await isPhantomInstalled();
      console.log("Phantom installed check result:", phantomInstalled);
      
      // Try both formats - direct URL and build URL via helper
      try {
        // Create the deep link URL parameters
        const params = new URLSearchParams({
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          cluster: "devnet",
          app_url: "https://phantom.app", // Using Phantom's own URL for testing
          redirect_link: onConnectRedirectLink,
        });
        
        // First format (buildUrl function)
        const url = buildUrl("connect", params);
        console.log("Opening phantom URL (buildUrl format):", url);
        
        // Before opening, show what keys we're using
        console.log("Our public key for Phantom:", bs58.encode(dappKeyPair.publicKey));
        
        // Open Phantom
        await Linking.openURL(url);
        
        // Alternative format from documentation - uncomment if the first approach doesn't work
        // const alternativeUrl = `https://phantom.app/ul/v1/connect?${params.toString()}`;
        // console.log("Alternative URL format:", alternativeUrl);
        // await Linking.openURL(alternativeUrl);
      } catch (linkingError) {
        console.error("Error opening URL:", linkingError);
        setError("Failed to open Phantom wallet: " + linkingError.message);
      }
    } catch (error) {
      console.error("Connection error:", error);
      console.error("Connection error details:", JSON.stringify(error));
      setError("Failed to connect to Phantom: " + error.message);
      setConnecting(false);
    }
  };
  
  // Disconnect from Phantom wallet
  const disconnect = async () => {
    try {
      if (!sharedSecret || !session) {
        setPhantomWalletPublicKey(null);
        return;
      }
      
      const payload = {
        session,
      };
      
      const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
      
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce),
        redirect_link: onDisconnectRedirectLink,
        payload: bs58.encode(encryptedPayload),
      });
      
      const url = buildUrl("disconnect", params);
      console.log("Opening disconnect URL:", url);
      await Linking.openURL(url);
    } catch (error) {
      console.error("Disconnect error:", error);
      setError("Failed to disconnect: " + error.message);
      // Force disconnect on error
      setPhantomWalletPublicKey(null);
      setSession(null);
      setSharedSecret(null);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Phantom Wallet</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {phantomWalletPublicKey ? (
        <View style={styles.connectedContainer}>
          <View style={styles.walletInfoCard}>
            <Text style={styles.connectedText}>Wallet Connected</Text>
            
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Public Address:</Text>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {phantomWalletPublicKey.toString()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={connect}
          disabled={connecting}
        >
          {connecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.connectButtonText}>Connect Phantom</Text>
          )}
        </TouchableOpacity>
      )}
      
      {/* Debug section */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>
          App Scheme: {Linking.createURL("")}
        </Text>
        <Text style={styles.debugText}>
          Connect Redirect: {onConnectRedirectLink}
        </Text>
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={async () => {
            const installed = await isPhantomInstalled();
            Alert.alert("Phantom Check", `Phantom installed: ${installed}`);
          }}
        >
          <Text style={styles.debugButtonText}>Check Phantom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  errorText: {
    color: "#FF4B55",
    marginBottom: 20,
    textAlign: "center",
  },
  connectButton: {
    backgroundColor: "#4E44CE", // Phantom purple
    borderRadius: 8,
    padding: 15,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  connectedContainer: {
    width: "100%",
    alignItems: "center",
  },
  walletInfoCard: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  connectedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addressContainer: {
    width: "100%",
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 15,
  },
  addressLabel: {
    color: "#AAAAAA",
    fontSize: 12,
    marginBottom: 5,
  },
  addressText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  disconnectButton: {
    backgroundColor: "#FF4B55",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  disconnectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  debugContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 5,
  },
  debugButton: {
    backgroundColor: "#888",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 12,
  }
});