import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, Button } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const onSignOutPress = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        {/* <Button title="Username" onPress={() => router.push('../../(auth)/username')} /> */}
        <Button title="Wallet" onPress={() => router.push('../../(auth)/wallet')} />
        <Button title="Sign out" onPress={onSignOutPress} />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </View>
  );
}
