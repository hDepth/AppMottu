// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import HomeStyles from '../style/HomeScreen'; 

function HomeScreen({ navigation }) {
    return (
        <View style={HomeStyles.container}>
            <Text style={HomeStyles.title}>Dashboard do Pátio</Text>
            <Text style={HomeStyles.subtitle}>Gerenciamento de Motos</Text>

            <Button
                title="Ver Motos no Mapa"
                onPress={() => Alert.alert('Navegar para o Mapa', 'Funcionalidade de mapa será implementada aqui.')}
            />
            {/* Futuramente, outros botões e informações como: */}
            {/* <Button title="Listar Todas as Motos" onPress={() => navigation.navigate('MotorcycleList')} /> */}
            {/* <Button title="Adicionar Nova Moto" onPress={() => navigation.navigate('AddMotorcycle')} /> */}
            {/* <Text style={HomeStyles.infoText}>Motos disponíveis: X</Text> */}
            {/* <Text style={HomeStyles.infoText}>Motos em manutenção: Y</Text> */}
        </View>
    );
}

export default HomeScreen;