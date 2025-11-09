// App.js
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MotosScreen from './src/screens/MotosScreen';
import AddMotorcycleScreen from './src/screens/AddMotorcycleScreen';
import ManageLocationsScreen from './src/screens/ManageLocationsScreen';
import PatioMapScreen from './src/screens/PatioMapScreen';
import ChoosePatioScreen from './src/screens/ChoosePatioScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import I18n, { t } from './src/i18n';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme === 'dark' ? '#333' : '#ccc',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon = 'ellipse';
          if (route.name === 'HomeTab') icon = focused ? 'home' : 'home-outline';
          if (route.name === 'Motos') icon = focused ? 'bicycle' : 'bicycle-outline';
          if (route.name === 'Mapa') icon = focused ? 'map' : 'map-outline';
          if (route.name === 'Patios') icon = focused ? 'business' : 'business-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />

      <Tab.Screen
        name="Motos"
        component={MotosScreen}
        options={({ navigation }) => ({
          title: 'Motos',
          headerRight: () => (
            <Ionicons
              name="location-outline"
              size={22}
              color={theme.accent}
              style={{ marginRight: 12 }}
              onPress={() => navigation.navigate('Mapa')}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Mapa"
        component={PatioMapScreen}
        options={{ title: 'Mapa' }}
      />

      <Tab.Screen
        name="Patios"
        component={ChoosePatioScreen}
        options={{ title: 'Pátios' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Tab.Screen
        name="Sobre"
        component={AboutScreen}
        options={{ title: 'Sobre' }}
      />

    </Tab.Navigator>
  );
}

function AppNavigator({ initialRoute }) {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EscolherPatio"
          component={ChoosePatioScreen}
          options={{
            title: 'Escolher Pátio',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerBackTitleVisible: false,
          }}
        />

        <Stack.Screen
          name="AdicionarMoto"
          component={AddMotorcycleScreen}
          options={{
            title: 'Adicionar Moto',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerBackTitleVisible: false,
          }}
        />

        <Stack.Screen
          name="GerenciarLocalizacoes"
          component={ManageLocationsScreen}
          options={{
            title: 'Localizações',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Auth');

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('user');
      setInitialRoute(user ? 'Home' : 'Auth');
    };
    checkUser();
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator initialRoute={initialRoute} />
    </ThemeProvider>
  );
}
