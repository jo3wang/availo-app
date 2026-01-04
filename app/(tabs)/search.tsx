import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAvailabilityColor, getAvailabilityText, getSpotIcon, useStudySpots } from '../../hooks/useStudySpots';

export default function SearchScreen() {
  const { spots } = useStudySpots();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  const filteredSpots = useMemo(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    
    return spots.filter(spot => {
      const matchesSearch = spot.name.toLowerCase().includes(lowerSearchQuery);
      const matchesType = selectedType === 'all' || spot.type === selectedType;
      
      let matchesAvailability = true;
      if (selectedAvailability !== 'all') {
        const occupancyRatio = spot.current_occupancy / spot.max_capacity;
        
        if (selectedAvailability === 'available') {
          matchesAvailability = spot.current_occupancy === 0;
        } else if (selectedAvailability === 'busy') {
          matchesAvailability = occupancyRatio > 0 && occupancyRatio < 0.7;
        } else if (selectedAvailability === 'full') {
          matchesAvailability = occupancyRatio >= 0.7;
        }
      }
      
      return matchesSearch && matchesType && matchesAvailability;
    });
  }, [spots, searchQuery, selectedType, selectedAvailability]);

  const typeFilters = [
    { key: 'all', label: 'All Types', icon: 'grid' },
    { key: 'cafe', label: 'Cafes', icon: 'cafe' },
    { key: 'library', label: 'Libraries', icon: 'library' },
    { key: 'lounge', label: 'Lounges', icon: 'people' },
    { key: 'study_room', label: 'Study Rooms', icon: 'school' },
  ];

  const availabilityFilters = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'busy', label: 'Busy' },
    { key: 'full', label: 'Full' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Spots</Text>
        <Text style={styles.subtitle}>Find your perfect study space</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search study spots..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        {typeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedType === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedType(filter.key)}
          >
            <Ionicons 
              name={filter.icon as keyof typeof Ionicons.glyphMap} 
              size={16} 
              color={selectedType === filter.key ? 'white' : '#6b7280'} 
            />
            <Text style={[
              styles.filterText,
              selectedType === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Availability:</Text>
        {availabilityFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedAvailability === filter.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedAvailability(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedAvailability === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>
          {filteredSpots.length} spot{filteredSpots.length !== 1 ? 's' : ''} found
        </Text>
        
        {filteredSpots.map((spot) => (
          <TouchableOpacity 
            key={spot.id} 
            style={styles.spotCard}
            onPress={() => router.push(`/spot-details?spotId=${spot.id}`)}
          >
            <View style={styles.spotHeader}>
              <View style={styles.spotInfo}>
                <View style={styles.spotIconContainer}>
                  <Ionicons name={getSpotIcon(spot.type) as keyof typeof Ionicons.glyphMap} size={20} color="white" />
                </View>
                <View style={styles.spotDetails}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <Text style={styles.spotDistance}>{spot.distance} km away</Text>
                </View>
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

            {spot.amenities && (
              <View style={styles.amenitiesContainer}>
                {spot.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
    alignSelf: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: 'white',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsTitle: {
    fontSize: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spotIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spotDetails: {
    flex: 1,
  },
  spotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  spotDistance: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
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
    marginBottom: 16,
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
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#6b7280',
  },
}); 