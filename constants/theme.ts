// Availo Brand Colors - Purple/Indigo theme
export const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // Status colors based on capacity
  success: '#10B981', // Green - empty/available
  warning: '#F59E0B', // Orange - busy
  danger: '#EF4444',  // Red - full
  error: '#EF4444',   // Alias for danger

  // UI colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceDark: '#1A1A2E',
  surfaceDarker: '#16213E',

  // Text colors
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

// Get capacity color based on percentage
export const getCapacityColor = (percentage: number): string => {
  if (percentage < 30) return '#10B981'; // Green - empty
  if (percentage < 50) return '#6366F1'; // Light purple
  if (percentage < 70) return '#8B5CF6'; // Medium purple
  if (percentage < 85) return '#7C3AED'; // Dark purple
  return '#EF4444'; // Red - full
};

// Get capacity text description
export const getCapacityText = (percentage: number): string => {
  if (percentage < 30) return 'Quiet';
  if (percentage < 50) return 'Available';
  if (percentage < 70) return 'Moderate';
  if (percentage < 85) return 'Busy';
  return 'Full';
};

// Calculate capacity percentage from occupancy
export const calculateCapacity = (current: number, max: number): number => {
  if (max <= 0) return 0;
  return Math.round((current / max) * 100);
};

// Gradient for buttons and accents (tuple type for LinearGradient)
export const gradientColors: readonly [string, string, string] = ['#6366F1', '#8B5CF6', '#A855F7'] as const;

// Filter chip options
export const filterChips = ['Café', 'Library', 'Lounge', 'Quiet', 'Outlets', '24hr'];

// Sample location data for mockup/testing
export const sampleLocations = [
  {
    id: '1',
    name: 'Cognoscenti Coffee',
    type: 'Café',
    rating: 4.6,
    reviews: 242,
    price: '$$',
    cuisine: 'Coffee & Tea',
    neighborhood: 'Culver City',
    distance: '0.3 mi',
    capacity: 42,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
    wifi: 4.5,
    outlets: 4.0,
    food: 4.2,
    ambience: 4.8,
    address: '6115 Washington Blvd, Culver City, CA 90232',
    hours: '7am - 6pm',
    typicalDuration: '45 min to 2 hr',
    photos: 47,
    latitude: 34.0195,
    longitude: -118.3930,
  },
  {
    id: '2',
    name: 'Powell Library',
    type: 'Library',
    rating: 4.8,
    reviews: 1205,
    price: 'Free',
    cuisine: 'Study Space',
    neighborhood: 'UCLA',
    distance: '0.1 mi',
    capacity: 76,
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=600&fit=crop',
    wifi: 4.8,
    outlets: 4.5,
    food: 2.0,
    ambience: 4.9,
    address: '10740 Dickson Ct, Los Angeles, CA 90095',
    hours: '24 hours',
    typicalDuration: '2 to 4 hr',
    photos: 156,
    latitude: 34.0719,
    longitude: -118.4421,
  },
  {
    id: '3',
    name: 'Verve Coffee Roasters',
    type: 'Café',
    rating: 4.4,
    reviews: 389,
    price: '$$$',
    cuisine: 'Coffee & Tea',
    neighborhood: 'Santa Monica',
    distance: '2.1 mi',
    capacity: 23,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
    wifi: 4.2,
    outlets: 3.5,
    food: 4.0,
    ambience: 4.6,
    address: '833 Santa Monica Blvd, Santa Monica, CA 90401',
    hours: '6:30am - 7pm',
    typicalDuration: '30 min to 1 hr',
    photos: 89,
    latitude: 34.0195,
    longitude: -118.4912,
  },
  {
    id: '4',
    name: 'YRL Study Lounge',
    type: 'Lounge',
    rating: 4.3,
    reviews: 567,
    price: 'Free',
    cuisine: 'Study Space',
    neighborhood: 'UCLA',
    distance: '0.2 mi',
    capacity: 58,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    wifi: 4.7,
    outlets: 4.8,
    food: 1.5,
    ambience: 4.2,
    address: '280 Charles E Young Dr N, Los Angeles, CA 90095',
    hours: '8am - 11pm',
    typicalDuration: '1 to 3 hr',
    photos: 34,
    latitude: 34.0749,
    longitude: -118.4414,
  },
];

// Popular times data for charts
export const popularTimesData = [
  { hour: '6a', value: 10 },
  { hour: '9a', value: 45 },
  { hour: '12p', value: 80 },
  { hour: '3p', value: 65 },
  { hour: '6p', value: 55 },
  { hour: '9p', value: 30 },
  { hour: '12a', value: 15 },
];
