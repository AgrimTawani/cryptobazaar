# Google OAuth Setup Guide

## Step-by-Step Instructions

### 1. Access Google Cloud Console
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project or create a new one

### 2. Enable Google+ API
- Navigate to "APIs & Services" → "Library"
- Search for "Google+ API" and enable it
- Also enable "Google Identity API" if available

### 3. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Choose "Web application"
- Give it a name (e.g., "CryptoBazar NextAuth")

### 4. Configure Authorized URIs
In the OAuth client configuration:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

⚠️ **IMPORTANT**: The redirect URI must be EXACTLY as shown above!

### 5. Get Your Credentials
After creating the OAuth client, you'll get:
- Client ID (ends with `.apps.googleusercontent.com`)
- Client Secret (a random string)

### 6. Update .env.local
Replace the placeholder values in your `.env.local` file:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 7. Restart Your Development Server
After updating the environment variables:
```bash
npm run dev
```

## Common Issues and Solutions

### "redirect_uri_mismatch" Error
- Double-check that the redirect URI in Google Cloud Console is exactly: `http://localhost:3000/api/auth/callback/google`
- Make sure there are no trailing slashes or extra characters
- Ensure the protocol is `http://` (not `https://`) for localhost

### "Invalid client" Error
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces or quotes in your .env.local file

### API Not Enabled Error
- Make sure Google+ API and Google Identity API are enabled in your project

## Testing
Once configured correctly:
1. Go to `http://localhost:3000`
2. You should be redirected to `/auth/signin`
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to your app

## Production Setup
For production, you'll need to:
1. Add your production domain to authorized origins
2. Add your production callback URL: `https://yourdomain.com/api/auth/callback/google`
3. Update `NEXTAUTH_URL` in your production environment variables
