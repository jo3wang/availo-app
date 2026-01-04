import { Barometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

const SEA_LEVEL_PRESSURE = 1013.25; // hPa
const FLOOR_HEIGHT = 3; // meters per floor (adjust as needed)
const ROLLING_WINDOW = 5;

function pressureToAltitude(pressure: number, seaLevelPressure: number = SEA_LEVEL_PRESSURE) {
  // Barometric formula approximation
  return 44330 * (1 - Math.pow(pressure / seaLevelPressure, 0.1903));
}

export function useAltitude(gpsAltitude?: number) {
  const [altitude, setAltitude] = useState<number | null>(null);
  const [floor, setFloor] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const readings = useRef<number[]>([]);
  const [seaLevelPressure, setSeaLevelPressure] = useState(SEA_LEVEL_PRESSURE);

  // Optionally calibrate sea-level pressure if GPS altitude is provided
  useEffect(() => {
    if (gpsAltitude != null && pressure != null) {
      // Rearranged barometric formula to solve for P0
      const p0 = pressure / Math.pow(1 - gpsAltitude / 44330, 1 / 0.1903);
      setSeaLevelPressure(p0);
    }
  }, [gpsAltitude, pressure]);

  useEffect(() => {
    const subscription = Barometer.addListener(({ pressure }) => {
      readings.current.push(pressure);
      if (readings.current.length > ROLLING_WINDOW) {
        readings.current.shift();
      }
      // Rolling average
      const avgPressure = readings.current.reduce((a, b) => a + b, 0) / readings.current.length;
      setPressure(avgPressure);
      const alt = pressureToAltitude(avgPressure, seaLevelPressure);
      setAltitude(alt);
      setFloor(Math.round(alt / FLOOR_HEIGHT));
    });
    Barometer.setUpdateInterval(1000); // 1 second
    return () => subscription.remove();
  }, [seaLevelPressure]);

  return { altitude, floor, pressure };
} 