// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MotosScreen from './src/screens/MotosScreen';
import AddMotorcycleScreen from './src/screens/AddMotorcycleScreen';
import ManageLocationsScreen from './src/screens/ManageLocationsScreen';
import PatioMapScreen from './src/screens/PatioMapScreen';
import { Colors } from './src/style/Colors';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        headerShown: true,
                        title: 'Mottu Fleet',
                        headerStyle: { backgroundColor: Colors.mottuGreen },
                        headerTintColor: Colors.mottuDark,
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
                <Stack.Screen
                    name="AdicionarMoto"
                    component={AddMotorcycleScreen}
                    options={{
                        headerShown: true,
                        title: 'Adicionar Moto',
                        headerStyle: { backgroundColor: Colors.mottuGreen },
                        headerTintColor: Colors.mottuDark,
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="GerenciarLocalizacoes" 
                    component={ManageLocationsScreen}
                    options={{
                        headerTitle: 'Gerenciar Localizações',
                        headerStyle: { backgroundColor: Colors.mottuDark },
                        headerTintColor: Colors.mottuGreen,
                        headerBackTitleVisible: false,
                    }}
                />
                <Stack.Screen 
                name="MapeamentoPatio" 
                component={PatioMapScreen}
                options={{
                    headerTitle: 'Mapa',
                    headerStyle: { backgroundColor: Colors.mottuDark },
                    headerTintColor: Colors.mottuGreen,
                    headerBackTitleVisible: false,
                }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}