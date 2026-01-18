import * as Location from "expo-location";

/**
 * Check if location permission has been granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Request foreground location permission
 * @returns true if permission was granted
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Get current location coordinates
 * @returns latitude and longitude, or null if unable to get location
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get city and region
 * @param latitude
 * @param longitude
 * @returns city and region names, or null values if unable to geocode
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{
  city: string | undefined;
  region: string | undefined;
}> {
  try {
    const [result] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result) {
      return {
        city: result.city || result.subregion || undefined,
        region: result.region || result.country || undefined,
      };
    }

    return { city: undefined, region: undefined };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return { city: undefined, region: undefined };
  }
}
