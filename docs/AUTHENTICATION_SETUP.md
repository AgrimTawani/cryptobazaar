# Authentication & Database Setup Guide

## Prerequisites

1. **Neon Database Account**: Create a free account at [neon.tech](https://neon.tech)
2. **Google Cloud Console**: Set up OAuth credentials
3. **Thirdweb Account**: Get your client ID

## Environment Variables Setup

Update your `.env.local` file with the following values:

### 1. Neon Database Setup

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string from your dashboard
4. Replace `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret to `.env.local`:

```env
GOOGLE_CLIENT_ID="your_google_client_id_here.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

### 3. NextAuth Secret

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use an online generator and add to `.env.local`:

```env
NEXTAUTH_SECRET="your_generated_secret_here"
```

### 4. Thirdweb Client ID

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project
3. Copy your Client ID to `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID="your_thirdweb_client_id"
```

### 5. USDC Contract Address

For Polygon Amoy testnet, use:

```env
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS="0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
```

## Database Migration

Once your environment variables are set up, run the database migration:

```bash
npx prisma db push
```

This will create the necessary tables in your Neon database.

## Running the Application

```bash
npm run dev
```

## Authentication Flow

1. **Unauthenticated users** will be redirected to `/auth/signin`
2. **After Google sign-in**, users are redirected to the main dashboard
3. **Only authenticated users** can see the wallet connect button
4. **Wallet connection** works only after successful authentication

## Features

- ✅ Google OAuth authentication
- ✅ Database integration with Neon
- ✅ User session management
- ✅ Wallet connection restricted to authenticated users
- ✅ Modern UI with Framer Motion animations
- ✅ Responsive design with Tailwind CSS

## Troubleshooting

### Common Issues:

1. **Database Connection Error**: Check your `DATABASE_URL` format
2. **Google OAuth Error**: Verify redirect URIs in Google Console
3. **NextAuth Error**: Ensure `NEXTAUTH_SECRET` is set
4. **Wallet Connection Issues**: Check Thirdweb Client ID

### Development Tips:

- Use `console.log` to debug authentication flow
- Check browser network tab for API errors  
- Verify environment variables are loaded correctly
