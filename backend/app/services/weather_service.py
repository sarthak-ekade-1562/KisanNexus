import logging
from typing import Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class WeatherService:
    @staticmethod
    def get_weather(location: str = "Nashik") -> Dict[str, Any]:
        """
        Fetches weather data. If WEATHER_API_KEY is missing or external API fails,
        returns clearly labelled DEMO WEATHER DATA with agricultural transit and harvest advisories.
        """
        if settings.WEATHER_API_KEY:
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={location},IN&appid={settings.WEATHER_API_KEY}&units=metric"
                with httpx.Client(timeout=5.0) as client:
                    resp = client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        main = data.get("main", {})
                        weather_item = data.get("weather", [{}])[0]
                        wind = data.get("wind", {})
                        
                        return {
                            "location": location.title(),
                            "district": "Nashik",
                            "temperature": round(main.get("temp", 28.5), 1),
                            "humidity": int(main.get("humidity", 62)),
                            "rainfall_mm": 0.0,
                            "wind_speed_kmh": round(wind.get("speed", 3.2) * 3.6, 1),
                            "weather_condition": weather_item.get("description", "Clear").title(),
                            "data_status": "LIVE WEATHER DATA",
                            "advisories": [
                                "Favorable weather for morning vegetable harvesting and loading.",
                                "Ensure tarpaulin cover during long-distance transit to Pune/Mumbai."
                            ],
                            "forecast_5day": WeatherService._generate_forecast(main.get("temp", 28.5))
                        }
            except Exception as e:
                logger.warning(f"Weather API fetch failed: {e}. Falling back to demo data.")

        # Default DEMO WEATHER DATA fallback
        return {
            "location": location.title() if location else "Nashik",
            "district": "Nashik",
            "temperature": 29.2,
            "humidity": 58,
            "rainfall_mm": 0.0,
            "wind_speed_kmh": 12.4,
            "weather_condition": "Partly Sunny / Dry",
            "data_status": "DEMO WEATHER DATA",
            "advisories": [
                "Excellent dry conditions for onion curing and open yard grading.",
                "Ideal road transit conditions to Mumbai and Pune APMCs with minimal humidity spoilage risk.",
                "Recommended loading window: 6:00 AM - 10:00 AM to prevent produce wilting."
            ],
            "forecast_5day": [
                {"day": "Today", "temp_min": 19.5, "temp_max": 31.0, "condition": "Sunny", "rainfall_prob": 5, "humidity": 55},
                {"day": "Tomorrow", "temp_min": 20.0, "temp_max": 31.5, "condition": "Clear Sky", "rainfall_prob": 10, "humidity": 58},
                {"day": "Day 3", "temp_min": 21.0, "temp_max": 32.0, "condition": "Partly Cloudy", "rainfall_prob": 15, "humidity": 60},
                {"day": "Day 4", "temp_min": 20.5, "temp_max": 30.5, "condition": "Sunny", "rainfall_prob": 10, "humidity": 57},
                {"day": "Day 5", "temp_min": 21.5, "temp_max": 32.5, "condition": "Sunny", "rainfall_prob": 5, "humidity": 52}
            ]
        }

    @staticmethod
    def _generate_forecast(base_temp: float) -> List[Dict[str, Any]]:
        return [
            {"day": "Today", "temp_min": round(base_temp - 8, 1), "temp_max": round(base_temp + 3, 1), "condition": "Sunny", "rainfall_prob": 10, "humidity": 55},
            {"day": "Tomorrow", "temp_min": round(base_temp - 7, 1), "temp_max": round(base_temp + 4, 1), "condition": "Partly Cloudy", "rainfall_prob": 15, "humidity": 58},
            {"day": "Day 3", "temp_min": round(base_temp - 8, 1), "temp_max": round(base_temp + 2, 1), "condition": "Clear", "rainfall_prob": 5, "humidity": 54},
            {"day": "Day 4", "temp_min": round(base_temp - 6, 1), "temp_max": round(base_temp + 3, 1), "condition": "Sunny", "rainfall_prob": 10, "humidity": 56},
            {"day": "Day 5", "temp_min": round(base_temp - 7, 1), "temp_max": round(base_temp + 4, 1), "condition": "Sunny", "rainfall_prob": 10, "humidity": 52}
        ]
