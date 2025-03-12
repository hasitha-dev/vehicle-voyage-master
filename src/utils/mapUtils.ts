
import L from 'leaflet';
import { toast } from 'sonner';

// Google Maps API key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyAul3w-58LsqLRQ';

// Set bounds for Colombo area (Western Province)
export const colomboBounds = L.latLngBounds(
  [6.7, 79.8], // Southwest corner
  [7.0, 80.0]  // Northeast corner
);

// Function to check if a location is within Colombo bounds
export const isWithinColombo = (latlng: L.LatLng): boolean => {
  return colomboBounds.contains(latlng);
};

// Function to get address from coordinates
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    // Verify location is in Western Province/Colombo area
    const isInColombo = 
      (data.address?.city === 'Colombo') || 
      (data.address?.county === 'Colombo') || 
      (data.address?.state === 'Western Province');
    
    if (!isInColombo) {
      toast.error("Please select a location within Colombo area");
      return '';
    }
    
    return data.display_name || 'Selected Location';
  } catch (error) {
    console.error('Error fetching location info:', error);
    toast.error('Error getting location information. Please try again.');
    return '';
  }
};

// Function to get location suggestions based on search text
export const getLocationSuggestions = async (searchText: string): Promise<any[]> => {
  if (!searchText || searchText.length < 3) return [];
  
  try {
    // Using OpenStreetMap Nominatim for suggestions (free alternative to Google Places)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText + ' Colombo Sri Lanka')}&format=json&addressdetails=1&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location suggestions');
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.place_id,
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
};

// Function to calculate distance between two points in kilometers
export const calculateDistance = (start: [number, number], end: [number, number]): number => {
  // Convert degrees to radians
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(end[0] - start[0]);
  const dLon = toRad(end[1] - start[1]);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(start[0])) * Math.cos(toRad(end[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

// Calculate fare based on distance
export const calculateFare = (distance: number, vehicleType: string): number => {
  const baseRates: Record<string, number> = {
    'sedan': 50, // Base rate per km for sedan
    'suv': 65,   // Base rate per km for SUV
    'van': 75,   // Base rate per km for van
    'luxury': 100 // Base rate per km for luxury vehicles
  };

  const baseRate = baseRates[vehicleType] || 50; // Default to sedan rate
  const baseFare = 300; // Base fare for any trip
  
  return baseFare + (baseRate * distance);
};
