// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native'; // Usar TouchableOpacity para o botão
import HomeStyles from '../style/HomeScreen';
import { Colors } from '../style/Colors';

function HomeScreen({ navigation }) {
    return (
        <View style={HomeStyles.container}>
            <Text style={HomeStyles.title}>Dashboard do Pátio</Text>
            <Text style={HomeStyles.subtitle}>Gerenciamento de Motos</Text>

            <TouchableOpacity
                style={HomeStyles.button}
                onPress={() => navigation.navigate('Motos')} // Navega para a nova tela 'Motos'
            >
                <Text style={HomeStyles.buttonText}>Ver Motos</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={HomeStyles.button} // Pode usar o mesmo estilo de botão por enquanto
                onPress={() => navigation.navigate('MapeamentoPatio')}
            >
                <Text style={HomeStyles.buttonText}>Ver Motos no Mapa</Text>
            </TouchableOpacity>
        </View>
    );
}

export default HomeScreen;