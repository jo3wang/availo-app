import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import CapacityCup from '../../components/CapacityCup';
import { colors, gradientColors, sampleLocations } from '../../constants/theme';
import { useSaved } from '../../contexts/SavedContext';

// Gradient Heart Icon component
const GradientHeartIcon = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6366F1" />
        <Stop offset="50%" stopColor="#8B5CF6" />
        <Stop offset="100%" stopColor="#A855F7" />
      </SvgGradient>
    </Defs>
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heartGradient)"
    />
  </Svg>
);

// Helper to get image source
const getImageSource = (image: string | ImageSourcePropType) => {
  if (typeof image === 'string') {
    return { uri: image };
  }
  return image;
};

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds, toggleSaved } = useSaved();

  // Filter to only show saved locations
  const savedLocations = useMemo(() => {
    return sampleLocations.filter(loc => savedIds.has(loc.id));
  }, [savedIds]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient heart */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <GradientHeartIcon size={36} />
          <Text style={styles.title}>Saved</Text>
        </View>
      </View>

      <View style={styles.content}>
        {savedLocations.length > 0 ? (
          <>
            {/* Saved locations list */}
            <View style={styles.savedList}>
              {savedLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.savedCard}
                  onPress={() => router.push(`/spot-details?spotId=${location.id}`)}
                  activeOpacity={0.9}
                >
                  <Image source={getImageSource(location.image)} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardName} numberOfLines={1}>{location.name}</Text>
                      <TouchableOpacity onPress={() => toggleSaved(location.id)}>
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardNeighborhood}>{location.neighborhood}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardDistance}>{location.distance}</Text>
                      <CapacityCup percentage={location.capacity} size="sm" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>No saved spots yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any study spot to save it for quick access
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  savedList: {
    gap: 16,
  },
  savedCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: 96,
    height: 96,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardNeighborhood: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDistance: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
