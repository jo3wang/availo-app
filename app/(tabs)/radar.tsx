import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAvailabilityColor, getAvailabilityText, useStudySpots } from '../../hooks/useStudySpots';

export default function RadarScreen() {
  const { spots, lounges, loading, totalSpots, availableSpots, totalUsers } = useStudySpots();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Add debugging to see if this screen is actually rendering
  if (__DEV__) {
    console.log('RadarScreen: Component rendered');
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Availo...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Availo</Text>
            <Text style={styles.subtitle}>Find your perfect study spot</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/spot-details?spotId=1')}
          >
            <Ionicons name="information-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Live Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{totalSpots}</Text>
              <Text style={styles.statLabel}>Total Spots</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#87A96B' }]}>{availableSpots}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Radar Circle */}
      <View style={styles.radarContainer}>
        <View style={styles.radarCircle}>
          <View style={styles.radarCenter}>
            <Ionicons name="location" size={32} color="#3b82f6" />
            <Text style={styles.youText}>You</Text>
          </View>
          
          {/* Distance rings */}
          <View style={styles.distanceRing1} />
          <View style={styles.distanceRing2} />
          <View style={styles.distanceRing3} />
        </View>
      </View>

      {/* Live Lounges */}
      {lounges.length > 0 && (
        <View style={styles.spotsContainer}>
          <Text style={styles.sectionTitle}>Live Campus Lounges</Text>
          
          {lounges.map((lounge) => (
            <TouchableOpacity 
              key={lounge.id} 
              style={styles.spotCard}
              onPress={() => Alert.alert('Live Data', 'This is real-time campus lounge data. Detailed information coming soon!')}
            >
              <View style={styles.spotHeader}>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName}>{lounge.id}</Text>
                  <Text style={styles.spotDistance}>Real-time data</Text>
                </View>
                <View style={[
                  styles.availabilityBadge,
                  { backgroundColor: getAvailabilityColor(lounge.current_occupancy, lounge.max_capacity || 20) }
                ]}>
                  <Text style={styles.availabilityText}>
                    {getAvailabilityText(lounge.current_occupancy, lounge.max_capacity || 20)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.spotStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Current</Text>
                  <Text style={styles.statValue}>{lounge.current_occupancy}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>WiFi</Text>
                  <Text style={styles.statValue}>{lounge.wifi_devices || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>BLE</Text>
                  <Text style={styles.statValue}>{lounge.ble_devices || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Nearby Spots */}
      <View style={styles.spotsContainer}>
        <Text style={styles.sectionTitle}>Nearby Spots</Text>
        
        {spots.map((spot) => (
          <TouchableOpacity 
            key={spot.id} 
            style={styles.spotCard}
            onPress={() => router.push(`/spot-details?spotId=${spot.id}`)}
          >
            <View style={styles.spotHeader}>
              <View style={styles.spotInfo}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <Text style={styles.spotDistance}>{spot.distance} km away</Text>
              </View>
              <View style={[
                styles.availabilityBadge,
                { backgroundColor: getAvailabilityColor(spot.current_occupancy, spot.max_capacity) }
              ]}>
                <Text style={styles.availabilityText}>
                  {getAvailabilityText(spot.current_occupancy, spot.max_capacity)}
                </Text>
              </View>
            </View>
            
            <View style={styles.spotStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current</Text>
                <Text style={styles.statValue}>{spot.current_occupancy}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Capacity</Text>
                <Text style={styles.statValue}>{spot.max_capacity}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>{spot.max_capacity - spot.current_occupancy}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 18,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 16,
  },
  headerButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 24,
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  radarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  radarCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  youText: {
    marginTop: 4,
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  distanceRing1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  distanceRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  distanceRing3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  spotsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  spotCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  spotDistance: {
    color: '#6b7280',
    marginTop: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  spotStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
}); 