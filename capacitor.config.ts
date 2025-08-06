import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8c93dce14a98455080b3ed5241293040',
  appName: 'Work Schedule Verification',
  webDir: 'dist',
  server: {
    url: 'https://8c93dce1-4a98-4550-80b3-ed5241293040.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f8fafc',
      showSpinner: false
    }
  }
};

export default config;