# Google OAuth Setup Guide for CryptoBazar

This guide will help you set up Google OAuth authentication for your CryptoBazar application.

## Step 1: Create a Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Name your project "CryptoBazar" (or any name you prefer)
4. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" as the user type (unless you have a Google Workspace account)
3. Fill in the required fields:
   - **App name**: CryptoBazar
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. For scopes, you don't need to add any additional scopes for basic authentication
5. Add test users (your own email) if the app is in testing mode
6. Click "Save and Continue" through all steps

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Name it "CryptoBazar Web Client"
5. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (if you plan to deploy)
6. Click "Create"

## Step 5: Get Your Credentials

After creating the OAuth client, you'll see a modal with:
- **Client ID** (ends with `.apps.googleusercontent.com`)
- **Client Secret** (a random string)

## Step 6: Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

## Step 7: Restart Your Development Server

After updating the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Troubleshooting

### Error: "Error 401: invalid_client"
- Make sure your Client ID and Client Secret are correct
- Verify that the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Restart your development server after changing environment variables

### Error: "Error 400: redirect_uri_mismatch"
- Check that the redirect URI in Google Cloud Console includes the correct port and path
- Make sure there are no trailing slashes in the redirect URI

### Error: "This app isn't verified"
- This is normal for apps in development/testing mode
- Click "Advanced" and then "Go to CryptoBazar (unsafe)" to proceed
- To remove this warning, you need to verify your app with Google (required for production)

## Production Deployment

When deploying to production:
1. Add your production domain to the authorized redirect URIs
2. Update `NEXTAUTH_URL` in your production environment variables
3. Consider verifying your app with Google to remove the "unverified app" warning

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your Client Secret secure and never expose it in client-side code
- Regularly rotate your credentials if needed
- Use different OAuth clients for development and production environments
