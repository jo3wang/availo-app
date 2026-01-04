import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../FirebaseConfig';

export interface StudySpot {
  id: string;
  name: string;
  current_occupancy: number;
  max_capacity: number;
  distance: number;
  type: 'cafe' | 'library' | 'lounge' | 'study_room';
  amenities?: string[];
  latitude?: number;
  longitude?: number;
}

export interface LoungeStatus {
  id: string;
  current_occupancy: number;
  last_updated: Timestamp | Date;
  device_id: string;
  wifi_devices: number;
  ble_devices: number;
  max_capacity?: number;
}

const mockStudySpots: StudySpot[] = [
  {
    id: '1',
    name: 'Starbucks Coffee',
    current_occupancy: 12,
    max_capacity: 25,
    distance: 0.2,
    type: 'cafe',
    amenities: ['WiFi', 'Power Outlets', 'Coffee'],
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: '2',
    name: 'University Library',
    current_occupancy: 45,
    max_capacity: 100,
    distance: 0.5,
    type: 'library',
    amenities: ['WiFi', 'Quiet Zones', 'Printing'],
    latitude: 37.7750,
    longitude: -122.4195,
  },
  {
    id: '3',
    name: 'Student Lounge A',
    current_occupancy: 8,
    max_capacity: 20,
    distance: 0.8,
    type: 'lounge',
    amenities: ['WiFi', 'TV', 'Comfortable Seating'],
    latitude: 37.7748,
    longitude: -122.4193,
  },
  {
    id: '4',
    name: 'Study Room 101',
    current_occupancy: 0,
    max_capacity: 4,
    distance: 1.2,
    type: 'study_room',
    amenities: ['WiFi', 'Whiteboard', 'Quiet'],
    latitude: 37.7751,
    longitude: -122.4196,
  },
  {
    id: '5',
    name: 'Campus Cafe',
    current_occupancy: 15,
    max_capacity: 30,
    distance: 1.5,
    type: 'cafe',
    amenities: ['WiFi', 'Food', 'Power Outlets'],
    latitude: 37.7747,
    longitude: -122.4192,
  }
];

export const useStudySpots = () => {
  const [spots, setSpots] = useState<StudySpot[]>(mockStudySpots);
  const [lounges, setLounges] = useState<LoungeStatus[]>([]);
  const [loading, setLoading] = useState(false); // Don't start in loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Don't block app loading - start Firebase connection asynchronously
    const initializeFirebase = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'lounge_status'), orderBy('last_updated', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          try {
            const loungeData: LoungeStatus[] = [];
            snapshot.forEach((doc) => {
              loungeData.push({
                id: doc.id,
                ...doc.data()
              } as LoungeStatus);
            });
            
            setLounges(loungeData);
            setError(null);
            setLoading(false);
          } catch (parseError) {
            if (__DEV__) {
              console.error('Error parsing lounge data:', parseError);
            }
            setError('Failed to parse lounge data');
            setLoading(false);
          }
        }, (firestoreError) => {
          if (__DEV__) {
            console.warn('Firebase lounge data unavailable:', firestoreError.message);
          }
          setError(`Firebase error: ${firestoreError.message}`);
          setLounges([]);
          setLoading(false);
        });
      } catch (initError) {
        if (__DEV__) {
          console.error('Failed to initialize Firebase listener:', initError);
        }
        setError('Failed to connect to Firebase');
        setLoading(false);
      }
    };

    // Start Firebase connection with a small delay to not block initial render
    const timeoutId = setTimeout(initializeFirebase, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (cleanupError) {
          if (__DEV__) {
            console.error('Error during cleanup:', cleanupError);
          }
        }
      }
    };
  }, []);

  // Memoize expensive calculations
  const calculations = useMemo(() => {
    const totalSpots = spots.length + lounges.length;
    const availableSpots = spots.filter(s => s.current_occupancy === 0).length + 
                          lounges.filter(l => l.current_occupancy === 0).length;
    const totalUsers = spots.reduce((sum, s) => sum + s.current_occupancy, 0) + 
                      lounges.reduce((sum, l) => sum + l.current_occupancy, 0);
    
    return { totalSpots, availableSpots, totalUsers };
  }, [spots, lounges]);

  return {
    spots,
    lounges,
    loading,
    error,
    ...calculations
  };
};

export const getAvailabilityColor = (occupancy: number, maxCapacity: number) => {
  const percentage = (occupancy / maxCapacity) * 100;
  if (percentage === 0) return '#87A96B';  // Available - sage green
  if (percentage < 70) return '#C65D4F';   // Busy - warm terracotta
  return '#8B4B61';                        // Full - muted burgundy
};

export const getAvailabilityText = (occupancy: number, maxCapacity: number) => {
  const percentage = (occupancy / maxCapacity) * 100;
  if (percentage === 0) return 'Available';
  if (percentage < 70) return 'Busy';
  return 'Full';
};

export const getSpotIcon = (type: string) => {
  switch (type) {
    case 'cafe': return 'cafe';
    case 'library': return 'library';
    case 'lounge': return 'people';
    case 'study_room': return 'school';
    default: return 'location';
  }
};