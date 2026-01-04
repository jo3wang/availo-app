import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAvailabilityColor, getAvailabilityText, useStudySpots } from '../hooks/useStudySpots';

export default function SpotDetailsScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const { spots } = useStudySpots();
  const router = useRouter();

  if (__DEV__) {
    console.log('SpotDetailsScreen - Received spotId:', spotId);
    console.log('SpotDetailsScreen - Available spots:', spots.map(s => ({ id: s.id, name: s.name })));
  }

  // Find the spot by ID
  const spot = spots.find(s => s.id === spotId);
  
  if (__DEV__) {
    console.log('SpotDetailsScreen - Found spot:', spot);
  }

  if (!spot) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spot Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Study spot not found</Text>
        </View>
      </View>
    );
  }

  // Mock historical data
  const mockHistoricalData = [
    { day: 'Monday', avgOccupancy: 68, peak: '2:00 PM' },
    { day: 'Tuesday', avgOccupancy: 72, peak: '1:30 PM' },
    { day: 'Wednesday', avgOccupancy: 85, peak: '3:00 PM' },
    { day: 'Thursday', avgOccupancy: 78, peak: '2:30 PM' },
    { day: 'Friday', avgOccupancy: 92, peak: '4:00 PM' },
    { day: 'Saturday', avgOccupancy: 45, peak: '11:00 AM' },
    { day: 'Sunday', avgOccupancy: 38, peak: '10:30 AM' },
  ];

  const currentOccupancyPercentage = Math.round((spot.current_occupancy / spot.max_capacity) * 100);
  const weeklyAverage = Math.round(mockHistoricalData.reduce((sum, day) => sum + day.avgOccupancy, 0) / 7);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spot Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.spotHeader}>
            <View style={styles.spotIconContainer}>
              <Ionicons 
                name={spot.type === 'cafe' ? 'cafe' : spot.type === 'library' ? 'library' : 'location'} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.spotInfo}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotType}>{spot.type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getAvailabilityColor(spot.current_occupancy, spot.max_capacity) }
            ]}>
              <Text style={styles.statusText}>
                {getAvailabilityText(spot.current_occupancy, spot.max_capacity)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{spot.current_occupancy}</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{spot.max_capacity}</Text>
              <Text style={styles.statLabel}>Capacity</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{currentOccupancyPercentage}%</Text>
              <Text style={styles.statLabel}>Occupied</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{spot.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About This Space</Text>
          <Text style={styles.description}>
            {spot.type === 'cafe' 
              ? `A cozy cafe perfect for studying with great coffee and a welcoming atmosphere. Known for its comfortable seating and reliable WiFi, making it a favorite among students and remote workers.`
              : spot.type === 'library'
              ? `A quiet library space ideal for focused study sessions. Features comfortable reading areas, excellent lighting, and a peaceful environment conducive to learning.`
              : `A versatile study space offering a comfortable environment for both individual and group work. Popular among students for its relaxed atmosphere and modern amenities.`
            }
          </Text>
        </View>

        {/* Weekly Occupancy Trends */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Occupancy Trends</Text>
          <Text style={styles.averageText}>Weekly Average: {weeklyAverage}% occupied</Text>
          
          {mockHistoricalData.map((day, index) => (
            <View key={index} style={styles.dayRow}>
              <Text style={styles.dayName}>{day.day}</Text>
              <View style={styles.occupancyBar}>
                <View 
                  style={[
                    styles.occupancyFill, 
                    { 
                      width: `${day.avgOccupancy}%`,
                      backgroundColor: day.avgOccupancy > 80 ? '#ef4444' : day.avgOccupancy > 60 ? '#f59e0b' : '#22c55e'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.percentageText}>{day.avgOccupancy}%</Text>
            </View>
          ))}
        </View>

        {/* Amenities */}
        {spot.amenities && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {spot.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityChip}>
                  <Ionicons 
                    name={
                      amenity.toLowerCase().includes('wifi') ? 'wifi' :
                      amenity.toLowerCase().includes('power') ? 'flash' :
                      amenity.toLowerCase().includes('coffee') ? 'cafe' :
                      amenity.toLowerCase().includes('quiet') ? 'volume-mute' :
                      'checkmark-circle'
                    } 
                    size={16} 
                    color="#3b82f6" 
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mock Reviews */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Reviews</Text>
          <View style={styles.reviewsHeader}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingNumber}>4.2</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star}
                    name={star <= 4 ? 'star' : 'star-outline'} 
                    size={16} 
                    color="#f59e0b" 
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>Based on 127 reviews</Text>
            </View>
          </View>
          
          <View style={styles.reviewItem}>
            <Text style={styles.reviewText}>
              "Great study spot with excellent WiFi and comfortable seating. The atmosphere is perfect for getting work done."
            </Text>
            <Text style={styles.reviewAuthor}>- Sarah M.</Text>
          </View>
          
          <View style={styles.reviewItem}>
            <Text style={styles.reviewText}>
              "Love the coffee here and it's usually not too crowded in the mornings. Perfect for early study sessions."
            </Text>
            <Text style={styles.reviewAuthor}>- Alex T.</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  mainCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  spotIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  spotType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  averageText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    width: 80,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  occupancyBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    width: 40,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 6,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  stars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reviewAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'right',
  },
});