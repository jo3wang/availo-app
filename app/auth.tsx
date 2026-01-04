import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../FirebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Add debugging to see if this screen is actually rendering
  if (__DEV__ && !user) {
    console.log('AuthScreen: Component rendered');
  }

  // Navigate away when user is authenticated
  useEffect(() => {
    if (user) {
      if (__DEV__) {
        console.log('AuthScreen: User authenticated, navigating to radar');
      }
      router.replace('/(tabs)/radar');
    }
  }, [user, router]);

  useEffect(() => {
    if (__DEV__) {
      console.log('Auth: Firebase auth instance:', auth);
      console.log('Auth: Current user:', auth.currentUser);
    }
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    if (__DEV__) {
      console.log('Auth: Starting authentication for:', email);
    }
    
    try {
      if (isLogin) {
        if (__DEV__) {
          console.log('Auth: Attempting sign in');
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (__DEV__) {
          console.log('Auth: Sign in successful:', userCredential.user.email);
        }
        // User will be automatically redirected via auth state change
      } else {
        if (__DEV__) {
          console.log('Auth: Attempting sign up');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (__DEV__) {
          console.log('Auth: Sign up successful:', userCredential.user.email);
        }
        Alert.alert('Success', 'Account created successfully!');
        // User will be automatically redirected via auth state change
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      
      if (__DEV__) {
        console.log('Auth: Error occurred:', error.code, error.message);
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>☕ Availo</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Join the community!'}
          </Text>
          <Text style={styles.description}>
            {isLogin 
              ? 'Sign in to discover your perfect study spots' 
              : 'Find and track study spaces & cafes in real-time'
            }
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleAuth} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#3C2415', marginBottom: 12 },
  subtitle: { fontSize: 20, color: '#6b7280', fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 16, color: '#9ca3af', textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  button: { 
    backgroundColor: '#3b82f6', 
    borderRadius: 12, 
    padding: 18, 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchButton: { alignItems: 'center', padding: 16 },
  switchText: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
}); 