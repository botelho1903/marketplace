import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marketplace.app',
  appName: 'Marketplace',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://yourdomain.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3b82f6',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
