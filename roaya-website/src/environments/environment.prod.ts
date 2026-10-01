/**
 * Production Environment Configuration
 * Roaya IT Website
 */
export const environment = {
  production: true,

  // API Configuration
  apiUrl: '/api/v1',

  // Production never prefills admin credentials.
  adminLogin: {
    username: '',
    email: '',
    password: '',
  },

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

  // Analytics. GA4 is the measurement already used by the GTM container in index.html.
  // Hotjar Site ID is the number in the Hotjar tracking code (Sites & Organizations).
  googleAnalyticsId: 'G-NPLQ20N4NX',
  hotjarSiteId: '',

  // Error Logging (Sentry)
  // SECURITY: Restrict this DSN to your production domain in Sentry settings
  // Go to Project Settings → Client Keys → Configure → Allowed Domains
  sentryDsn: '', // Add your production Sentry DSN here
};
