# Ecomify Mobile Applications

Native mobile applications built with React Native and Expo.

## 📱 Applications

### Merchant App
Store management on the go:
- Dashboard with metrics
- Order management
- Product management
- Push notifications
- Biometric authentication

### Customer App
Shopping experience:
- Product browsing
- Shopping cart
- Secure checkout
- Order tracking
- User account

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac only) or Android Studio
- Physical device with Expo Go app (recommended for testing)

### Installation

```bash
# Install dependencies
npm install

# Start Merchant app
npm run merchant:start

# Start Customer app
npm run customer:start
```

### Running on Devices

#### iOS Simulator (Mac only)
```bash
npm run merchant:ios
# or
npm run customer:ios
```

#### Android Emulator
```bash
npm run merchant:android
# or
npm run customer:android
```

#### Physical Device
1. Install Expo Go from App Store or Play Store
2. Run `npm run merchant:start` or `npm run customer:start`
3. Scan QR code with camera (iOS) or Expo Go app (Android)

## 🗂️ Project Structure

```
mobile/
├── apps/
│   ├── merchant/           # Merchant app
│   │   ├── src/
│   │   │   ├── screens/    # Screen components
│   │   │   ├── navigation/ # Navigation setup
│   │   │   ├── components/ # App components
│   │   │   └── features/   # Feature modules
│   │   ├── assets/         # App assets
│   │   └── App.tsx         # Entry point
│   │
│   └── customer/           # Customer app
│       ├── src/
│       ├── assets/
│       └── App.tsx
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── api/                # API client
│   ├── core/               # Core utilities
│   ├── store/              # Redux store
│   ├── hooks/              # React hooks
│   └── types/              # TypeScript types
│
├── package.json
└── tsconfig.json
```

## 🎨 Tech Stack

- **Framework**: React Native 0.72
- **Navigation**: Expo Router / React Navigation
- **State**: Redux Toolkit + React Query
- **API**: Axios
- **UI**: React Native Paper / Native Base
- **TypeScript**: Strict mode

## 📱 Features

### Merchant App
- ✅ Biometric authentication
- ✅ Dashboard with real-time metrics
- ✅ Order management
- ✅ Product management with camera
- ✅ Push notifications
- ✅ Offline mode

### Customer App
- ✅ Product browsing
- ✅ Search and filters
- ✅ Shopping cart
- ✅ Secure checkout (Stripe)
- ✅ Order tracking
- ✅ User account

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## 📦 Building

### Development Build

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

## 🚀 Deployment

### App Store (iOS)

```bash
eas submit --platform ios
```

### Play Store (Android)

```bash
eas submit --platform android
```

## 🔐 Environment Variables

Create `.env` file in each app:

```bash
cd apps/merchant && cp .env.example .env
cd ../customer && cp .env.example .env
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter
5. Submit a pull request

## 📝 License

MIT
