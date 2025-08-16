# 🚀 How to Use CryptoBazar - Complete Setup & Usage Guide

## 📋 Prerequisites Checklist

Before you can use CryptoBazar, you need to set up several accounts and services:

- [ ] **Google Cloud Console Account** (for OAuth)
- [ ] **Neon Database Account** (for database hosting) 
- [ ] **Thirdweb Account** (for Web3 integration)
- [ ] **MetaMask Wallet** (or another Web3 wallet)
- [ ] **Polygon Amoy Testnet Setup** (for testing)

## 🛠️ Step-by-Step Setup

### Step 1: Set Up Google OAuth

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "CryptoBazar"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
5. **Copy the Client ID and Client Secret**

### Step 2: Set Up Neon Database

1. **Go to Neon**: https://neon.tech
2. **Create a free account** and new project
3. **Get your connection string**:
   - Go to your project dashboard
   - Click "Connection Details"
   - Copy the connection string (starts with `postgresql://`)

### Step 3: Set Up Thirdweb

1. **Go to Thirdweb**: https://thirdweb.com/dashboard
2. **Create account** and new project
3. **Copy your Client ID** from the project dashboard

### Step 4: Configure Environment Variables

Update your `.env.local` file with the real values:

```env
# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_thirdweb_client_id

# USDC Contract Address (Polygon Amoy Testnet)
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database (Neon)
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

### Step 5: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### Step 6: Set Up Database

Run these commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

### Step 7: Start the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📱 How to Use the Website

### 🔐 User Authentication Flow

1. **Visit the website**: Go to http://localhost:3000
2. **Automatic redirect**: You'll be redirected to the sign-in page
3. **Sign in with Google**: Click "Continue with Google"
4. **Google OAuth**: Complete Google authentication
5. **Dashboard access**: You'll be redirected to the main dashboard

### 💰 Wallet Connection & Balance Viewing

1. **After signing in**: You'll see the main dashboard
2. **Connect wallet**: Click the "Connect" button in the top navbar
3. **Choose wallet**: Select MetaMask (or your preferred wallet)
4. **Network setup**: Make sure you're on Polygon Amoy Testnet
5. **View balance**: Your USDC balance will appear in the navbar and dashboard

### 🌐 Setting Up Polygon Amoy Testnet

If you don't have Polygon Amoy testnet set up in MetaMask:

1. **Open MetaMask**
2. **Add network manually**:
   - Network Name: `Polygon Amoy`
   - RPC URL: `https://rpc-amoy.polygon.technology/`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC`
   - Block Explorer: `https://www.oklink.com/amoy`

3. **Get testnet MATIC**: Visit a Polygon Amoy faucet to get test tokens
4. **Get testnet USDC**: Use the USDC faucet for test USDC tokens

## 🎯 Features Available

### ✅ Authenticated Users Can:
- ✨ **Connect Web3 wallets** (MetaMask, WalletConnect, etc.)
- 💰 **View USDC balance** on Polygon Amoy testnet
- 🌐 **See connected blockchain network**
- 👤 **Access personalized dashboard**
- 🔄 **Auto-sync wallet address** with database
- 🚪 **Sign out securely**

### ❌ Unauthenticated Users Cannot:
- ❌ Access the main application
- ❌ Connect wallets
- ❌ View balances
- ❌ Access any wallet features

## 🎨 User Interface Tour

### 🏠 Homepage (Unauthenticated)
- **Hero section** with welcome message
- **Feature cards** showing app capabilities
- **Automatic redirect** to sign-in page

### 🔐 Sign-in Page
- **Clean, modern design** with CryptoBazar branding
- **Google OAuth button** for secure authentication
- **Responsive design** works on all devices

### 📊 Dashboard (Authenticated)
- **Top navbar** with user profile and wallet info
- **Balance display** showing USDC amount
- **Network indicator** showing current blockchain
- **Animated cards** with wallet information
- **Recent activity section** (placeholder for future features)

### 📱 Responsive Design
- **Mobile-friendly** - works on phones and tablets
- **Modern animations** with Framer Motion
- **Beautiful color scheme** - Orange, Red, Blue, White
- **Smooth transitions** and hover effects

## 🚨 Troubleshooting Common Issues

### Issue 1: "Unauthorized" Error
**Solution**: Make sure you're signed in with Google first

### Issue 2: Wallet Won't Connect  
**Solutions**:
- Ensure you're signed in to the app
- Check that MetaMask is installed
- Switch to Polygon Amoy testnet
- Refresh the page

### Issue 3: Balance Shows as 0
**Solutions**:
- Get testnet USDC from a faucet
- Check you're on the correct network (Polygon Amoy)
- Ensure the USDC contract address is correct

### Issue 4: Database Errors
**Solutions**:
- Check your DATABASE_URL is correct
- Run `npx prisma db push` again
- Verify Neon database is accessible

### Issue 5: Google OAuth Fails
**Solutions**:
- Check Google OAuth credentials are correct
- Verify redirect URI is set up properly
- Ensure Google+ API is enabled

## 🔄 Development Workflow

### Making Changes
1. **Edit files** in `src/` directory
2. **Hot reload** automatically updates the page
3. **Check console** for any errors

### Adding New Features
1. **Database changes**: Update `prisma/schema.prisma`
2. **UI changes**: Modify components in `src/components/`
3. **API changes**: Add routes in `src/app/api/`

### Viewing Database
```bash
# Open Prisma Studio to view/edit database
npx prisma studio
```

## 🎉 You're Ready!

Once you've completed the setup steps above, you should have a fully functional CryptoBazar application where:

1. **Users must sign in with Google** before accessing any features
2. **Only authenticated users** can connect wallets
3. **Wallet connections are synced** to the database
4. **USDC balances are displayed** in real-time
5. **Modern, responsive UI** works across all devices

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Review the authentication setup guide in `/docs/AUTHENTICATION_SETUP.md`
3. Verify all environment variables are set correctly
4. Ensure all external services (Google, Neon, Thirdweb) are configured properly

Happy trading! 🚀
