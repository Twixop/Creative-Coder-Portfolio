import { useRef, useState } from "react";

type WeatherData = {
  city: string; country: string; temp: number; feelsLike: number;
  humidity: number; pressure: number; windSpeed: number; windDeg: number;
  description: string; icon: string; main: string; visibility: number;
};

type ForecastDay = {
  day: string; tempMin: number; tempMax: number;
  icon: string; description: string; main: string;
};

const DAY_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function windDir(deg: number) {
  return ["N","NE","E","SE","S","SO","O","NO"][Math.round(deg / 45) % 8];
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_FR[d.getDay()];
}

function iconAnimClass(main: string): string {
  switch (main) {
    case "Clear": return "anim-sun";
    case "Clouds": return "anim-cloud";
    case "Rain": case "Drizzle": return "anim-rain";
    case "Thunderstorm": return "anim-thunder";
    case "Snow": return "anim-snow";
    default: return "anim-pulse";
  }
}

const BASE = import.meta.env.BASE_URL as string;

async function apiFetch(endpoint: string, qs: string): Promise<unknown> {
  const r = await fetch(`${BASE}api/${endpoint}?${qs}`);
  const d = await r.json();
  if ((d as { error?: string }).error) throw new Error((d as { error: string }).error);
  return d;
}

function buildQs(params: { lat?: number; lon?: number; q?: string }): string {
  if (params.q) return `q=${encodeURIComponent(params.q)}`;
  return `lat=${params.lat}&lon=${params.lon}`;
}

export default function NeonWeatherDemo() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function load(params: { lat?: number; lon?: number; q?: string }) {
    setLoading(true);
    setError("");
    try {
      const qs = buildQs(params);
      const [w, f] = await Promise.all([
        apiFetch("weather", qs),
        apiFetch("weather/forecast", qs),
      ]);
      setWeather(w as WeatherData);
      setForecast(((f as { forecast: ForecastDay[] }).forecast) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur météo.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = cityInput.trim();
    if (!q) return;
    load({ q });
  }

  function handleGeo() {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur.");
      return;
    }
    setGeoLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => load({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        setGeoLoading(false);
        setError(
          err.code === 1
            ? "Permission de géolocalisation refusée — entre ta ville manuellement."
            : "Impossible de récupérer ta position.",
        );
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  }

  const animClass = weather ? iconAnimClass(weather.main) : "";

  return (
    <main className="demo-shell weather-shell">
      <div className="container">
        <nav className="demo-nav">
          <a href={BASE || "/"} className="back-link">← Retour au portfolio</a>
          <span className="demo-badge">Démo live // Neon Weather Panel</span>
        </nav>

        <h1 className="weather-title">
          <span className="neon-pink">NEON</span>{" "}
          <span className="neon-cyan">WEATHER</span>{" "}
          <span className="neon-violet">PANEL</span>
        </h1>

        <div className="weather-search-bar">
          <form className="weather-city-form" onSubmit={handleSearch}>
            <input
              ref={inputRef}
              className="weather-city-input"
              type="text"
              placeholder="Paris, Tokyo, New York…"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              autoComplete="off"
              disabled={loading || geoLoading}
            />
            <button className="btn weather-city-btn" type="submit" disabled={loading || geoLoading}>
              {loading && !geoLoading ? "…" : "Rechercher"}
            </button>
          </form>
          <button
            className={`btn-geo${geoLoading ? " btn-geo--loading" : ""}`}
            onClick={handleGeo}
            disabled={loading || geoLoading}
            title="Utiliser ma position GPS"
            aria-label="Utiliser ma position GPS"
          >
            {geoLoading ? (
              <span className="geo-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="weather-error-msg">{error}</p>
        )}

        {loading && !geoLoading && (
          <div className="weather-loading">
            <div className="weather-pulse"></div>
            <p>Récupération des données…</p>
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
                <div className={`weather-icon-wrap ${animClass}`}>
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
                  <span className="stat-value">{weather.windSpeed} km/h {windDir(weather.windDeg)}</span>
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

            {forecast.length > 0 && (
              <div className="forecast-section">
                <h2 className="forecast-title neon-cyan">Prévisions</h2>
                <div className="forecast-row">
                  {forecast.map((d) => (
                    <div key={d.day} className={`forecast-card panel reveal ${iconAnimClass(d.main)}-sm`}>
                      <span className="forecast-day">{dayLabel(d.day)}</span>
                      <div className={`forecast-icon-wrap ${iconAnimClass(d.main)}`}>
                        <img
                          src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                          alt={d.description}
                          className="forecast-icon"
                        />
                      </div>
                      <span className="forecast-max neon-pink">{d.tempMax}°</span>
                      <span className="forecast-min">{d.tempMin}°</span>
                      <span className="forecast-desc">{d.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
