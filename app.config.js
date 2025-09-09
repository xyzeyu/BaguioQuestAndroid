// app.config.js
// ✅ JS config (not JSON), so environment variables & comments are allowed.
//  - No "react-native-maps" plugin needed (avoids the config plugin error).
//  - Google Maps API key is injected via env var: GOOGLE_MAPS_API_KEY.

module.exports = ({ config }) => ({
  ...config,

  name: "BaguioQuest",
  slug: "baguioquest",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

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
      // (No special Info.plist string is required for notifications on iOS)
    },
    // Apple Maps is default, but if you use Google tiles on iOS you also need the key here:
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
      // 👇 Needed for Android 13+ local notifications
      "POST_NOTIFICATIONS",
    ],
    // ✅ This wires your Google Maps API key into AndroidManifest as meta-data
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },

  web: {
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    // Keep only valid, known plugins here
    [
      "expo-router",
      {
        origin: "https://rork.com/",
      },
    ],
    [
      "expo-location",
      {
        isAndroidForegroundServiceEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isIosBackgroundLocationEnabled: true,
        locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    // 👇 Add notifications plugin so permissions & channels are set up correctly
    "expo-notifications",
  ],

  experiments: { typedRoutes: true },

  extra: {
    router: { origin: "https://rork.com/" },
    eas: { projectId: "e0dea9ea-8fb7-4d59-af0c-415f07953a69" },
  },
});
