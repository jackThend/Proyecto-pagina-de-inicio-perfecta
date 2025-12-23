import { useState, useEffect } from 'react';

export interface DailyForecast {
  date: string;
  code: number;
  min: number;
  max: number;
}

interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
  };
  daily: DailyForecast[];
}

// WMO Weather interpretation codes
export const getWeatherDescription = (code: number) => {
  const codes: Record<number, string> = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla con escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna densa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia fuerte',
    80: 'Chubascos leves',
    81: 'Chubascos moderados',
    82: 'Chubascos violentos',
    95: 'Tormenta eléctrica',
  };
  return codes[code] || 'Desconocido';
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState('Santiago');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default fallback (Santiago, Chile)
    const lat = -33.4489;
    const lon = -70.6693;

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await res.json();
        
        // Map daily data
        const dailyData: DailyForecast[] = data.daily.time.slice(0, 3).map((time: string, index: number) => ({
          date: time,
          code: data.daily.weather_code[index],
          max: data.daily.temperature_2m_max[index],
          min: data.daily.temperature_2m_min[index]
        }));

        setWeather({
          current: {
            temperature: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day === 1
          },
          daily: dailyData
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
          setLocationName("Ubicación actual"); 
        },
        () => {
          fetchWeather(lat, lon); 
        }
      );
    } else {
      fetchWeather(lat, lon);
    }
  }, []);

  return { weather, locationName, loading };
};
