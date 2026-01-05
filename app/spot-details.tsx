import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CapacityCup from '../components/CapacityCup';
import { Location } from '../components/LocationCard';
import {
  colors,
  gradientColors,
  sampleLocations,
  popularTimesData,
  calculateCapacity,
  getCapacityText,
} from '../constants/theme';
import { useStudySpots } from '../hooks/useStudySpots';
import { useSaved } from '../contexts/SavedContext';

// Helper to get image source
const getImageSource = (image: string | ImageSourcePropType | undefined) => {
  if (!image) {
    return { uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop' };
  }
  if (typeof image === 'string') {
    return { uri: image };
  }
  return image;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Rating Bar Component
const RatingBar = ({ label, value, max = 5, tags = [] }: {
  label: string;
  value: number;
  max?: number;
  tags?: string[];
}) => {
  const percentage = (value / max) * 100;

  return (
    <View style={styles.ratingBarContainer}>
      <View style={styles.ratingBarHeader}>
        <Text style={styles.ratingBarLabel}>{label}</Text>
        <Text style={styles.ratingBarValue}>{value.toFixed(1)}</Text>
      </View>
      <View style={styles.ratingBarTrack}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.ratingBarFill, { width: `${percentage}%` }]}
        />
      </View>
      {tags.length > 0 && (
        <View style={styles.ratingTags}>
          {tags.map((tag, i) => (
            <View key={i} style={styles.ratingTag}>
              <Text style={styles.ratingTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Popular Times Chart
const PopularTimesChart = ({ data, currentHour = 15 }: {
  data: typeof popularTimesData;
  currentHour?: number;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const isCurrentHour = index === Math.floor(currentHour / 3);
        const heightPercentage = (item.value / maxValue) * 100;

        return (
          <View key={item.hour} style={styles.chartBar}>
            {isCurrentHour ? (
              <LinearGradient
                colors={gradientColors}
                style={[styles.chartBarFill, { height: `${heightPercentage}%` }]}
              />
            ) : (
              <View
                style={[
                  styles.chartBarFill,
                  styles.chartBarInactive,
                  { height: `${heightPercentage}%` },
                ]}
              />
            )}
            <Text style={styles.chartLabel}>{item.hour}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default function SpotDetailsScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const { spots } = useStudySpots();
  const router = useRouter();
  const { isSaved, toggleSaved } = useSaved();
  const [activeTab, setActiveTab] = useState('availability');

  const tabs = ['Availability', 'Reviews', 'Photos', 'Details'];
  const saved = spotId ? isSaved(spotId) : false;

  // Find location from Firebase spots or sample data
  const location: Location | undefined = useMemo(() => {
    // First check Firebase spots
    const firebaseSpot = spots.find(s => s.id === spotId);
    if (firebaseSpot) {
      return {
        id: firebaseSpot.id,
        name: firebaseSpot.name,
        type: firebaseSpot.type || 'Café',
        rating: 4.5,
        reviews: 100,
        price: '$$',
        neighborhood: firebaseSpot.location || 'UCLA',
        distance: `${firebaseSpot.distance || 0.2} mi`,
        capacity: calculateCapacity(firebaseSpot.current_occupancy, firebaseSpot.max_capacity),
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
        wifi: 4.5,
        outlets: 4.0,
        food: 4.2,
        ambience: 4.8,
        address: '123 Study Street, Los Angeles, CA',
        hours: '7am - 10pm',
        typicalDuration: '1 to 2 hr',
        photos: 25,
        current_occupancy: firebaseSpot.current_occupancy,
        max_capacity: firebaseSpot.max_capacity,
      };
    }

    // Then check sample locations
    return sampleLocations.find(l => l.id === spotId);
  }, [spots, spotId]);

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.errorText}>Study spot not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={getImageSource(location.image)} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          />

          {/* Header buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerButtonGroup}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => spotId && toggleSaved(spotId)}
              >
                <Ionicons
                  name={saved ? "heart" : "heart-outline"}
                  size={20}
                  color={saved ? "#EF4444" : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="share-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo count badge */}
          <TouchableOpacity style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>See all {location.photos || 25} photos</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title section */}
          <Text style={styles.title}>{location.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>{location.rating}</Text>
              <Text style={styles.reviewCountText}>({location.reviews} reviews)</Text>
            </View>
            <Text style={styles.priceText}>{location.price}</Text>
            <Text style={styles.cuisineText}>{location.cuisine || location.type}</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={styles.addressText}>{location.address}</Text>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.toLowerCase();
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab.toLowerCase())}
                  style={styles.tab}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                  {isActive && (
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tabIndicator}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'availability' && (
              <View style={styles.availabilityTab}>
                {/* Capacity Section */}
                <View style={styles.capacityCard}>
                  <View style={styles.capacityHeader}>
                    <View>
                      <Text style={styles.capacityTitle}>Current Capacity</Text>
                      <Text style={styles.capacitySubtitle}>
                        {location.capacity < 50
                          ? 'Usually not too busy'
                          : location.capacity < 75
                          ? 'Moderately busy'
                          : 'Very busy'}
                      </Text>
                    </View>
                    <CapacityCup percentage={location.capacity} size="lg" />
                  </View>

                  {/* Popular Times */}
                  <View style={styles.popularTimesContainer}>
                    <View style={styles.popularTimesHeader}>
                      <View style={styles.popularTimesLabel}>
                        <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.popularTimesText}>Popular times</Text>
                      </View>
                      <TouchableOpacity style={styles.daySelector}>
                        <Text style={styles.daySelectorText}>Sunday</Text>
                        <Ionicons name="chevron-down" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                    <PopularTimesChart data={popularTimesData} />
                  </View>

                  {/* Duration */}
                  <View style={styles.durationContainer}>
                    <Ionicons name="cafe" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.durationText}>
                      People typically spend {location.typicalDuration || '1 to 2 hr'} here
                    </Text>
                  </View>
                </View>

                {/* Hours */}
                <View style={styles.hoursCard}>
                  <View style={styles.hoursRow}>
                    <View style={styles.openIndicator} />
                    <Text style={styles.openText}>Open</Text>
                    <Text style={styles.closesText}>• Closes at 6pm</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color={colors.textLight} />
                </View>
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.reviewsTab}>
                {/* Overall Rating */}
                <View style={styles.overallRating}>
                  <Text style={styles.overallRatingNumber}>{location.rating}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(location.rating) ? 'star' : 'star-outline'}
                        size={20}
                        color="#FBBF24"
                      />
                    ))}
                  </View>
                  <Text style={styles.totalReviews}>{location.reviews} reviews</Text>
                </View>

                {/* Rating Breakdown */}
                <View style={styles.ratingBreakdown}>
                  <Text style={styles.ratingBreakdownTitle}>Study Space Ratings</Text>
                  <RatingBar label="Wi-Fi" value={location.wifi || 4.5} tags={['Fast', 'Reliable']} />
                  <RatingBar label="Outlets" value={location.outlets || 4.0} tags={['Plenty', 'Near seats']} />
                  <RatingBar label="Food & Drinks" value={location.food || 4.2} tags={['Good coffee', 'Snacks']} />
                  <RatingBar label="Ambience" value={location.ambience || 4.8} tags={['Quiet', 'Spacious']} />
                </View>

                {/* Your Rating */}
                <View style={styles.yourRating}>
                  <Text style={styles.yourRatingLabel}>Your rating</Text>
                  <View style={styles.yourRatingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star}>
                        <Ionicons name="star-outline" size={24} color={colors.border} />
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addReviewButton}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'photos' && (
              <View style={styles.photosTab}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TouchableOpacity key={i} style={styles.photoItem}>
                    <Image
                      source={getImageSource(location.image)}
                      style={[
                        styles.photoImage,
                        i > 1 && { opacity: 0.8 + (i * 0.02) },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'details' && (
              <View style={styles.detailsTab}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{location.address}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Hours</Text>
                    <Text style={styles.detailValue}>{location.hours}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="wifi" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Wi-Fi</Text>
                    <Text style={styles.detailValue}>Free, password available at counter</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="volume-medium" size={20} color={colors.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Noise Level</Text>
                    <Text style={styles.detailValue}>Moderate - Good for focused work</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButtonAlt: {
    position: 'absolute',
    top: 60,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 16,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero Image
  heroContainer: {
    height: 288,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  headerButtons: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
  },
  photoCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    marginTop: -24,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '600',
    color: colors.text,
  },
  reviewCountText: {
    color: colors.textLight,
    marginLeft: 2,
  },
  priceText: {
    color: colors.primary,
    fontWeight: '500',
  },
  cuisineText: {
    color: colors.textMuted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  addressText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },
  tabContent: {
    marginTop: 24,
  },

  // Availability Tab
  availabilityTab: {
    gap: 16,
  },
  capacityCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 20,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  capacityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  capacitySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 4,
  },
  popularTimesContainer: {
    marginTop: 8,
  },
  popularTimesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularTimesLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popularTimesText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  daySelectorText: {
    color: 'white',
    fontSize: 14,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 96,
    gap: 4,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  chartBarInactive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  chartLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  durationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.borderLight,
    padding: 16,
    borderRadius: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  openText: {
    fontWeight: '500',
    color: colors.text,
  },
  closesText: {
    color: colors.textMuted,
  },

  // Reviews Tab
  reviewsTab: {
    gap: 24,
  },
  overallRating: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 8,
  },
  totalReviews: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  ratingBreakdown: {
    backgroundColor: colors.borderLight,
    borderRadius: 16,
    padding: 20,
  },
  ratingBreakdownTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  ratingBarContainer: {
    marginBottom: 16,
  },
  ratingBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  ratingBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ratingBarTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  ratingTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingTagText: {
    fontSize: 12,
    color: colors.primary,
  },
  yourRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  yourRatingLabel: {
    fontWeight: '500',
    color: colors.text,
  },
  yourRatingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addReviewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Photos Tab
  photosTab: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: (SCREEN_WIDTH - 56) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },

  // Details Tab
  detailsTab: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.borderLight,
    padding: 12,
    borderRadius: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: '500',
    color: colors.text,
  },
  detailValue: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
});
