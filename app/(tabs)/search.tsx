import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import LocationCard, { Location } from '../../components/LocationCard';
import FilterChip from '../../components/FilterChip';
import { colors, gradientColors, filterChips, sampleLocations, calculateCapacity } from '../../constants/theme';
import { useStudySpots } from '../../hooks/useStudySpots';

// Gradient "ao." Logo component
const GradientLogo = () => (
  <Svg width={56} height={36} viewBox="0 0 56 36">
    <Defs>
      <SvgGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6366F1" />
        <Stop offset="50%" stopColor="#8B5CF6" />
        <Stop offset="100%" stopColor="#A855F7" />
      </SvgGradient>
    </Defs>
    <SvgText
      x="0"
      y="28"
      fill="url(#logoGradient)"
      fontSize="28"
      fontWeight="bold"
      fontFamily="Georgia"
    >
      ao.
    </SvgText>
  </Svg>
);

export default function SearchScreen() {
  const router = useRouter();
  const { lounges, loading } = useStudySpots();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['Café']);

  // Merge sample locations with real Firebase data
  const allLocations = useMemo(() => {
    // Convert Firebase lounges to Location format
    const firebaseLocations: Location[] = lounges.map((lounge) => ({
      id: lounge.id,
      name: lounge.venue_name || lounge.id,
      type: lounge.venue_type === 'study_area' ? 'Lounge' : 'Café',
      rating: 4.5,
      reviews: 100,
      price: 'Free',
      cuisine: 'Study Space',
      neighborhood: 'Campus',
      distance: '0.1 mi',
      capacity: calculateCapacity(lounge.current_occupancy, lounge.max_capacity || 20),
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      wifi: (lounge.wifi_devices || 0) / 5,
      outlets: 4.0,
      address: 'Campus Location',
      hours: '8am - 10pm',
      current_occupancy: lounge.current_occupancy,
      max_capacity: lounge.max_capacity || 20,
      wifi_devices: lounge.wifi_devices,
      ble_devices: lounge.ble_devices,
    }));

    // Add sample locations for demo
    const samples: Location[] = sampleLocations.map((loc) => ({
      ...loc,
      id: loc.id,
    }));

    return [...firebaseLocations, ...samples];
  }, [lounges]);

  // Filter locations based on search and filters
  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return allLocations.filter((location) => {
      const matchesSearch = location.name.toLowerCase().includes(query) ||
        location.neighborhood.toLowerCase().includes(query);

      const matchesFilter = activeFilters.length === 0 ||
        activeFilters.some((filter) => {
          if (filter === 'Café') return location.type === 'Café';
          if (filter === 'Library') return location.type === 'Library';
          if (filter === 'Lounge') return location.type === 'Lounge';
          if (filter === 'Quiet') return location.capacity < 50;
          if (filter === 'Outlets') return (location.outlets || 0) >= 4;
          if (filter === '24hr') return location.hours?.includes('24');
          return true;
        });

      return matchesSearch && matchesFilter;
    });
  }, [allLocations, searchQuery, activeFilters]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleLocationPress = (location: Location) => {
    router.push(`/spot-details?spotId=${location.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gradient logo */}
      <View style={styles.header}>
        <GradientLogo />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cafés, libraries, lounges..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
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

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Nearby Spots</Text>
          <Text style={styles.resultsCount}>{filteredLocations.length} results</Text>
        </View>

        {/* Location list */}
        <View style={styles.locationList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading spots...</Text>
            </View>
          ) : filteredLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>No spots found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            filteredLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onPress={() => handleLocationPress(location)}
                compact
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  titleContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Georgia',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
  },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  filtersScroll: {
    marginTop: 12,
  },
  filtersContent: {
    paddingRight: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  locationList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
});
