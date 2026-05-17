import {SplashScreen, Stack, usePathname, useGlobalSearchParams} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect, useRef} from "react";
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PostHogProvider, PostHogErrorBoundary } from 'posthog-react-native';
import { posthog } from '@/config/posthog';
import {View, Text} from "react-native";

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const entryTime = useRef<number>(Date.now());

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const now = Date.now();

      // Capture $pageleave for the previous screen if it exists
      if (previousPathname.current) {
        const duration = Math.floor((now - entryTime.current) / 1000);
        posthog.capture('$pageleave', {
          screen_name: previousPathname.current,
          duration: duration,
        });
      }

      // Reset entry time for the new screen
      entryTime.current = now;

      // Filter route params to avoid leaking sensitive data
      const sanitizedParams = Object.keys(params).reduce((acc, key) => {
        // Only include specific safe params
        if (['id', 'tab', 'view'].includes(key)) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...sanitizedParams,
      });

      // Capture $pageview to satisfy dashboard completion requirements (often expected by PostHog web dashboards)
      posthog.capture('$pageview', {
        screen_name: pathname,
        ...sanitizedParams,
      });

      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  })

  useEffect(() => {
    // Hide splash only when both fonts and auth are loaded
    if (fontsLoaded && authLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, authLoaded])

  // Don't render app until both are ready
  if (!fontsLoaded || !authLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

function PostHogFallbackComponent({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
      <Text style={{ color: 'red', textAlign: 'center' }}>{error?.message || 'An unexpected error occurred'}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <PostHogErrorBoundary fallback={PostHogFallbackComponent}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <RootLayoutContent />
        </ClerkProvider>
      </PostHogErrorBoundary>
    </PostHogProvider>
  );
}
