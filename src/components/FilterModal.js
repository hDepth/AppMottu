// src/components/FilterModal.js
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert, // Para lidar com erros de AsyncStorage
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para carregar as localizações

import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';

const STATUS_FILTERS = ['Todos', 'Disponível', 'Alugada', 'Em Manutenção', 'Aguardando Revisão'];
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations'; // Chave para as localizações salvas

function FilterModal({ visible, onClose, onApplyFilters, currentStatusFilter, currentModelFilter, currentLocationFilter }) { // NOVO: currentLocationFilter
    const [selectedStatus, setSelectedStatus] = useState(currentStatusFilter);
    const [selectedModel, setSelectedModel] = useState(currentModelFilter);
    const [selectedLocation, setSelectedLocation] = useState(currentLocationFilter); // NOVO: Estado para localização
    const [availableLocations, setAvailableLocations] = useState([]); // NOVO: Para as localizações salvas

    // Sincroniza os estados internos do modal com as props passadas
    useEffect(() => {
        setSelectedStatus(currentStatusFilter);
        setSelectedModel(currentModelFilter);
        setSelectedLocation(currentLocationFilter); // Sincroniza o filtro de localização
    }, [currentStatusFilter, currentModelFilter, currentLocationFilter]);

    // NOVO: Carregar localizações disponíveis ao abrir o modal
    useEffect(() => {
        const loadAvailableLocations = async () => {
            try {
                const storedLocations = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
                if (storedLocations) {
                    setAvailableLocations(JSON.parse(storedLocations));
                } else {
                    setAvailableLocations([]);
                }
            } catch (error) {
                console.error('Erro ao carregar localizações para o modal de filtro:', error);
                Alert.alert('Erro', 'Não foi possível carregar as localizações para filtrar.');
            }
        };
        if (visible) { // Carrega apenas quando o modal está visível
            loadAvailableLocations();
        }
    }, [visible]);


    const handleApply = () => {
        onApplyFilters(selectedStatus, selectedModel, selectedLocation); // NOVO: Passa selectedLocation
        onClose();
    };

    const handleClearFilters = () => {
        setSelectedStatus('Todos');
        setSelectedModel('Todos');
        setSelectedLocation('Todos'); // Limpa o filtro de localização
        onApplyFilters('Todos', 'Todos', 'Todos'); // Aplica filtros "Todos" na tela principal
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={filterModalStyles.centeredView}>
                <View style={filterModalStyles.modalView}>
                    <Text style={filterModalStyles.modalTitle}>Filtrar Motos</Text>

                    {/* Filtro por Status */}
                    <Text style={filterModalStyles.sectionTitle}>Status:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={filterModalStyles.chipsContainer}
                    >
                        {STATUS_FILTERS.map((statusOption) => (
                            <TouchableOpacity
                                key={statusOption}
                                style={[
                                    filterModalStyles.chip,
                                    selectedStatus === statusOption && filterModalStyles.chipActive,
                                ]}
                                onPress={() => setSelectedStatus(statusOption)}
                            >
                                <Text style={[
                                    filterModalStyles.chipText,
                                    selectedStatus === statusOption && filterModalStyles.chipTextActive,
                                ]}>
                                    {statusOption}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Filtro por Modelo */}
                    <Text style={filterModalStyles.sectionTitle}>Modelos:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={filterModalStyles.chipsContainer}
                    >
                        <TouchableOpacity
                            key="TodosModelos"
                            style={[
                                filterModalStyles.chip,
                                selectedModel === 'Todos' && filterModalStyles.chipActive,
                            ]}
                            onPress={() => setSelectedModel('Todos')}
                        >
                            <Text style={[
                                filterModalStyles.chipText,
                                selectedModel === 'Todos' && filterModalStyles.chipTextActive,
                            ]}>
                                Todos Modelos
                            </Text>
                        </TouchableOpacity>
                        {BIKE_MODELS.filter(model => model.id !== 'selecione_modelo').map((modelOption) => (
                            <TouchableOpacity
                                key={modelOption.id}
                                style={[
                                    filterModalStyles.chip,
                                    selectedModel === modelOption.id && filterModalStyles.chipActive,
                                ]}
                                onPress={() => setSelectedModel(modelOption.id)}
                            >
                                <Text style={[
                                    filterModalStyles.chipText,
                                    selectedModel === modelOption.id && filterModalStyles.chipTextActive,
                                ]}>
                                    {modelOption.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* NOVO: Filtro por Localização */}
                    <Text style={filterModalStyles.sectionTitle}>Localização:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={filterModalStyles.chipsContainer}
                    >
                        <TouchableOpacity
                            key="TodasLocalizacoes"
                            style={[
                                filterModalStyles.chip,
                                selectedLocation === 'Todos' && filterModalStyles.chipActive,
                            ]}
                            onPress={() => setSelectedLocation('Todos')}
                        >
                            <Text style={[
                                filterModalStyles.chipText,
                                selectedLocation === 'Todos' && filterModalStyles.chipTextActive,
                            ]}>
                                Todas Localizações
                            </Text>
                        </TouchableOpacity>
                        {availableLocations.map((locationOption) => (
                            <TouchableOpacity
                                key={locationOption.id}
                                style={[
                                    filterModalStyles.chip,
                                    selectedLocation === locationOption.name && filterModalStyles.chipActive,
                                ]}
                                onPress={() => setSelectedLocation(locationOption.name)}
                            >
                                <Text style={[
                                    filterModalStyles.chipText,
                                    selectedLocation === locationOption.name && filterModalStyles.chipTextActive,
                                ]}>
                                    {locationOption.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>


                    <View style={filterModalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[filterModalStyles.button, filterModalStyles.buttonClear]}
                            onPress={handleClearFilters}
                        >
                            <Text style={filterModalStyles.buttonText}>Limpar Filtros</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[filterModalStyles.button, filterModalStyles.buttonApply]}
                            onPress={handleApply}
                        >
                            <Text style={filterModalStyles.buttonText}>Aplicar Filtros</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={filterModalStyles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={filterModalStyles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const filterModalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 15, // Bordas mais arredondadas
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        width: '90%', // Responsivo
        maxHeight: '80%', // Limita a altura do modal
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginTop: 15,
    },
    chipsContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        marginBottom: 15,
        alignSelf: 'flex-start', // Alinha os chips à esquerda dentro do modal
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: Colors.mottuLightGray,
        marginRight: 10, // Espaçamento à direita entre os chips
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 90,
    },
    chipActive: {
        backgroundColor: Colors.mottuGreen,
        borderColor: Colors.mottuGreen,
    },
    chipText: {
        color: Colors.mottuDark,
        fontSize: 14,
        fontWeight: '600',
    },
    chipTextActive: {
        color: Colors.mottuDark,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 25,
    },
    button: {
        borderRadius: 10,
        paddingVertical: 12,
        flex: 1,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonClear: {
        backgroundColor: Colors.mottuLightGray,
        borderWidth: 1,
        borderColor: Colors.mottuDark,
    },
    buttonApply: {
        backgroundColor: Colors.mottuGreen,
    },
    buttonText: {
        color: Colors.mottuDark,
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.mottuLightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.mottuDark,
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default FilterModal;