# 🛍️ Too Good To Bot: Automate Your Too Good To Go Experience

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

## 📜 Project Overview

Too Good To Bot is an innovative service that automates interactions with Too Good To Go, the popular surplus food marketplace app. This project offers users real-time notifications for their favorite stores and can even automatically purchase magic bags when they become available!

> ⚠️ **Current Status**: The project no longer works in its current state due to a Datadome update that disrupted axios requests. A fix is likely possible with some modifications.

## 🛠️ Technical Architecture

The project is split into two main folders:
- **Server**: Backend built with Express.js and TypeScript, handling data processing and automation
- **Client**: Frontend built with Next.js

## 🔍 Reverse Engineering Magic

The core magic of this project relied on a deep dive into the Too Good To Go API. Since Too Good To Go doesn't provide a public API, significant reverse engineering was required:

- **API Endpoint Discovery**: By analyzing network traffic from the mobile app, we identified and documented all essential API endpoints
- **Authentication Flow**: Reconstructed the complete authentication flow, including email verification and token refresh logic
- **APK Version Tracking**: Built a system to track the current APK version to maintain compatibility with TGTG servers
- **Datadome Bypass**: Implemented sophisticated techniques to navigate around Datadome protection (before the latest update)
- **Payment Processing**: Reverse-engineered the complex Adyen payment flow to enable automated purchases

## ✨ Key Features

- **🔍 Store Monitoring**: Continuously checks your favorite stores for availability
- **📱 Notifications**: Receive alerts via email when items become available
- **🤖 Auto-Buy**: Automatically purchase magic bags when they match your criteria
- **💳 Subscription Tiers**: Different pricing tiers with varying features and limits
- **👥 User Management**: Complete user authentication and account management

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB database
- SMTP server (for email notifications)
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
```sh
git clone https://github.com/your-username/too-good-to-bot.git
```

2. Set up environment variables:
```
# Copy the example env file
cp server/.example.env server/.env

# Fill in the required variables
PORT=5000
MONGO_USER=your_mongo_username
MONGO_PASSB64=your_mongo_password_in_base64
SMTP_USER=your_gmail_account
SMTP_PASSWORDB64=your_gmail_password_in_base64
DISCORD_WEBHOOK_URL=optional_webhook_for_notifications
JWT_SECRET=your_jwt_secret
STRIPE_PRIVATE=your_stripe_private_key
```

3. Install dependencies:
```sh
cd server
npm install
```

4. Start the server:
```sh
npm start
```

## 📊 API Endpoints

### Authentication

- **POST /api/users/register**
  - Register a new user with email and password
  - Triggers TGTG email verification

- **POST /api/users/validateRegister**
  - Verify the registration using the code sent by TGTG

- **POST /api/users/login**
  - Log in with email and password
  - Returns JWT token

### Favorites

- **GET /api/favorites**
  - Get list of favorite stores
  - Requires JWT authentication

### Reservations (Premium Feature)

- **POST /api/reservation/create**
  - Create automatic buy orders for specific items
  - Limited by subscription tier

- **DELETE /api/reservation/remove/:id**
  - Cancel an existing buy order

- **GET /api/reservation**
  - Get all active buy orders

### User Settings

- **PUT /api/users/setpassword**
  - Update user password

- **POST /api/users/set-notif**
  - Configure notification preferences

- **GET /api/users/refresh-jwt**
  - Refresh JWT token when subscription changes

## 🔄 CRON Jobs

The system uses several CRON jobs to keep everything running smoothly:

- **Favorite Store Scanner**: Periodically checks for changes in favorite stores
- **Buy Order Processor**: Monitors and executes buy orders based on availability
- **Cleanup Job**: Removes outdated data to maintain system performance
- **Notification Dispatcher**: Sends notifications to users based on their subscription tier
- **Subscription Checker**: Manages subscription expiry and downgrades

## 💰 Subscription Tiers

| Feature | FREE | STARTER | PLUS | PRO |
|---------|------|---------|------|-----|
| Favorites Monitoring | ✅ (10) | ✅ (50) | ✅ (80) | ✅ (150) |
| Notifications | ✅ (25/month) | ✅ (Unlimited) | ✅ (Faster) | ✅ (Fastest) |
| Auto-Buy | ❌ | ✅ (4 max, 2 concurrent) | ✅ (Unlimited, 4 concurrent) | ✅ (Unlimited, 10 concurrent) |
| Check Frequency | 60 min | 30 sec | 15 sec | 5 sec |

## 🤯 Notable Technical Achievements

1. **Payment Flow Reconstruction**: Completely reverse-engineered the Adyen payment flow, including card encryption algorithms and security token handling (I hate but somewhat understand smali now)

2. **Datadome Evasion**: Implemented sophisticated browser fingerprinting emulation to bypass Datadome protection

3. **APK Version Auto-Detection**: Built a scraper to automatically extract the latest APK version from Google Play Store

4. **Tiered Execution System**: Created a sophisticated scheduling system that prioritizes premium users

5. **Robust Error Handling**: Comprehensive error recovery mechanisms to handle API rate limits and server errors

## 🔒 Security Notes

- User payment information is never stored on our servers
- We only store the minimum required tokens to interact with TGTG
- JWT tokens are used for secure API authentication

## 📝 License

This project is provided as-is without any explicit license. Use at your own risk and responsibility.

## 🙏 Acknowledgements

This project was only possible due to extensive reverse engineering. Remember to always respect Too Good To Go's terms of service when using this project. (FYI: This project does NOT respect Too Good To Go TOS)


---

**Disclaimer**: This project is not affiliated with Too Good To Go. Use at your own discretion and in accordance with Too Good To Go's terms of service.

<!-- PORTFOLIO_METADATA_START -->
<div align="center">
  <h3>📊 Portfolio Metadata</h3>
  <p><em>This section is used for automatic project information extraction</em></p>
</div>

### 📜 Project Overview

Too Good To Bot is an innovative service that automates interactions with Too Good To Go, the popular surplus food marketplace app. This project offers users real-time notifications for their favorite stores and can even automatically purchase magic bags when they become available!

### 🎯 Key Features
-Continuously checks your favorite stores for availability
-Receive alerts via email when items become available
-Automatically purchase magic bags when they match your criteria
-Different pricing tiers with varying features and limits
-Complete user authentication and account management

### 🛠️ Technology Stack
- TypeScript
- Express.js
- MongoDB
- Nodemailer
- Stripe
- CRON jobs
<!-- PORTFOLIO_METADATA_END -->
