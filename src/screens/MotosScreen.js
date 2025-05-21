// src/screens/MotosScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Image,
    ScrollView, // Pode ser útil para a barra de filtros se tiver muitos status
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import MotosStyles from '../style/MotosScreen';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';
// Definir as opções de status que serão usadas para os filtros
const STATUS_FILTERS = ['Todos', 'Disponível', 'Alugada', 'Em Manutenção', 'Aguardando Revisão'];

function MotosScreen({ navigation, route }) {
    const [motorcycles, setMotorcycles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    // Novo estado para o filtro de status selecionado
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');

    const loadMotorcycles = async () => {
        setRefreshing(true);
        try {
            const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
            if (storedMotos) {
                setMotorcycles(JSON.parse(storedMotos));
            } else {
                setMotorcycles([]);
            }
        } catch (error) {
            console.error('Erro ao carregar motos do AsyncStorage:', error);
            Alert.alert('Erro', 'Não foi possível carregar as motos salvas localmente.');
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadMotorcycles();
        }, [])
    );

    // Função para filtrar e ordenar as motos
    const getFilteredAndSortedMotorcycles = () => {
        let filtered = motorcycles;

        // 1. Filtrar
        if (selectedStatusFilter !== 'Todos') {
            filtered = motorcycles.filter(moto => moto.status === selectedStatusFilter);
        }

        // 2. Ordenar por placa
        // Usamos localeCompare para ordenação de strings, que é mais robusta.
        filtered.sort((a, b) => a.licensePlate.localeCompare(b.licensePlate));

        return filtered;
    };

    const renderMotorcycleItem = ({ item }) => {
        const bikeModel = BIKE_MODELS.find(model => model.id === item.modelId);
        const imageUrl = bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg'); // Imagem padrão se não encontrar

        return (
            <TouchableOpacity
                style={MotosStyles.card}
                onPress={() => Alert.alert(
                    'Detalhes da Moto',
                    `Modelo: ${item.model}\nPlaca: ${item.licensePlate}\nStatus: ${item.status}\nLocalização: ${item.location}`
                )}
            >
                <View style={MotosStyles.imageContainer}>
                    <Image
                        source={imageUrl}
                        style={MotosStyles.motorcycleImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={MotosStyles.detailsContainer}>
                    <Text style={MotosStyles.cardTitle}>{item.model}</Text>
                    <Text style={MotosStyles.cardSubtitle}>Placa: {item.licensePlate}</Text>
                    <Text style={MotosStyles.cardText}>Local: {item.location}</Text>
                    <View style={MotosStyles.statusBadgeContainer}>
                        <Text style={[
                            MotosStyles.statusBadge,
                            item.status === 'Disponível' && MotosStyles.statusAvailable,
                            item.status === 'Em Manutenção' && MotosStyles.statusMaintenance,
                            item.status === 'Alugada' && MotosStyles.statusRented,
                            item.status === 'Aguardando Revisão' && MotosStyles.statusPending,
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={MotosStyles.safeArea}>
            <View style={MotosStyles.container}>
                <Text style={MotosStyles.headerTitle}>Frota de Motos</Text>

                {/* BARRA DE FILTROS DE STATUS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={MotosStyles.filterButtonsContainer}
                >
                    {STATUS_FILTERS.map((statusOption) => (
                        <TouchableOpacity
                            key={statusOption}
                            style={[
                                MotosStyles.filterButton,
                                selectedStatusFilter === statusOption && MotosStyles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedStatusFilter(statusOption)}
                        >
                            <Text style={[
                                MotosStyles.filterButtonText,
                                selectedStatusFilter === statusOption && MotosStyles.filterButtonTextActive,
                            ]}>
                                {statusOption}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={getFilteredAndSortedMotorcycles()} // <-- AGORA USARÁ A LISTA FILTRADA E ORDENADA
                    renderItem={renderMotorcycleItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={MotosStyles.listContent}
                    ListEmptyComponent={<Text style={MotosStyles.emptyListText}>Nenhuma moto para exibir com o filtro atual. Adicione motos ou mude o filtro.</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={loadMotorcycles}
                            tintColor={Colors.mottuGreen}
                            colors={[Colors.mottuGreen]}
                        />
                    }
                />
                <TouchableOpacity
                    style={MotosStyles.fab}
                    onPress={() => navigation.navigate('AdicionarMoto')}
                >
                    <Text style={MotosStyles.fabText}>+</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default MotosScreen;