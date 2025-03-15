import WeatherApp from "./weather-app"
import Link from "next/link"

export default function PortfolioSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">My Projects</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          A showcase of my recent work and projects I've built using modern technologies.
        </p>

        <div className="grid grid-cols-1 gap-16">
          {/* Weather App Project */}
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold inline-flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                  Weather Forecast App
                </span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A real-time weather application that provides current conditions and 7-day forecasts for any location.
                Built with React, Next.js, and Tailwind CSS. Features include air quality index, precipitation data, and
                dynamic backgrounds that change based on weather conditions.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Next.js
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                  React
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  WeatherAPI
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Geolocation
                </span>
              </div>

              {/* Project Links */}
              <div className="flex justify-center gap-4 mt-4">
                <Link
                  href="https://github.com/Rohan-Gupta605/weather-forecast-app"
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub Repository
                </Link>
                <Link
                  href="https://rohan-gupta605.github.io/weather-forecast-app"
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Live Demo
                </Link>
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 dark:to-gray-800 z-0 pointer-events-none h-12 -top-12"></div>
              <WeatherApp />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-100 dark:to-gray-800 z-0 pointer-events-none h-12 -bottom-12"></div>
            </div>
          </div>

          {/* You can add more portfolio projects here */}
          <div className="space-y-6 opacity-40">
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold inline-flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                  Coming Soon
                </span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                More exciting projects are in development and will be added to this portfolio soon. Stay tuned for
                updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

