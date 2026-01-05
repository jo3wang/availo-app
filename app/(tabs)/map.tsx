import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import FilterChip from '../../components/FilterChip';
import LocationCard, { Location } from '../../components/LocationCard';
import {
  colors,
  filterChips,
  getCapacityColor,
  gradientColors,
  sampleLocations,
  calculateCapacity,
} from '../../constants/theme';
import { useStudySpots, StudySpot } from '../../hooks/useStudySpots';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Map Pin Component
const MapPin = ({ percentage, isSelected }: { percentage: number; isSelected: boolean }) => {
  const pinColor = getCapacityColor(percentage);
  const size = isSelected ? 44 : 36;
  const viewBox = "0 0 36 44";

  return (
    <View style={[styles.pinContainer, isSelected && styles.pinSelected]}>
      <Svg width={size} height={size * 1.22} viewBox={viewBox}>
        <Path
          d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.06 27.94 0 18 0Z"
          fill={pinColor}
        />
        <Circle cx="18" cy="16" r="8" fill="white" />
        <SvgText
          x="18"
          y="19"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill={pinColor}
        >
          {percentage}%
        </SvgText>
      </Svg>
    </View>
  );
};

export default function MapScreen() {
  const { spots, loading } = useStudySpots();
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(['Café']);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Merge Firebase spots with sample locations
  const allLocations: Location[] = useMemo(() => {
    const firebaseLocations: Location[] = spots
      .filter(spot => spot.latitude && spot.longitude)
      .map(spot => ({
        id: spot.id,
        name: spot.name,
        type: spot.type || 'Café',
        rating: 4.5,
        reviews: 100,
        price: '$$',
        neighborhood: spot.location || 'UCLA',
        distance: '0.2 mi',
        capacity: calculateCapacity(spot.current_occupancy, spot.max_capacity),
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
        latitude: spot.latitude!,
        longitude: spot.longitude!,
        current_occupancy: spot.current_occupancy,
        max_capacity: spot.max_capacity,
      }));

    // Combine with sample locations
    const sampleWithCoords = sampleLocations.filter(loc => loc.latitude && loc.longitude);
    return [...firebaseLocations, ...sampleWithCoords];
  }, [spots]);

  // Filter locations based on active filters
  const filteredLocations = useMemo(() => {
    if (activeFilters.length === 0) return allLocations;
    return allLocations.filter(loc =>
      activeFilters.some(filter =>
        loc.type.toLowerCase().includes(filter.toLowerCase()) ||
        (filter === 'Quiet' && loc.capacity < 30) ||
        (filter === 'Outlets' && (loc.outlets ?? 0) >= 4) ||
        (filter === '24hr' && loc.hours?.includes('24'))
      )
    );
  }, [allLocations, activeFilters]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleViewDetails = () => {
    if (selectedLocation) {
      router.push(`/spot-details?spotId=${selectedLocation.id}`);
    }
  };

  const handleMarkerPress = (location: Location) => {
    setSelectedLocation(location);
  };

  // Calculate map region to show all locations
  const mapRegion = useMemo(() => {
    if (filteredLocations.length === 0) {
      return {
        latitude: 34.0689,
        longitude: -118.4452,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const lats = filteredLocations.map(l => l.latitude!);
    const lngs = filteredLocations.map(l => l.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.5),
    };
  }, [filteredLocations]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={gradientColors} style={styles.loadingIcon}>
          <Ionicons name="map" size={32} color="white" />
        </LinearGradient>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude!,
              longitude: location.longitude!,
            }}
            onPress={() => handleMarkerPress(location)}
          >
            <MapPin
              percentage={location.capacity}
              isSelected={selectedLocation?.id === location.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBar}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search UCLA, Los Angeles"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.searchDivider} />
            <View style={styles.searchMeta}>
              <Ionicons name="person" size={16} color={colors.textLight} />
              <Text style={styles.searchMetaText}>2+</Text>
              <Text style={styles.searchMetaNow}>Now</Text>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterChips.map((chip) => (
            <FilterChip
              key={chip}
              label={chip}
              active={activeFilters.includes(chip)}
              onPress={() => handleFilterToggle(chip)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Selected Location Card */}
      {selectedLocation && (
        <View style={styles.selectedCardContainer}>
          <LocationCard
            location={selectedLocation}
            onPress={handleViewDetails}
            onClose={() => setSelectedLocation(null)}
          />
        </View>
      )}

      {/* Location Count Badge - positioned below card when card is shown */}
      <View style={[
        styles.countBadge,
        selectedLocation && styles.countBadgeWithCard
      ]}>
        <Ionicons name="location" size={14} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.countText}>{filteredLocations.length} spots nearby</Text>
      </View>

      {/* My Location Button */}
      <TouchableOpacity style={styles.myLocationButton}>
        <Ionicons name="locate" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinSelected: {
    transform: [{ scale: 1.2 }],
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  searchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchMetaText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  searchMetaNow: {
    fontSize: 14,
    color: colors.textLight,
  },
  filterContainer: {
    marginTop: 12,
  },
  filterContent: {
    paddingRight: 16,
  },
  countBadge: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  countBadgeWithCard: {
    bottom: 40,
    left: (SCREEN_WIDTH - 140) / 2,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedCardContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
