import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useBizde } from '@/store';
import { PairingScreen } from '@/components/PairingScreen';
import { HomeScreen } from '@/components/HomeScreen';

export type RootStackParamList = {
  Pairing: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
  },
};

export default function App() {
  const isPaired = useBizde((s) => s.isPaired);

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
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
