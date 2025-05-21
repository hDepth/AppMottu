// src/screens/ManageLocationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import ManageLocationsStyles from '../style/ManageLocationsScreen';
import { Colors } from '../style/Colors'; 

const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';

function ManageLocationsScreen({ navigation }) {
    const [locations, setLocations] = useState([]);
    const [newLocationName, setNewLocationName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadLocations = async () => {
        setRefreshing(true);
        try {
            const storedLocations = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
            if (storedLocations) {
                setLocations(JSON.parse(storedLocations));
            }
        } catch (error) {
            console.error('Erro ao carregar localizações do AsyncStorage:', error);
            Alert.alert('Erro', 'Não foi possível carregar as localizações salvas.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddLocation = async () => {
        if (newLocationName.trim() === '') {
            Alert.alert('Erro', 'O nome da localização não pode ser vazio.');
            return;
        }
        if (locations.some(loc => loc.name.toLowerCase() === newLocationName.trim().toLowerCase())) {
            Alert.alert('Erro', 'Esta localização já existe.');
            return;
        }

        const newLocation = {
            id: Date.now().toString(),
            name: newLocationName.trim(),
        };

        try {
            const updatedLocations = [...locations, newLocation];
            await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedLocations));
            setLocations(updatedLocations);
            setNewLocationName('');
            Alert.alert('Sucesso', 'Localização adicionada!');
        } catch (error) {
            console.error('Erro ao salvar nova localização:', error);
            Alert.alert('Erro', 'Não foi possível adicionar a localização.');
        }
    };

    const handleDeleteLocation = (id) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta localização? Motos atribuídas a ela podem não ter uma localização válida.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            const updatedLocations = locations.filter(loc => loc.id !== id);
                            await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedLocations));
                            setLocations(updatedLocations);
                            Alert.alert('Sucesso', 'Localização excluída!');
                        } catch (error) {
                            console.error('Erro ao excluir localização:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a localização.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadLocations();
        }, [])
    );

    const renderLocationItem = ({ item }) => (
        <View style={ManageLocationsStyles.locationCard}> 
            <Text style={ManageLocationsStyles.locationName}>{item.name}</Text> 
            <TouchableOpacity
                style={ManageLocationsStyles.deleteButton}
                onPress={() => handleDeleteLocation(item.id)}>
                <Text style={ManageLocationsStyles.deleteButtonText}>Excluir</Text> 
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={ManageLocationsStyles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={ManageLocationsStyles.container} 
            >
                <Text style={ManageLocationsStyles.headerTitle}>Gerenciar Localizações</Text> 

                <View style={ManageLocationsStyles.inputContainer}> 
                    <TextInput
                        style={ManageLocationsStyles.input} 
                        placeholder="Nome da nova localização (Ex: Setor A)"
                        placeholderTextColor={Colors.mottuLightGray}
                        value={newLocationName}
                        onChangeText={setNewLocationName}
                    />
                    <TouchableOpacity
                        style={ManageLocationsStyles.addButton} 
                        onPress={handleAddLocation}
                    >
                        <Text style={ManageLocationsStyles.addButtonText}>Adicionar</Text> 
                    </TouchableOpacity>
                </View>

                <Text style={ManageLocationsStyles.listTitle}>Localizações Existentes:</Text>
                <FlatList
                    data={locations}
                    renderItem={renderLocationItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={ManageLocationsStyles.listContent}
                    ListEmptyComponent={<Text style={ManageLocationsStyles.emptyListText}>Nenhuma localização adicionada ainda.</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={loadLocations}
                            tintColor={Colors.mottuGreen}
                            colors={[Colors.mottuGreen]}
                        />
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ManageLocationsScreen;