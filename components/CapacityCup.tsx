import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Defs, ClipPath } from 'react-native-svg';
import { getCapacityColor } from '../constants/theme';

interface CapacityCupProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: 32, height: 40, fontSize: 8 },
  md: { width: 48, height: 60, fontSize: 10 },
  lg: { width: 64, height: 80, fontSize: 14 },
};

export default function CapacityCup({ percentage, size = 'md' }: CapacityCupProps) {
  const { width, height, fontSize } = sizes[size];
  const fillColor = getCapacityColor(percentage);

  // Calculate fill height based on percentage (cup body height is roughly 45 units out of 60)
  const maxFillHeight = 44; // Height of the fillable area
  const fillHeight = (percentage / 100) * maxFillHeight;
  const fillY = 55 - fillHeight; // Start from bottom (y=55) minus fill height

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 48 60">
        {/* Cup body outline */}
        <Path
          d="M8 12C8 10.8954 8.89543 10 10 10H38C39.1046 10 40 10.8954 40 12V45C40 51.6274 34.6274 57 28 57H20C13.3726 57 8 51.6274 8 45V12Z"
          stroke={fillColor}
          strokeWidth={2.5}
          fill="transparent"
        />

        {/* Handle */}
        <Path
          d="M40 20H42C44.7614 20 47 22.2386 47 25V30C47 32.7614 44.7614 35 42 35H40"
          stroke={fillColor}
          strokeWidth={2.5}
          fill="transparent"
        />

        {/* Clip path for fill */}
        <Defs>
          <ClipPath id={`cup-clip-${percentage}-${size}`}>
            <Path d="M10 12C10 11.4477 10.4477 11 11 11H37C37.5523 11 38 11.4477 38 12V45C38 50.5228 33.5228 55 28 55H20C14.4772 55 10 50.5228 10 45V12Z" />
          </ClipPath>
        </Defs>

        {/* Fill level */}
        <Rect
          x={10}
          y={fillY}
          width={28}
          height={fillHeight}
          fill={fillColor}
          clipPath={`url(#cup-clip-${percentage}-${size})`}
          opacity={0.85}
        />

        {/* Steam lines when 90%+ full (very busy/hot) */}
        {percentage >= 90 && (
          <>
            <Path
              d="M18 6C18 6 17 3 18 1"
              stroke={fillColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.5}
            />
            <Path
              d="M24 5C24 5 23 2 24 0"
              stroke={fillColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.5}
            />
            <Path
              d="M30 6C30 6 29 3 30 1"
              stroke={fillColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.5}
            />
          </>
        )}
      </Svg>

      {/* Percentage text - centered within cup body */}
      <View style={[styles.textContainer, { width, height }]}>
        <Text
          style={[
            styles.percentageText,
            {
              fontSize,
              color: percentage > 50 ? '#FFFFFF' : fillColor,
            },
          ]}
        >
          {percentage}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingRight: 4,
  },
  percentageText: {
    fontWeight: '700',
  },
});
