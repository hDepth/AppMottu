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
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
// Se você tem MaterialIcons, pode usar:
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import MotosStyles from '../style/MotosScreen';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';
import EditMotorcycleModal from '../components/EditMotorcycleModal';
import FilterModal from '../components/FilterModal'; // <-- IMPORTAR O NOVO MODAL DE FILTRO

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

// Não precisamos mais de STATUS_FILTERS aqui, pois ele estará no FilterModal

function MotosScreen({ navigation, route }) {
    const [motorcycles, setMotorcycles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Estados para o modal de filtros
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [currentStatusFilter, setCurrentStatusFilter] = useState('Todos');
    const [currentModelFilter, setCurrentModelFilter] = useState('Todos');

    // Estado para a barra de pesquisa
    const [searchText, setSearchText] = useState('');

    // Estados para o modal de edição
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);

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

    const handleUpdateMotorcycle = async (motoId, updatedFields) => {
        try {
            const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
            let motos = storedMotos ? JSON.parse(storedMotos) : [];

            const updatedMotos = motos.map(moto =>
                moto.id === motoId ? { ...moto, ...updatedFields } : moto
            );

            await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(updatedMotos));
            setMotorcycles(updatedMotos);
            Alert.alert('Sucesso', 'Moto atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar moto no AsyncStorage:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a moto. Tente novamente.');
        }
    };


    useFocusEffect(
        useCallback(() => {
            loadMotorcycles();
        }, [])
    );

    // FUNÇÃO ATUALIZADA PARA USAR OS FILTROS DO MODAL
    const getFilteredAndSortedMotorcycles = () => {
        let filtered = motorcycles;

        // 1. Filtrar por Status
        if (currentStatusFilter !== 'Todos') {
            filtered = filtered.filter(moto => moto.status === currentStatusFilter);
        }

        // 2. Filtrar por Modelo
        if (currentModelFilter !== 'Todos') {
            filtered = filtered.filter(moto => moto.modelId === currentModelFilter);
        }

        // 3. Filtrar por Texto de Pesquisa (Placa)
        if (searchText.trim() !== '') {
            const lowerCaseSearchText = searchText.trim().toLowerCase();
            filtered = filtered.filter(moto =>
                moto.licensePlate.toLowerCase().includes(lowerCaseSearchText)
            );
        }

        // 4. Ordenar por Placa
        filtered.sort((a, b) => a.licensePlate.localeCompare(b.licensePlate));

        return filtered;
    };

    const openEditModal = (moto) => {
        setSelectedMotorcycle(moto);
        setIsEditModalVisible(true);
    };

    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setSelectedMotorcycle(null);
    };

    // Funções para abrir/fechar e aplicar filtros do FilterModal
    const openFilterModal = () => setIsFilterModalVisible(true);
    const closeFilterModal = () => setIsFilterModalVisible(false);
    const handleApplyFilters = (status, model) => {
        setCurrentStatusFilter(status);
        setCurrentModelFilter(model);
    };

    const renderMotorcycleItem = ({ item }) => {
        const bikeModel = BIKE_MODELS.find(model => model.id === item.modelId);
        const imageUrl = bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg');

        return (
            <TouchableOpacity
                style={MotosStyles.card}
                onPress={() => openEditModal(item)}
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

                {/* Contêiner da Barra de Pesquisa e Botão de Filtro */}
                <View style={MotosStyles.searchAndFilterContainer}>
                    <TextInput
                        style={MotosStyles.searchInput}
                        placeholder="Buscar por placa..."
                        placeholderTextColor={Colors.mottuLightGray}
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="characters"
                    />
                    {/* Botão para abrir o modal de filtros */}
                    <TouchableOpacity style={MotosStyles.filterButtonIcon} onPress={openFilterModal}>
                        {/* Se tiver MaterialIcons instalado, pode usar: */}
                        {/* <MaterialIcons name="filter-list" size={28} color={Colors.mottuDark} /> */}
                        <Text style={MotosStyles.filterButtonIconText}>Filtros</Text>
                    </TouchableOpacity>
                </View>

                {/* Exibição dos filtros ativos (opcional, pode ser chips menores) */}
                <View style={MotosStyles.activeFiltersContainer}>
                    {currentStatusFilter !== 'Todos' && (
                        <View style={MotosStyles.activeFilterChip}>
                            <Text style={MotosStyles.activeFilterChipText}>{currentStatusFilter}</Text>
                            <TouchableOpacity onPress={() => setCurrentStatusFilter('Todos')} style={MotosStyles.removeFilterButton}>
                                <Text style={MotosStyles.removeFilterText}>x</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {currentModelFilter !== 'Todos' && (
                        <View style={MotosStyles.activeFilterChip}>
                            <Text style={MotosStyles.activeFilterChipText}>{BIKE_MODELS.find(m => m.id === currentModelFilter)?.name || currentModelFilter}</Text>
                            <TouchableOpacity onPress={() => setCurrentModelFilter('Todos')} style={MotosStyles.removeFilterButton}>
                                <Text style={MotosStyles.removeFilterText}>x</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* Exibir mensagem "Filtros Aplicados" se houver algum filtro ativo e nenhum chip for exibido */}
                    {(currentStatusFilter !== 'Todos' || currentModelFilter !== 'Todos') && (
                        currentStatusFilter === 'Todos' && currentModelFilter === 'Todos' && ( // Se todos estiverem 'Todos', mas havia algo antes de 'Limpar'
                            <Text style={MotosStyles.filtersAppliedText}>Filtros aplicados</Text>
                        )
                    )}
                    {currentStatusFilter === 'Todos' && currentModelFilter === 'Todos' && searchText.trim() === '' && (
                        <Text style={MotosStyles.noFiltersText}>Todos os filtros desativados.</Text>
                    )}
                </View>


                <FlatList
                    data={getFilteredAndSortedMotorcycles()}
                    renderItem={renderMotorcycleItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={MotosStyles.listContent}
                    ListEmptyComponent={<Text style={MotosStyles.emptyListText}>Nenhuma moto para exibir com os filtros atuais. Adicione motos ou mude os filtros/pesquisa.</Text>}
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

            <EditMotorcycleModal
                visible={isEditModalVisible}
                onClose={closeEditModal}
                motorcycle={selectedMotorcycle}
                onSave={handleUpdateMotorcycle}
            />

            {/* O NOVO MODAL DE FILTROS É RENDERIZADO AQUI */}
            <FilterModal
                visible={isFilterModalVisible}
                onClose={closeFilterModal}
                onApplyFilters={handleApplyFilters}
                currentStatusFilter={currentStatusFilter}
                currentModelFilter={currentModelFilter}
            />
        </SafeAreaView>
    );
}

export default MotosScreen;