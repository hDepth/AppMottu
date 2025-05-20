// src/screens/MotosScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList, // Componente otimizado para listas longas
    TouchableOpacity,
    StyleSheet, // Removendo estilos inline para arquivo separado
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MotosStyles from '../style/MotosScreen'; // Importa os estilos para MotosScreen
import { Colors } from '../style/Colors';

// Dados mockados de exemplo (simulando motos no pátio)
const MOCKED_MOTORCYCLES = [
    { id: '1', model: 'Mottu Sport 110i', licensePlate: 'ABC-1234', status: 'Disponível', location: 'Pátio A - Vaga 12' },
    { id: '2', model: 'Honda Pop 100', licensePlate: 'DEF-5678', status: 'Em Manutenção', location: 'Oficina - Box 3' },
    { id: '3', model: 'Mottu Sport 110i', licensePlate: 'GHI-9012', status: 'Alugada', location: 'Fora do Pátio' },
    { id: '4', model: 'Yamaha Factor 125', licensePlate: 'JKL-3456', status: 'Disponível', location: 'Pátio B - Vaga 5' },
    { id: '5', model: 'Honda Biz 125', licensePlate: 'MNO-7890', status: 'Aguardando Revisão', location: 'Pátio A - Vaga 20' },
];

function MotosScreen({ navigation }) {
    const [motorcycles, setMotorcycles] = useState(MOCKED_MOTORCYCLES); // Estado para a lista de motos

    // Função para renderizar cada item da lista
    const renderMotorcycleItem = ({ item }) => (
        <TouchableOpacity
            style={MotosStyles.card}
            onPress={() => Alert.alert('Detalhes da Moto', `Placa: ${item.licensePlate}\nStatus: ${item.status}\nLocalização: ${item.location}`)}
        >
            <Text style={MotosStyles.cardTitle}>{item.model}</Text>
            <Text style={MotosStyles.cardText}>Placa: {item.licensePlate}</Text>
            <Text style={MotosStyles.cardText}>Status: <Text style={[
                MotosStyles.statusText,
                item.status === 'Disponível' && MotosStyles.statusAvailable,
                item.status === 'Em Manutenção' && MotosStyles.statusMaintenance,
                item.status === 'Alugada' && MotosStyles.statusRented,
            ]}>{item.status}</Text></Text>
            <Text style={MotosStyles.cardText}>Localização: {item.location}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={MotosStyles.safeArea}>
            <View style={MotosStyles.container}>
                <Text style={MotosStyles.headerTitle}>Motos no Pátio</Text>
                <FlatList
                    data={motorcycles}
                    renderItem={renderMotorcycleItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={MotosStyles.listContent}
                    ListEmptyComponent={<Text style={MotosStyles.emptyListText}>Nenhuma moto encontrada.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

export default MotosScreen;