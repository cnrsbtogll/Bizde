import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useBizde } from '@/store';
import { PairingScreen } from '@/components/PairingScreen';
import { HomeScreen } from '@/components/HomeScreen';

import { colors } from '@/theme/tokens';

export type RootStackParamList = {
  Pairing: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.neutral[50],
    card: colors.white,
    text: colors.neutral[900],
    primary: colors.emerald[600],
  },
};

export default function App() {
  const isPaired = useBizde((s) => s.isPaired);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useBizde.persist?.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = useBizde.persist?.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return () => unsub?.();
  }, []);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.neutral[50], justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.emerald[600]} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.neutral[50] },
        }}
      >
        {isPaired ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
        ) : (
          <Stack.Screen
            name="Pairing"
            component={PairingScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
