// app.config.js
module.exports = ({ config }) => ({
  ...config,

  name: "BaguioQuest",
  slug: "baguioquest",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  // ✅ Make sure web is declared as a supported platform
  platforms: ["ios", "android", "web"],

  icon: "./assets/images/icon.png",

  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    ...config?.ios,
    supportsTablet: true,
    bundleIdentifier: "com.xyzeyu.baguioquest",
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription: "Allow $(PRODUCT_NAME) to use your location.",
      NSLocationAlwaysUsageDescription: "Allow $(PRODUCT_NAME) to use your location.",
      NSLocationWhenInUseUsageDescription: "Allow $(PRODUCT_NAME) to use your location.",
      UIBackgroundModes: ["location"],
    },
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },

  android: {
    ...config?.android,
    package: "com.xyzeyu.baguioquest",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "FOREGROUND_SERVICE",
      "FOREGROUND_SERVICE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "POST_NOTIFICATIONS",
    ],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },

  // ✅ Proper web (PWA) settings for static export
  web: {
    bundler: "webpack",
    output: "static",                      // export to /dist
    favicon: "./assets/images/icon.png",   // make sure this file exists
    name: "BaguioQuest",
    shortName: "BaguioQuest",
    description:
      "Smart tourist navigation for Baguio City with coding-day alerts, offline maps, and route tracking.",
    display: "standalone",
    themeColor: "#0b0b0f",
    backgroundColor: "#ffffff",
    orientation: "portrait",
  },

  plugins: [
    [
      "expo-router",
      { origin: "https://rork.com/" },
    ],
    [
      "expo-location",
      {
        isAndroidForegroundServiceEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isIosBackgroundLocationEnabled: true,
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    "expo-notifications",
  ],

  experiments: { typedRoutes: true },

  extra: {
    router: { origin: "https://rork.com/" },
    eas: { projectId: "e0dea9ea-8fb7-4d59-af0c-415f07953a69" },
  },
});
