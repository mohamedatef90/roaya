/**
 * Production Environment Configuration
 * Roaya IT Website
 */
export const environment = {
  production: true,

  // API Configuration
  apiUrl: '/api/v1',

  // Google Cloud Translation API
  // SECURITY: This key should be restricted to your production domain
  // Go to Google Cloud Console → Credentials → Edit API Key
  // Set HTTP referrers: https://roaya.co/*, https://www.roaya.co/*
  googleTranslateApiKey: '', // Add your restricted production API key

  // Translation settings
  translation: {
    enableAI: true,
    sourceLang: 'en',
    supportedLangs: ['ar', 'en'],
    cacheTTLDays: 30,
    maxCharsPerRequest: 5000,
  },

  // Analytics
  googleAnalyticsId: '', // GA4 Measurement ID (e.g., G-XXXXXXXXXX)

  // Error Logging (Sentry)
  // SECURITY: Restrict this DSN to your production domain in Sentry settings
  // Go to Project Settings → Client Keys → Configure → Allowed Domains
  sentryDsn: '', // Add your production Sentry DSN here
};
