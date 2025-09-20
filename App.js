import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MotosScreen from './src/screens/MotosScreen';
import AddMotorcycleScreen from './src/screens/AddMotorcycleScreen';
import ManageLocationsScreen from './src/screens/ManageLocationsScreen';
import PatioMapScreen from './src/screens/PatioMapScreen';
import { Colors } from './src/style/Colors';
import ChoosePatioScreen from './src/screens/ChoosePatioScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.mottuDark },
        headerTintColor: Colors.mottuGreen,
        tabBarActiveTintColor: Colors.mottuGreen,
        tabBarInactiveTintColor: Colors.mottuLightGray,
        tabBarStyle: { backgroundColor: Colors.mottuDark, borderTopColor: '#333' },
        tabBarIcon: ({ color, size, focused }) => {
          let icon = 'ellipse';
          if (route.name === 'HomeTab') icon = focused ? 'home' : 'home-outline';
          if (route.name === 'Motos') icon = focused ? 'bicycle' : 'bicycle-outline';
          if (route.name === 'Mapa') icon = focused ? 'map' : 'map-outline';
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
              color={Colors.mottuGreen}
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
        options={{ title: 'Patios' }}
      />

      {/* REMOVED EscolherPatio from tabs - now on Stack */}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
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

        {/* EscolherPatio agora está no Stack: pode ser chamado por navigation.navigate('EscolherPatio') */}
        <Stack.Screen
          name="EscolherPatio"
          component={ChoosePatioScreen}
          options={{
            title: 'Escolher Pátio',
            headerStyle: { backgroundColor: Colors.mottuDark },
            headerTintColor: Colors.mottuGreen,
            headerBackTitleVisible: false,
          }}
        />

        <Stack.Screen
          name="AdicionarMoto"
          component={AddMotorcycleScreen}
          options={{
            title: 'Adicionar Moto',
            headerStyle: { backgroundColor: Colors.mottuDark },
            headerTintColor: Colors.mottuGreen,
            headerBackTitleVisible: false,
          }}
        />

        <Stack.Screen
          name="GerenciarLocalizacoes"
          component={ManageLocationsScreen}
          options={{
            title: 'Localizações',
            headerStyle: { backgroundColor: Colors.mottuDark },
            headerTintColor: Colors.mottuGreen,
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
