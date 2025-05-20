// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from './src/style/Colors';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MotosScreen from './src/screens/MotosScreen'

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth">
                <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerShown: true, // Mostra o cabeçalho para a Home
                        title: 'Mottu Fleet', // Título do cabeçalho
                        headerStyle: { backgroundColor: Colors.mottuGreen }, // Cor de fundo do cabeçalho
                        headerTintColor: Colors.mottuDark, // Cor do texto do cabeçalho
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="Motos"
                    component={MotosScreen}
                    options={{
                        headerShown: true,
                        title: 'Motos',
                        headerStyle: { backgroundColor: Colors.mottuGreen },
                        headerTintColor: Colors.mottuDark,
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}