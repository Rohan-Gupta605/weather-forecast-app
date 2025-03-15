"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Search,
  MapPin,
  Loader2,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  CloudFog,
  CloudLightning,
  CloudSnow,
  Droplets,
  Wind,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WeatherData {
  location: {
    name: string
    country: string
    tz_id: string
    localtime: string
  }
  current: {
    temp_c: number
    condition: {
      text: string
      code: number
      icon: string
    }
    humidity: number
    wind_kph: number
    feelslike_c: number
    precip_mm: number
    air_quality: {
      "us-epa-index": number
      pm2_5: number
    }
  }
  forecast: {
    forecastday: Array<{
      date: string
      date_epoch: number
      day: {
        maxtemp_c: number
        mintemp_c: number
        avgtemp_c: number
        condition: {
          text: string
          code: number
          icon: string
        }
        totalprecip_mm: number
        avghumidity: number
        maxwind_kph: number
      }
      astro: {
        sunrise: string
        sunset: string
      }
    }>
  }
}

export default function WeatherApp() {
  const [location, setLocation] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchWeather = useCallback(
    async (searchLocation: string, isAutoSuggestion = false) => {
      if (!searchLocation.trim()) return

      setLoading(true)
      setSuggestion(null)

      try {
        // Get weather data from WeatherAPI.com
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=6b7772bce6ff4849a15142522251403&q=${encodeURIComponent(
            searchLocation,
          )}&days=7&aqi=yes&alerts=no`,
        )

        if (!response.ok) {
          const errorData = await response.json()

          // If it's a location not found error, try to get suggestions
          if (errorData.error?.code === 1006 && !isAutoSuggestion) {
            await fetchSuggestions(searchLocation)
            throw new Error(errorData.error?.message || "Location not found")
          }

          throw new Error(errorData.error?.message || "Failed to fetch weather data")
        }

        const data: WeatherData = await response.json()

        // If this was a suggested location, show a toast to inform the user
        if (isAutoSuggestion) {
          toast({
            title: "Location Suggestion",
            description: `Showing results for "${data.location.name}, ${data.location.country}" instead.`,
            duration: 5000,
          })
        }

        setWeather(data)
        setSuggestion(null)
      } catch (error) {
        console.error("Error fetching weather:", error)
        if (!isAutoSuggestion) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to fetch weather data. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const fetchSuggestions = async (searchLocation: string) => {
    try {
      // Use the search/autocomplete endpoint to get suggestions
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=6b7772bce6ff4849a15142522251403&q=${encodeURIComponent(searchLocation)}`,
      )

      if (!response.ok) {
        throw new Error("Failed to get location suggestions")
      }

      const suggestions = await response.json()

      if (suggestions && suggestions.length > 0) {
        // Get the first suggestion
        const bestMatch = `${suggestions[0].name}, ${suggestions[0].country}`
        setSuggestion(bestMatch)

        // Automatically fetch weather for the suggested location after a short delay
        setTimeout(() => {
          fetchWeather(bestMatch, true)
        }, 1500)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather(location)
  }

  const getLocationWeather = useCallback(() => {
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser")
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter your location manually.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Clear any previous timeout to avoid race conditions
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setGeoError("Geolocation request timed out. Please try again or enter your location manually.")
      toast({
        title: "Geolocation Timeout",
        description: "Geolocation request timed out. Please try again or enter your location manually.",
        variant: "destructive",
      })
    }, 10000) // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId)
        try {
          const { latitude, longitude } = position.coords
          const locationString = `${latitude},${longitude}`
          setLocation(locationString)
          await fetchWeather(locationString)
        } catch (error) {
          console.error("Error getting location:", error)
          setGeoError("Failed to get weather for your location")
          toast({
            title: "Error",
            description: "Failed to get weather for your location. Please enter it manually.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        clearTimeout(timeoutId)
        setLoading(false)

        let errorMessage = "Location access denied. Please enable location access or enter your location manually."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location access in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again or enter your location manually."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or enter your location manually."
            break
        }

        setGeoError(errorMessage)
        toast({
          title: "Geolocation Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      },
    )
  }, [fetchWeather, toast])

  const getWeatherIcon = (code: number) => {
    // WeatherAPI.com condition codes
    if (code === 1000) return <Sun className="h-10 w-10 text-yellow-400" /> // Sunny
    if (code === 1003) return <CloudSun className="h-10 w-10 text-yellow-400" /> // Partly cloudy
    if ([1006, 1009].includes(code)) return <Cloud className="h-10 w-10 text-gray-400" /> // Cloudy
    if ([1030, 1135, 1147].includes(code)) return <CloudFog className="h-10 w-10 text-gray-300" /> // Mist, fog
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code))
      return <CloudRain className="h-10 w-10 text-blue-400" /> // Rain
    if ([1273, 1276, 1279, 1282].includes(code)) return <CloudLightning className="h-10 w-10 text-purple-400" /> // Thunderstorm
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(code))
      return <CloudSnow className="h-10 w-10 text-blue-200" /> // Snow

    return <Cloud className="h-10 w-10 text-gray-400" /> // Default
  }

  // Function to get dynamic background based on weather condition
  const getWeatherBackground = (code: number, isDay = true) => {
    // Clear
    if (code === 1000) {
      return isDay
        ? "bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600"
        : "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800"
    }

    // Partly cloudy
    if (code === 1003) {
      return isDay
        ? "bg-gradient-to-br from-blue-300 via-sky-400 to-blue-500"
        : "bg-gradient-to-br from-gray-800 via-blue-800 to-gray-700"
    }

    // Cloudy
    if ([1006, 1009].includes(code)) {
      return "bg-gradient-to-br from-gray-300 via-blue-200 to-gray-400"
    }

    // Mist, fog
    if ([1030, 1135, 1147].includes(code)) {
      return "bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500"
    }

    // Rain
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
      return "bg-gradient-to-br from-blue-600 via-blue-500 to-gray-600"
    }

    // Thunderstorm
    if ([1273, 1276, 1279, 1282].includes(code)) {
      return "bg-gradient-to-br from-purple-800 via-gray-700 to-blue-900"
    }

    // Snow
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(code)) {
      return "bg-gradient-to-br from-blue-100 via-gray-200 to-blue-200"
    }

    // Default
    return "bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600"
  }

  // Function to get air quality description
  const getAirQualityInfo = (index: number) => {
    const aqiMap = {
      1: {
        level: "Good",
        description: "Air quality is satisfactory, and air pollution poses little or no risk.",
        color: "text-green-500",
      },
      2: {
        level: "Moderate",
        description: "Air quality is acceptable. However, there may be a risk for some people.",
        color: "text-yellow-500",
      },
      3: {
        level: "Unhealthy for Sensitive Groups",
        description: "Members of sensitive groups may experience health effects.",
        color: "text-orange-400",
      },
      4: { level: "Unhealthy", description: "Everyone may begin to experience health effects.", color: "text-red-500" },
      5: {
        level: "Very Unhealthy",
        description: "Health alert: everyone may experience more serious health effects.",
        color: "text-purple-600",
      },
      6: {
        level: "Hazardous",
        description: "Health warnings of emergency conditions. The entire population is likely to be affected.",
        color: "text-red-800",
      },
    }

    return (
      aqiMap[index] || { level: "Unknown", description: "Air quality information unavailable.", color: "text-gray-500" }
    )
  }

  // Format date for forecast
  const formatDay = (dateEpoch: number) => {
    const date = new Date(dateEpoch * 1000)
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  // Try to get location on component mount
  useEffect(() => {
    // Uncomment to auto-detect location on page load
    // getLocationWeather();
  }, [getLocationWeather])

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card
        className={`shadow-xl overflow-hidden ${
          weather
            ? getWeatherBackground(weather.current.condition.code)
            : "bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600"
        }`}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <CardHeader className="relative text-white">
          <CardTitle className="text-2xl font-bold">Weather Forecast</CardTitle>
          <CardDescription className="text-white/80">
            Get real-time weather information for any location
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pr-10 bg-white/90 dark:bg-gray-800/90 border-white/20"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-white/90 text-black hover:bg-white/70 dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800/70"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={getLocationWeather}
              disabled={loading}
              className="bg-white/90 border-white/90 text-black hover:bg-white/70 dark:bg-gray-800/90 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800/70"
            >
              <MapPin className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Current Location</span>
            </Button>
          </form>

          {suggestion && (
            <Alert className="mb-4 bg-white/90 dark:bg-gray-800/90 border-amber-500">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="ml-2">
                Did you mean <span className="font-semibold">{suggestion}</span>? Showing results for this location...
              </AlertDescription>
            </Alert>
          )}

          {geoError && (
            <Alert className="mb-4 bg-white/90 dark:bg-gray-800/90 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="ml-2">{geoError}</AlertDescription>
            </Alert>
          )}

          {weather && (
            <Tabs defaultValue="current" className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">Current Weather</TabsTrigger>
                <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
              </TabsList>
              <TabsContent value="current" className="mt-4">
                <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold">
                      {weather.location.name}, {weather.location.country}
                    </h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <p>{weather.location.tz_id}</p>
                      <p>
                        Local time:{" "}
                        {new Date(weather.location.localtime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <p className="text-4xl font-bold mt-2">{weather.current.temp_c}°C</p>
                    <p className="text-gray-700 dark:text-gray-300">Feels like {weather.current.feelslike_c}°C</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {getWeatherIcon(weather.current.condition.code)}
                    <p className="mt-2 text-lg">{weather.current.condition.text}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <Card className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Droplets className="h-5 w-5 mb-2 text-blue-500" />
                      <p className="text-gray-700 dark:text-gray-300">Humidity</p>
                      <p className="text-xl font-semibold mt-1">{weather.current.humidity}%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Wind className="h-5 w-5 mb-2 text-blue-500" />
                      <p className="text-gray-700 dark:text-gray-300">Wind Speed</p>
                      <p className="text-xl font-semibold mt-1">{weather.current.wind_kph} km/h</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <CloudRain className="h-5 w-5 mb-2 text-blue-500" />
                      <p className="text-gray-700 dark:text-gray-300">Precipitation</p>
                      <p className="text-xl font-semibold mt-1">{weather.current.precip_mm} mm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm md:col-span-3">
                    <CardContent className="p-4">
                      <p className="text-center text-gray-700 dark:text-gray-300 mb-2">Air Quality</p>
                      <div className="flex flex-col items-center">
                        {weather.current.air_quality && (
                          <>
                            <p
                              className={`text-xl font-semibold ${getAirQualityInfo(weather.current.air_quality["us-epa-index"]).color}`}
                            >
                              {getAirQualityInfo(weather.current.air_quality["us-epa-index"]).level}
                            </p>
                            <p className="text-sm text-center mt-1 text-gray-700 dark:text-gray-300">
                              {getAirQualityInfo(weather.current.air_quality["us-epa-index"]).description}
                            </p>
                            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                              PM2.5: {weather.current.air_quality.pm2_5.toFixed(1)} µg/m³
                            </p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="forecast" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4">
                  {weather.forecast.forecastday.map((day, index) => (
                    <Card
                      key={index}
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-600/70 transition-colors"
                    >
                      <CardContent className="p-4 flex flex-col items-center">
                        <p className="font-medium">{formatDay(day.date_epoch)}</p>
                        <div className="my-2">{getWeatherIcon(day.day.condition.code)}</div>
                        <p className="text-sm">{day.day.condition.text}</p>
                        <div className="flex justify-between w-full mt-2">
                          <p className="text-blue-500 dark:text-blue-400">{Math.round(day.day.mintemp_c)}°</p>
                          <p className="text-red-500 dark:text-red-400">{Math.round(day.day.maxtemp_c)}°</p>
                        </div>
                        <div className="w-full mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between text-xs">
                            <span title="Humidity">
                              <Droplets className="h-3 w-3 inline mr-1" /> {Math.round(day.day.avghumidity)}%
                            </span>
                            <span title="Precipitation">
                              <CloudRain className="h-3 w-3 inline mr-1" /> {day.day.totalprecip_mm}mm
                            </span>
                          </div>
                          <div className="text-xs text-center mt-1" title="Wind Speed">
                            <Wind className="h-3 w-3 inline mr-1" /> {Math.round(day.day.maxwind_kph)} km/h
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!weather && !loading && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
              <Cloud className="h-16 w-16 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white">No Weather Data</h3>
              <p className="text-white/80 mt-2">
                Search for a location or use your current location to get weather information.
              </p>
            </div>
          )}

          {loading && !weather && (
            <div className="flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
              <p className="text-white/80">Fetching weather data...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="relative z-10 text-xs text-white/80">
          Weather data powered by WeatherAPI.com. Last updated: {new Date().toLocaleTimeString()}
        </CardFooter>
      </Card>
    </div>
  )
}

