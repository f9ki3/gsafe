# Task: Configure app icon and splash screen

## Steps Completed:

- [x] Analyze current project structure and configuration
- [x] Verify image dimensions (1024x1024 - perfect for icons/splash)
- [x] Create implementation plan
- [x] Update app.json with new icon and splash screen configuration
- [x] Update app/\_layout.tsx to handle native splash screen
- [x] Verify expo-splash-screen is installed

## Steps Pending:

- [ ] Test on iOS
- [ ] Test on Android

## Changes Made:

### app.json:

- Changed main app icon from `./assets/images/icon.png` to `./assets/images/app_icon_ios_android.png`
- Updated Android adaptive icon to use `app_icon_ios_android.png` as foreground with dark background (#0d0d0d)
- Added splash screen configuration for both iOS and Android using the same image
- Set resizeMode to "contain" and backgroundColor to #0d0d0d

### app/\_layout.tsx:

- Added `import * as SplashScreen from "expo-splash-screen"`
- Added `SplashScreen.preventAutoHideAsync()` to keep splash visible
- Added useEffect to hide splash screen when app is ready
