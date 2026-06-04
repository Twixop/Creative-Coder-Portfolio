import { Router, type IRouter } from "express";

const router: IRouter = Router();

function buildParams(query: Record<string, string>, apiKey: string): string | null {
  const city = query.q;
  const lat = query.lat;
  const lon = query.lon;
  if (city && city.trim().length > 0) return `q=${encodeURIComponent(city.trim())}&appid=${apiKey}&units=metric&lang=fr`;
  if (lat && lon) {
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    if (isNaN(la) || isNaN(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) return null;
    return `lat=${la}&lon=${lo}&appid=${apiKey}&units=metric&lang=fr`;
  }
  return null;
}

router.get("/weather", async (req, res) => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "Clé API météo non configurée." }); return; }

  const params = buildParams(req.query as Record<string, string>, apiKey);
  if (!params) { res.status(400).json({ error: "Paramètre lat/lon ou q (ville) requis." }); return; }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`);
    if (!response.ok) {
      req.log.error({ status: response.status }, "OpenWeatherMap weather failed");
      res.status(502).json({ error: "Service météo temporairement indisponible." });
      return;
    }
    const data = (await response.json()) as {
      name?: string;
      sys?: { country?: string };
      main?: { temp?: number; feels_like?: number; humidity?: number; pressure?: number };
      weather?: Array<{ description?: string; icon?: string; main?: string }>;
      wind?: { speed?: number; deg?: number };
      visibility?: number;
    };
    res.json({
      city: data.name || "Lieu inconnu",
      country: data.sys?.country || "",
      temp: Math.round(data.main?.temp ?? 0),
      feelsLike: Math.round(data.main?.feels_like ?? 0),
      humidity: data.main?.humidity ?? 0,
      pressure: data.main?.pressure ?? 0,
      windSpeed: Math.round((data.wind?.speed ?? 0) * 3.6),
      windDeg: data.wind?.deg ?? 0,
      description: data.weather?.[0]?.description || "",
      icon: data.weather?.[0]?.icon || "01d",
      main: data.weather?.[0]?.main || "",
      visibility: Math.round((data.visibility ?? 0) / 1000),
    });
  } catch (err) {
    req.log.error({ err }, "Unable to reach OpenWeatherMap");
    res.status(500).json({ error: "Impossible de récupérer la météo." });
  }
});

router.get("/weather/forecast", async (req, res) => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "Clé API météo non configurée." }); return; }

  const params = buildParams(req.query as Record<string, string>, apiKey);
  if (!params) { res.status(400).json({ error: "Paramètre lat/lon ou q (ville) requis." }); return; }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}&cnt=40`);
    if (!response.ok) {
      req.log.error({ status: response.status }, "OpenWeatherMap forecast failed");
      res.status(502).json({ error: "Service prévisions temporairement indisponible." });
      return;
    }

    const data = (await response.json()) as {
      list: Array<{
        dt: number;
        main: { temp_min: number; temp_max: number };
        weather: Array<{ description: string; icon: string; main: string }>;
        dt_txt: string;
      }>;
    };

    const byDay: Record<string, { temps: number[]; icons: string[]; descriptions: string[]; mains: string[] }> = {};
    for (const item of data.list) {
      const day = item.dt_txt.slice(0, 10);
      if (!byDay[day]) byDay[day] = { temps: [], icons: [], descriptions: [], mains: [] };
      byDay[day].temps.push(item.main.temp_min, item.main.temp_max);
      byDay[day].icons.push(item.weather[0]?.icon || "01d");
      byDay[day].descriptions.push(item.weather[0]?.description || "");
      byDay[day].mains.push(item.weather[0]?.main || "");
    }

    const today = new Date().toISOString().slice(0, 10);
    const forecast = Object.entries(byDay)
      .filter(([day]) => day > today)
      .slice(0, 6)
      .map(([day, d]) => {
        const noonIcon = byDay[day].icons[Math.floor(byDay[day].icons.length / 2)] || d.icons[0];
        const freq: Record<string, number> = {};
        for (const m of d.mains) freq[m] = (freq[m] || 0) + 1;
        const main = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "Clear";
        return {
          day,
          tempMin: Math.round(Math.min(...d.temps)),
          tempMax: Math.round(Math.max(...d.temps)),
          icon: noonIcon,
          description: d.descriptions[Math.floor(d.descriptions.length / 2)] || d.descriptions[0],
          main,
        };
      });

    res.json({ forecast });
  } catch (err) {
    req.log.error({ err }, "Unable to reach OpenWeatherMap forecast");
    res.status(500).json({ error: "Impossible de récupérer les prévisions." });
  }
});

export default router;
