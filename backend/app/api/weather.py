from fastapi import APIRouter, Query
from app.schemas.schemas import WeatherResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("", response_model=WeatherResponse)
def get_weather(location: str = Query("Nashik", description="Location name, e.g. Nashik, Pune, Niphad")):
    return WeatherService.get_weather(location)
