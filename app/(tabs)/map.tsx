import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { getAvailabilityColor, getAvailabilityText, getSpotIcon, StudySpot, useStudySpots } from '../../hooks/useStudySpots';

const statusColors = {
  available: '#87A96B',  // Sage green
  busy: '#C65D4F',       // Warm terracotta  
  full: '#8B4B61'        // Muted burgundy
};

export default function MapScreen() {
  const { spots, loading } = useStudySpots();
  const router = useRouter();
  
  // Filter spots that have coordinates for map display
  const spotsWithCoords = spots.filter(spot => spot.latitude && spot.longitude);


  const handleViewDetails = (spot: StudySpot) => {
    if (__DEV__) {
      console.log('Navigating to spot details for:', spot.id);
    }
    router.push(`/spot-details?spotId=${spot.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="map" size={48} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Study Map</Text>
        <Text style={styles.subtitle}>Find available study spots</Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {spotsWithCoords.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude!,
                longitude: spot.longitude!,
              }}
              onPress={() => handleViewDetails(spot)}
            >
              <View style={[
                styles.marker,
                { backgroundColor: getAvailabilityColor(spot.current_occupancy, spot.max_capacity) }
              ]}>
                <Ionicons name={getSpotIcon(spot.type) as keyof typeof Ionicons.glyphMap} size={16} color="white" />
              </View>
              <Callout onPress={() => handleViewDetails(spot)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{spot.name}</Text>
                  <Text style={styles.calloutText}>
                    {spot.current_occupancy}/{spot.max_capacity} people
                  </Text>
                  <Text style={styles.calloutStatus}>
                    {getAvailabilityText(spot.current_occupancy, spot.max_capacity)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(spot)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Availability</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColors.available }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColors.busy }]} />
            <Text style={styles.legendText}>Busy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusColors.full }]} />
            <Text style={styles.legendText}>Full</Text>
          </View>
        </View>
      </View>
    </View>
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
    paddingTop: 60,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  legend: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
}); 