import React, { useState, useEffect, useRef } from 'react'
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [useCelsius, setUseCelsius] = useState(true);
  const [history, setHistory] = useState([]);
  const mounted = useRef(false);



  const getWeather = async () => {
  if (!city) return;

  setLoading(true);          // <-- start loading
  setWeather(null);          // clear previous weather

  const apiKey = 'aa8d33a23419875cc22cc4932dd87e26';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

try {
  const response = await fetch(url);
  const data = await response.json();

  if (data.cod === 200) {
    setWeather(data);

    // Add to search history if new
    setHistory((prev) => {
      const normalizedCity = city.trim().toLowerCase();
      if (!prev.map((c) => c.toLowerCase()).includes(normalizedCity)) {
        return [city, ...prev].slice(0, 5); // Max 5 items
      }
      return prev;
    });

  } else {
    setWeather({ error: 'City not found' });
  }
} catch (error) {
  setWeather({ error: 'Error fetching weather' });
} finally {
  setLoading(false);
}
};

  useEffect(() => {
  if (!mounted.current) {
    mounted.current = true;

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoading(true); // Show loading spinner/message
          const { latitude, longitude } = position.coords;
          const apiKey = 'aa8d33a23419875cc22cc4932dd87e26';
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

          try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod === 200) {
              setWeather(data);
              setCity(data.name); // Set the city so it can be shown or reused
            } else {
              setWeather({ error: 'Unable to fetch location weather.' });
            }
          } catch (error) {
            setWeather({ error: 'Location fetch error.' });
          } finally {
            setLoading(false); // Hide loading spinner/message
          }
        },
        () => {
          setWeather({ error: 'Location permission denied.' });
          setLoading(false); // Hide loading on geolocation error
        }
      );
    } else {
      setWeather({ error: 'Geolocation is not supported.' });
    }
  }
}, []);

  const handleSearch = (e) => {
  e.preventDefault();
  getWeather(); // ← run the search
};

  return (
    <div className="App">
    <form className="weather-form" onSubmit={handleSearch}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
      />
      <button type="submit">Search</button>
      </form>
      {/* rest of your content */}
      <button onClick={() => setUseCelsius(!useCelsius)}>
        Switch to {useCelsius ? 'Fahrenheit' : 'Celsius'}
      </button>
      
{history.length > 0 && (
  <div style={{ marginTop: '20px' }}>
    <h3>Recent Searches</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {history.map((item, index) => (
        <li key={index}>
          <button
            onClick={() => {
              setCity(item);
              getWeather();
            }}
            style={{
              background: '#ffa600',
              color: '#212121',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              margin: '5px',
              cursor: 'pointer',
            }}
            >
              {item}
            </button>
        </li>
      ))}
    </ul>
    </div>
)}

      {loading && <p>Fetching weather...</p>}
      {weather && !weather.error && (
        <div className="weather">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <p>{weather.weather[0].description}</p>
          <p>
            {useCelsius
              ? `${weather.main.temp}°C`
              : `${(weather.main.temp * 9/5 + 32).toFixed(1)}°F`}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
          />
        </div>
      )}

      {weather?.error && <p className="error">{weather.error}</p>}
    </div>
  );
}

export default App;