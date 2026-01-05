import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradientColors } from '../constants/theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, active, onPress }: FilterChipProps) {
  if (active) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeChip}
        >
          <Text style={styles.activeText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.inactiveChip} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.inactiveText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  inactiveChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
