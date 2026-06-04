import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/weather", async (req, res) => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Clé API météo non configurée." });
    return;
  }

  const lat = req.query.lat as string;
  const lon = req.query.lon as string;
  const city = req.query.q as string;

  let weatherUrl: string;

  if (city && city.trim().length > 0) {
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${apiKey}&units=metric&lang=fr`;
  } else if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      res.status(400).json({ error: "Coordonnées invalides." });
      return;
    }
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${apiKey}&units=metric&lang=fr`;
  } else {
    res.status(400).json({ error: "Paramètre lat/lon ou q (ville) requis." });
    return;
  }

  try {
    const url = weatherUrl;
    const response = await fetch(url);

    if (!response.ok) {
      const details = await response.text();
      req.log.error({ status: response.status, details }, "OpenWeatherMap request failed");
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

export default router;
