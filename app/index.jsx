import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { Redirect } from 'expo-router';
import { useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Montserrat-ExtraBold': require('../assets/fonts/Montserrat-ExtraBold.ttf'),
          'Montserrat-Italic': require('../assets/fonts/Montserrat-Italic.ttf'),
          'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
          'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
          // Add other fonts here if needed
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />

  return <Redirect href="/(auth)/welcome" />;
}
