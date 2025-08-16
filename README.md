# CryptoBazar 🚀

A modern, secure cryptocurrency trading platform built with Next.js, NextAuth, Prisma, and Thirdweb.

## ✨ Features

- 🔐 **Secure Authentication**: Google OAuth integration with NextAuth
- 💾 **Database Integration**: PostgreSQL with Prisma ORM and Neon hosting
- 💳 **Wallet Management**: Thirdweb integration for Web3 wallet connections
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS and Framer Motion
- 🔒 **Access Control**: Wallet features only available to authenticated users
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🌈 **Color Palette**: Orange, Red, Blue, and White theme

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with Google Provider  
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Blockchain**: Thirdweb SDK v5 for Web3 integration
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- Neon database account
- Thirdweb account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Fill in all required environment variables in `.env.local`
   - See [Authentication Setup Guide](./docs/AUTHENTICATION_SETUP.md) for details

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- [Authentication Setup Guide](./docs/AUTHENTICATION_SETUP.md) - Complete setup instructions

## 🔐 Authentication Flow

1. **Unauthenticated Access**: Users are redirected to sign-in page
2. **Google OAuth**: Secure authentication via Google  
3. **Session Management**: Persistent sessions with NextAuth
4. **Wallet Access**: Connect wallet only after authentication
5. **Database Sync**: User data and wallet addresses stored securely

---

Made with ❤️ by [Agrim Tawani](https://github.com/agrimtawani)
