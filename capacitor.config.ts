import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vipistanbultransfer.app",
  appName: "Zuber Istanbul",
  webDir: "out",
  server: {
    // Use dev server for live reload in the Android WebView during development
    // Updated to LAN IP so emulators/devices can reach the host machine.
    url: process.env.NEXT_PUBLIC_APP_URL || "http://192.168.42.95:3000",
    cleartext: true,
    androidScheme: "https",
  },
};

export default config;
