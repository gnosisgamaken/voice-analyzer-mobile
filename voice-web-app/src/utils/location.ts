export async function getCurrentLocation(): Promise<string> {
  if (!navigator.geolocation) {
    return 'Unknown Location';
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 60000,
      });
    });

    const { latitude, longitude } = position.coords;
    const locationName = await reverseGeocode(latitude, longitude);
    return locationName;
  } catch (error) {
    console.warn('Location access denied or unavailable:', error);
    return 'Unknown Location';
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VoiceAnalyzerPWA/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const address = data.address;

    const locationParts = [
      address.neighbourhood || address.suburb || address.village,
      address.city || address.town,
      address.state,
    ].filter(Boolean);

    return locationParts.length > 0 ? locationParts.join(', ') : 'Unknown Location';
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
  }
}

export function generateRecordingName(locationName: string = 'Unknown Location'): string {
  const now = new Date();
  
  const date = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${locationName} - ${date} ${time}`;
}
