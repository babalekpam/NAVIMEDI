# Carnet Mobile App - iOS & Android Build Guide

## Overview
The Carnet patient app is now configured as a native mobile application for both iOS and Android platforms using Capacitor. This allows patients to download and install the app from their respective app stores.

## App Configuration
- **App ID**: `com.navimed.carnet`
- **App Name**: Carnet - Private Health App
- **Platform**: iOS and Android native apps
- **Category**: Health & Fitness / Medical
- **Privacy**: Secure patient authentication with complete data isolation

## Build Process

### Prerequisites
1. **iOS Development** (requires macOS):
   - Xcode 12+ installed
   - Apple Developer Program account ($99/year)
   - iOS Simulator for testing

2. **Android Development**:
   - Android Studio installed
   - Google Play Developer account ($25 one-time)
   - Android SDK and build tools

### Build Commands
```bash
# Build web assets first
npm run build

# Sync to mobile platforms  
npx cap sync

# Open in development environments
npx cap open ios      # Opens Xcode
npx cap open android   # Opens Android Studio

# Build for distribution
npx cap build ios --release
npx cap build android --release
```

### Quick Build Script
Run the automated build script:
```bash
./build-mobile.sh
```

## App Store Submission

### iOS App Store
1. Open `ios/App/App.xcworkspace` in Xcode
2. Configure signing with your Apple Developer account
3. Archive and validate the app
4. Submit through Xcode or App Store Connect

### Google Play Store
1. Build signed APK using Android Studio
2. Upload `android/app/build/outputs/apk/release/app-release.apk`
3. Complete Play Console listing with:
   - App description emphasizing patient privacy
   - Screenshots of key features
   - Privacy policy URL
   - Content rating for medical apps

## Key Features for App Store Listings

### App Description
"Carnet is your private healthcare companion app. Securely manage your health information, connect with your chosen hospital and doctors, view medications, schedule appointments, and access test results - all with complete privacy and data isolation."

### Key Features:
- 🔐 **Complete Privacy**: Each patient has isolated access to only their own health data
- 🏥 **Hospital Integration**: Link to your chosen hospital and assigned doctors
- 💊 **Medication Management**: Track prescriptions and medication schedules  
- 📅 **Appointment Booking**: Schedule visits with your healthcare providers
- 📊 **Health Records**: Access lab results, vital signs, and medical history
- 💬 **Secure Messaging**: Communicate directly with your care team
- 📱 **Offline Support**: Access key information without internet connection
- 🌍 **Multi-Language**: Available in multiple languages
- 🔔 **Smart Notifications**: Medication reminders and appointment alerts

### Privacy & Security
- End-to-end encryption for all patient communications
- HIPAA-compliant data handling
- Role-based access controls
- Audit logging for all data access
- No cross-patient data visibility
- Secure authentication with hospital verification

## Development URLs
- **Web Version**: `/mobile-app`
- **Patient Login**: `/patient-login`
- **Deep Link**: `carnet://mobile-app`

## File Structure
```
├── capacitor.config.json          # Main Capacitor configuration
├── ios/                           # iOS native project
│   └── App/App.xcworkspace       # Xcode workspace
├── android/                       # Android native project
│   └── app/build.gradle          # Android build configuration  
├── build-mobile.sh               # Automated build script
└── mobile-app-guide.md          # This guide
```

## Testing
- **iOS Simulator**: `npx cap run ios`
- **Android Emulator**: `npx cap run android`
- **Live Reload**: `npx cap run ios --livereload`

## Distribution Checklist
- [ ] Web app builds successfully (`npm run build`)
- [ ] Mobile sync completes (`npx cap sync`)
- [ ] iOS app opens in Xcode without errors
- [ ] Android app opens in Android Studio without errors
- [ ] App icons are properly configured (192x192, 512x512)
- [ ] Privacy permissions are declared
- [ ] Deep linking works correctly
- [ ] Patient authentication functions properly
- [ ] Offline mode works as expected
- [ ] Push notifications are configured
- [ ] App store metadata is complete

## Support
- **Patient Support**: Help patients download and set up the app
- **Healthcare Provider Training**: Guide hospitals on patient app integration
- **Technical Issues**: Monitor app store reviews and user feedback

The Carnet mobile app provides patients with secure, private access to their healthcare information while maintaining complete data isolation and hospital integration.