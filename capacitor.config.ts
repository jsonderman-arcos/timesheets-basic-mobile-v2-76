import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timesheets.basicmobile',
  appName: 'Work Schedule Verification',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f8fafc',
      showSpinner: false
    }
  }
};

export default config;
