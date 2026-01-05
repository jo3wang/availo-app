import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../FirebaseConfig';
import { colors, gradientColors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/auth');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const stats = [
    { label: 'Spots Visited', value: '24' },
    { label: 'Reviews', value: '12' },
    { label: 'Hours Studied', value: '156' },
  ];

  const menuItems = [
    { title: 'Preferences', icon: 'settings-outline' },
    { title: 'Notifications', icon: 'notifications-outline' },
    { title: 'Privacy', icon: 'shield-outline' },
    { title: 'Help & Support', icon: 'help-circle-outline' },
    { title: 'About Availo', icon: 'information-circle-outline' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Gradient Avatar */}
        <LinearGradient
          colors={gradientColors}
          style={styles.avatar}
        >
          <Ionicons name="person" size={40} color="white" />
        </LinearGradient>

        {/* User Info */}
        <Text style={styles.userName}>
          {user?.email?.split('@')[0] || 'Study Mode'}
        </Text>
        <Text style={styles.userSubtitle}>UCLA Student</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', `${item.title} will be available soon!`)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.textMuted} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <Text style={styles.appInfo}>Availo v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  userSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  signOutContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  appInfo: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    paddingBottom: 32,
  },
});
