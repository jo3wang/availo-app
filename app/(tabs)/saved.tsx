import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CapacityCup from '../../components/CapacityCup';
import { colors, gradientColors, sampleLocations } from '../../constants/theme';

export default function SavedScreen() {
  const router = useRouter();

  // For now, show first 2 sample locations as "saved"
  const savedLocations = sampleLocations.slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Saved Spots</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Saved locations list */}
        <View style={styles.savedList}>
          {savedLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.savedCard}
              onPress={() => router.push(`/spot-details?spotId=${location.id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: location.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>{location.name}</Text>
                  <Ionicons name="heart" size={18} color="#EF4444" />
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

        {/* Empty state hint */}
        <View style={styles.emptyHint}>
          <Ionicons name="heart-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>
            Save your favorite study spots for quick access
          </Text>
        </View>
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
  headerGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
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
  emptyHint: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
});
