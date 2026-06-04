import { useEffect, useRef, useState } from "react";

type WeatherData = {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  description: string;
  icon: string;
  main: string;
  visibility: number;
};

function windDirection(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

async function fetchWeather(params: { lat?: number; lon?: number; q?: string }): Promise<WeatherData> {
  const query = params.q
    ? `q=${encodeURIComponent(params.q)}`
    : `lat=${params.lat}&lon=${params.lon}`;
  const r = await fetch(`${import.meta.env.BASE_URL}api/weather?${query}`);
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data as WeatherData;
}

export default function NeonWeatherDemo() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [showCitySearch, setShowCitySearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setShowCitySearch(true);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      setShowCitySearch(true);
      setLoading(false);
    }, 6000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeout);
        try {
          const data = await fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setWeather(data);
        } catch (err) {
          setShowCitySearch(true);
          setError(err instanceof Error ? err.message : "Erreur météo.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        clearTimeout(timeout);
        setShowCitySearch(true);
        setLoading(false);
      },
      { timeout: 5000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    if (showCitySearch) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showCitySearch]);

  async function handleCitySearch(e: React.FormEvent) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchWeather({ q: cityInput.trim() });
      setWeather(data);
      setShowCitySearch(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ville introuvable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="demo-shell weather-shell">
      <div className="container">
        <nav className="demo-nav">
          <a href={import.meta.env.BASE_URL || "/"} className="back-link">
            ← Retour au portfolio
          </a>
          <span className="demo-badge">Démo live // Neon Weather Panel</span>
        </nav>

        <h1 className="weather-title">
          <span className="neon-pink">NEON</span> <span className="neon-cyan">WEATHER</span>{" "}
          <span className="neon-violet">PANEL</span>
        </h1>

        {loading && (
          <div className="weather-loading">
            <div className="weather-pulse"></div>
            <p>Localisation en cours…</p>
          </div>
        )}

        {!loading && showCitySearch && (
          <div className="weather-city-search">
            <p className="weather-city-hint">
              {error || "Géolocalisation non disponible — entre ta ville manuellement."}
            </p>
            <form className="weather-city-form" onSubmit={handleCitySearch}>
              <input
                ref={inputRef}
                className="weather-city-input"
                type="text"
                placeholder="Paris, Tokyo, New York…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                autoComplete="off"
              />
              <button className="btn weather-city-btn" type="submit">
                Rechercher
              </button>
            </form>
          </div>
        )}

        {!loading && !showCitySearch && error && (
          <div className="weather-error panel">
            <p>{error}</p>
            <button className="btn" onClick={() => { setShowCitySearch(true); setError(""); }}>
              Rechercher une ville
            </button>
          </div>
        )}

        {weather && !loading && (
          <>
            <div className="weather-grid">
              <div className="weather-main panel reveal">
                <div className="weather-location">
                  <span className="neon-cyan">{weather.city}</span>
                  {weather.country && <span className="weather-country">, {weather.country}</span>}
                </div>
                <div className="weather-icon-wrap">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="weather-icon"
                  />
                </div>
                <div className="weather-temp">
                  <span className="neon-pink">{weather.temp}°C</span>
                </div>
                <div className="weather-desc">{weather.description}</div>
                <div className="weather-feels">Ressenti : {weather.feelsLike}°C</div>
              </div>

              <div className="weather-details">
                <div className="weather-stat panel reveal">
                  <span className="stat-label neon-violet">Humidité</span>
                  <span className="stat-value">{weather.humidity}%</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${weather.humidity}%` }}></div>
                  </div>
                </div>

                <div className="weather-stat panel reveal">
                  <span className="stat-label neon-violet">Vent</span>
                  <span className="stat-value">
                    {weather.windSpeed} km/h {windDirection(weather.windDeg)}
                  </span>
                </div>

                <div className="weather-stat panel reveal">
                  <span className="stat-label neon-violet">Pression</span>
                  <span className="stat-value">{weather.pressure} hPa</span>
                </div>

                <div className="weather-stat panel reveal">
                  <span className="stat-label neon-violet">Visibilité</span>
                  <span className="stat-value">{weather.visibility} km</span>
                </div>
              </div>
            </div>

            <div className="weather-change-city">
              <button
                className="btn-ghost"
                onClick={() => { setShowCitySearch(true); setWeather(null); }}
              >
                Changer de ville
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
