// src/screens/PatioMapScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import PatioMapStyles from '../style/PatioMapScreen'; // Estilos para esta tela
import { Colors } from '../style/Colors'; // Suas cores

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

function PatioMapScreen({ navigation }) {
    const [locationsData, setLocationsData] = useState([]); // Dados das localizações com contagem de motos
    const [refreshing, setRefreshing] = useState(false);

    const loadPatioData = async () => {
        setRefreshing(true);
        try {
            const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
            const motos = storedMotos ? JSON.parse(storedMotos) : [];

            // Agrupar motos por localização
            const groupedByLocation = motos.reduce((acc, moto) => {
                const locationName = moto.location || 'Sem Localização'; // Caso a moto não tenha localização
                if (!acc[locationName]) {
                    acc[locationName] = {
                        name: locationName,
                        count: 0,
                        motos: [], // Opcional: para passar os detalhes das motos
                    };
                }
                acc[locationName].count++;
                acc[locationName].motos.push(moto);
                return acc;
            }, {});

            // Transformar o objeto em um array para a FlatList
            const dataArray = Object.values(groupedByLocation).sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            setLocationsData(dataArray);
        } catch (error) {
            console.error('Erro ao carregar dados do pátio:', error);
            Alert.alert('Erro', 'Não foi possível carregar o mapa do pátio.');
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPatioData();
        }, [])
    );

    const handlePressLocation = (locationName) => {
        // Navegar para a tela de Motos e aplicar o filtro de localização
        navigation.navigate('Motos', {
            screen: 'MotosScreen', // Certifique-se de que é o nome da tela principal da pilha
            params: { initialLocationFilter: locationName },
        });
        Alert.alert('Localização', `Você tocou em ${locationName}.`);
        // Aqui você pode expandir para mostrar as motos dessa localização
        // ou navegar para uma tela de detalhes já filtrada.
    };

    const renderLocationCard = ({ item }) => (
        <TouchableOpacity
            style={PatioMapStyles.locationCard}
            onPress={() => handlePressLocation(item.name)}
        >
            <Text style={PatioMapStyles.locationName}>{item.name}</Text>
            <Text style={PatioMapStyles.motorcycleCount}>{item.count} motos</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={PatioMapStyles.safeArea}>
            <View style={PatioMapStyles.container}>
                <Text style={PatioMapStyles.headerTitle}>Mapeamento do Pátio</Text>

                <Text style={PatioMapStyles.descriptionText}>
                    Visualize a distribuição das motos pelas zonas do pátio.
                </Text>

                <FlatList
                    data={locationsData}
                    renderItem={renderLocationCard}
                    keyExtractor={item => item.name}
                    contentContainerStyle={PatioMapStyles.listContent}
                    ListEmptyComponent={
                        <Text style={PatioMapStyles.emptyListText}>
                            Nenhuma localização com motos cadastrada ainda.
                        </Text>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={loadPatioData}
                            tintColor={Colors.mottuGreen}
                            colors={[Colors.mottuGreen]}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
}

export default PatioMapScreen;