import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CapacityCup from './CapacityCup';
import { colors, gradientColors } from '../constants/theme';
import { useSaved } from '../contexts/SavedContext';

export interface Location {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  price: string;
  cuisine?: string;
  neighborhood: string;
  distance: string;
  capacity: number;
  image: string | ImageSourcePropType;
  imageUrl?: string;
  wifi?: number;
  outlets?: number;
  food?: number;
  ambience?: number;
  address?: string;
  hours?: string;
  typicalDuration?: string;
  photos?: number;
  latitude?: number;
  longitude?: number;
  // Firebase data fields
  current_occupancy?: number;
  max_capacity?: number;
  wifi_devices?: number;
  ble_devices?: number;
}

interface LocationCardProps {
  location: Location;
  onPress: () => void;
  onClose?: () => void;
  compact?: boolean;
  showSaveButton?: boolean;
}

// Helper to get image source
const getImageSource = (image: string | ImageSourcePropType) => {
  if (typeof image === 'string') {
    return { uri: image };
  }
  return image;
};

export default function LocationCard({ location, onPress, onClose, compact = false, showSaveButton = true }: LocationCardProps) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(location.id);

  // Calculate capacity from Firebase data if available
  const capacity = location.capacity ??
    (location.current_occupancy && location.max_capacity
      ? Math.round((location.current_occupancy / location.max_capacity) * 100)
      : 50);

  const handleSavePress = (e: any) => {
    e.stopPropagation();
    toggleSaved(location.id);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={getImageSource(location.image)} style={styles.compactImage} />
        <View style={styles.compactContent}>
          {/* Top row: name and heart icon */}
          <View style={styles.compactHeader}>
            <Text style={styles.compactName} numberOfLines={1}>{location.name}</Text>
            {showSaveButton && (
              <TouchableOpacity onPress={handleSavePress} style={styles.saveButtonCompact}>
                <Ionicons
                  name={saved ? "heart" : "heart-outline"}
                  size={18}
                  color={saved ? "#EF4444" : colors.textLight}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Type badge under name */}
          <View style={styles.typeBadgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{location.type}</Text>
            </View>
          </View>
          {/* Rating row */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>{location.rating}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.metaText}>{location.price}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.metaText}>{location.distance}</Text>
          </View>
          {/* Footer with neighborhood and capacity cup */}
          <View style={styles.compactFooter}>
            <Text style={styles.neighborhoodText}>{location.neighborhood}</Text>
            <CapacityCup percentage={capacity} size="sm" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fullCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={getImageSource(location.image)} style={styles.fullImage} />
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {showSaveButton && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={20}
              color={saved ? "#EF4444" : colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fullContent}>
        <View style={styles.fullHeader}>
          <View style={styles.fullInfo}>
            <Text style={styles.fullName}>{location.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingTextLarge}>{location.rating}</Text>
              <Text style={styles.reviewCount}>({location.reviews})</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.metaText}>{location.price}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.metaText}>{location.cuisine || location.type}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={colors.textLight} />
              <Text style={styles.locationText}>
                {location.neighborhood} • {location.distance}
              </Text>
            </View>
          </View>
          <CapacityCup percentage={capacity} size="md" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Compact card styles
  compactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 12,
  },
  compactImage: {
    width: 112,
    height: 112,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 2,
  },
  ratingTextLarge: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 2,
  },
  dotSeparator: {
    fontSize: 12,
    color: colors.textLight,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  saveButtonCompact: {
    padding: 2,
  },
  neighborhoodText: {
    fontSize: 12,
    color: colors.textLight,
  },

  // Full card styles
  fullCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    maxWidth: 340,
  },
  imageContainer: {
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: 176,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullContent: {
    padding: 16,
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fullInfo: {
    flex: 1,
    marginRight: 12,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Georgia',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 2,
  },
});
