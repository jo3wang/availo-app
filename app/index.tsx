import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (__DEV__) {
    console.log('Index: Auth state - loading:', loading, 'user:', user?.email || 'no user');
  }

  // Show nothing while loading to prevent flashing
  if (loading) {
    return null;
  }

  // Use Redirect components - this is the recommended Expo Router pattern
  if (user) {
    if (__DEV__) {
      console.log('Index: User authenticated, redirecting to radar');
    }
    return <Redirect href="/(tabs)/radar" />;
  }

  if (__DEV__) {
    console.log('Index: User not authenticated, redirecting to auth');
  }
  return <Redirect href="/auth" />;
}

