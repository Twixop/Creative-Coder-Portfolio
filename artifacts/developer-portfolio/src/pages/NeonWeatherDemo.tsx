import { useEffect, useState } from "react";

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

export default function NeonWeatherDemo() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setError("Accès à la position refusé. Autorise la géolocalisation pour voir la météo.");
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/weather?lat=${coords.lat}&lon=${coords.lon}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setWeather(data as WeatherData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors de la récupération de la météo.");
        setLoading(false);
      });
  }, [coords]);

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

        {error && (
          <div className="weather-error panel">
            <p>{error}</p>
          </div>
        )}

        {weather && !loading && (
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
        )}
      </div>
    </main>
  );
}
