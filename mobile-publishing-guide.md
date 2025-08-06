# Carnet Mobile App Publishing Guide

## Current Status
- ✅ Carnet PWA fully functional with all features
- ✅ Capacitor framework configured for native app conversion
- ✅ iOS and Android build configurations ready
- ❌ Apps not yet published to app stores

## Publishing Process

### 1. iOS App Store (Apple)

#### Prerequisites
- **Apple Developer Account**: $99/year
- **Xcode**: Latest version (Mac required)
- **App Store Connect access**

#### Steps to Publish:
1. **Build iOS App**
   ```bash
   npm run build:ios
   npx cap open ios
   ```

2. **Prepare App Store Listing**
   - App Name: "Carnet - Patient Health Portal"
   - Description: Complete patient access with appointments, records, lab results
   - Keywords: healthcare, patient portal, medical records, appointments
   - Screenshots: iPhone and iPad screenshots
   - App Icon: Professional medical icon (1024x1024px)

3. **Submit for Review**
   - Upload to App Store Connect
   - Fill out metadata and compliance
   - Submit for Apple review (7-14 days)

#### Required Assets for iOS:
- App Icon (multiple sizes)
- Launch Screen images
- iPhone screenshots (6.5", 5.5")
- iPad screenshots (12.9", 11")
- Privacy policy URL
- App description and keywords

### 2. Google Play Store (Android)

#### Prerequisites
- **Google Play Console Account**: $25 one-time fee
- **Android Studio**: Latest version
- **Signed APK/AAB**

#### Steps to Publish:
1. **Build Android App**
   ```bash
   npm run build:android
   npx cap open android
   ```

2. **Prepare Play Store Listing**
   - App Name: "Carnet - Patient Health Portal"
   - Short Description: Secure patient portal for healthcare management
   - Full Description: Complete feature overview
   - Screenshots: Phone and tablet screenshots
   - Feature Graphic: 1024x500px promotional image

3. **Submit for Review**
   - Upload signed APK/AAB
   - Complete store listing
   - Submit for Google review (1-3 days)

#### Required Assets for Android:
- App Icon (512x512px)
- Feature Graphic (1024x500px)
- Phone screenshots (minimum 2)
- Tablet screenshots (if supporting tablets)
- Privacy policy URL

## Current Workaround Solutions

### Option 1: Direct APK Distribution
- Build signed APK files
- Host download links on NaviMED platform
- Users can install directly (Android only)
- Requires "Allow unknown sources" setting

### Option 2: Beta Testing Programs
- **TestFlight (iOS)**: Internal testing with up to 100 users
- **Google Play Internal Testing**: Closed testing group
- Share test links with hospital patients

### Option 3: Progressive Web App (PWA)
- Current solution - works immediately
- Add to home screen functionality
- Offline capabilities
- No app store approval needed

## Immediate Action Items

### 1. Complete App Store Preparation
- [ ] Design professional app icons
- [ ] Create marketing screenshots
- [ ] Write app store descriptions
- [ ] Set up developer accounts
- [ ] Generate signed builds

### 2. Quick Launch Strategy
- [ ] Enable PWA "Add to Home Screen" prompts
- [ ] Create installation guide for patients
- [ ] Set up beta testing programs
- [ ] Prepare direct download links

### 3. Legal Requirements
- [ ] Create privacy policy
- [ ] Terms of service
- [ ] HIPAA compliance documentation
- [ ] Medical device regulations review

## Timeline Estimate

### Immediate (1-2 weeks):
- PWA optimization and installation guides
- Beta testing setup
- Asset creation

### Short-term (1-2 months):
- App store submissions
- Review and approval process
- Public launch

### Long-term (3-6 months):
- User feedback integration
- Feature updates
- Marketing and adoption

## Cost Breakdown

### Developer Accounts:
- Apple Developer: $99/year
- Google Play Console: $25 one-time

### Optional Services:
- Professional app icon design: $50-200
- Marketing materials: $100-500
- Legal review: $500-2000

## Technical Requirements

### iOS Build Requirements:
- macOS with Xcode
- iOS deployment target: iOS 13+
- Code signing certificates
- Provisioning profiles

### Android Build Requirements:
- Android SDK
- Keystore for app signing
- Target API level 31+
- Google Play requirements compliance

## Next Steps

1. **Immediate**: Enable better PWA installation experience
2. **Week 1**: Set up developer accounts
3. **Week 2**: Create app store assets
4. **Week 3-4**: Build and test native apps
5. **Week 4-6**: Submit to app stores
6. **Week 6-8**: Handle review feedback and launch