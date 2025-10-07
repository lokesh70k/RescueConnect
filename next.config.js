/** @type {import('next').NextConfig} */

// Define the Content Security Policy
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com;
    img-src 'self' blob: data: https://api.mapbox.com https://upload.wikimedia.org;
    font-src 'self' https://fonts.gstatic.com https://api.mapbox.com;
    worker-src 'self' blob:;
    connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com;
    form-action 'self';
    frame-src 'self' https://www.google.com;
    frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)', // Apply these headers to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;