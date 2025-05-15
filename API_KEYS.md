# API Keys Security

## Overview

This application uses API keys for Google Maps and Mapbox services. For security reasons, these keys should **never** be hardcoded directly in the source code or committed to version control.

## Setting Up API Keys

1. Copy the `env.example` file to a new file named `.env.local` in the root of your project
2. Replace the placeholder values with your actual API keys:

```
# Google Maps API Key (required for places search)
REACT_APP_GOOGLE_API_KEY=your_actual_google_api_key_here

# Mapbox token (required for map rendering)
REACT_APP_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

The `.env.local` file is automatically excluded from git by Create React App, so your API keys will remain private.

## Securing Your Google Cloud API Key

If you've accidentally published your Google Cloud API key to GitHub, follow these steps:

1. **Regenerate the API key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Find your exposed API key
   - Click on the key and then click "Regenerate Key" 
   - Copy the new key and use it in your `.env.local` file

2. **Add API restrictions**:
   - Restrict your API key by:
     - Limiting which APIs can use the key (only enable the services you need)
     - Adding application restrictions (HTTP referrers, IP addresses, etc.)
     - Setting quotas to prevent unexpected usage

3. **Never commit your API keys to GitHub**:
   - Ensure `.env.local` is in your `.gitignore` file
   - Use environment variables in production environments
   - Consider using services like GitHub Secrets for CI/CD pipelines

## Production Deployment

For production deployments, set the environment variables according to your hosting platform's documentation:

- **Netlify**: Set environment variables in the Netlify UI under Site settings > Build & deploy > Environment
- **Vercel**: Add environment variables in the Vercel dashboard under Project Settings > Environment Variables
- **Heroku**: Use `heroku config:set REACT_APP_GOOGLE_API_KEY=your_key` 