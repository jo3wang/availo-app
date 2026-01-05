import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Defs, ClipPath, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

interface CapacityCupProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const sizes = {
  sm: { width: 24, height: 30, fontSize: 14 },
  md: { width: 32, height: 40, fontSize: 16 },
  lg: { width: 48, height: 60, fontSize: 20 },
};

// Consistent purple color for cup outline (matches app theme)
const CUP_COLOR = '#8B5CF6';

export default function CapacityCup({ percentage, size = 'md', showPercentage = true }: CapacityCupProps) {
  const { width, height, fontSize } = sizes[size];

  // Calculate fill height based on percentage
  const maxFillHeight = 44;
  const fillHeight = (percentage / 100) * maxFillHeight;
  const fillY = 55 - fillHeight;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 48 60">
        {/* Gradient definition for fill */}
        <Defs>
          <LinearGradient id={`cup-gradient-${size}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="50%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#A855F7" />
          </LinearGradient>
          <ClipPath id={`cup-clip-${percentage}-${size}`}>
            <Path d="M10 12C10 11.4477 10.4477 11 11 11H37C37.5523 11 38 11.4477 38 12V45C38 50.5228 33.5228 55 28 55H20C14.4772 55 10 50.5228 10 45V12Z" />
          </ClipPath>
        </Defs>

        {/* Cup body outline */}
        <Path
          d="M8 12C8 10.8954 8.89543 10 10 10H38C39.1046 10 40 10.8954 40 12V45C40 51.6274 34.6274 57 28 57H20C13.3726 57 8 51.6274 8 45V12Z"
          stroke={CUP_COLOR}
          strokeWidth={2.5}
          fill="transparent"
        />

        {/* Handle */}
        <Path
          d="M40 20H42C44.7614 20 47 22.2386 47 25V30C47 32.7614 44.7614 35 42 35H40"
          stroke={CUP_COLOR}
          strokeWidth={2.5}
          fill="transparent"
        />

        {/* Fill level with gradient */}
        <Rect
          x={10}
          y={fillY}
          width={28}
          height={fillHeight}
          fill={`url(#cup-gradient-${size})`}
          clipPath={`url(#cup-clip-${percentage}-${size})`}
        />

        {/* Steam lines when 90%+ full */}
        {percentage >= 90 && (
          <>
            <Path
              d="M18 6C18 6 17 3 18 1"
              stroke={CUP_COLOR}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.6}
            />
            <Path
              d="M24 5C24 5 23 2 24 0"
              stroke={CUP_COLOR}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.6}
            />
            <Path
              d="M30 6C30 6 29 3 30 1"
              stroke={CUP_COLOR}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.6}
            />
          </>
        )}
      </Svg>

      {/* Percentage text to the right of cup */}
      {showPercentage && (
        <Text style={[styles.percentageText, { fontSize }]}>
          {percentage}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentageText: {
    fontWeight: '700',
    color: '#6366F1',
  },
});
