// src/components/EditMotorcycleModal.js
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';
import { updateMoto, deleteMoto } from '../services/api';

const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';
const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

function EditMotorcycleModal({ visible, onClose, motorcycle }) {
    const [editedStatus, setEditedStatus] = useState('');
    const [editedLocation, setEditedLocation] = useState('');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false);

    useEffect(() => {
        if (motorcycle) {
            setEditedStatus(motorcycle.status);
            setEditedLocation(motorcycle.location || '');
            checkAndSetCustomLocation(motorcycle.location);
        }
        loadLocations();
    }, [motorcycle]);

    const loadLocations = async () => {
        try {
            const storedLocations = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
            const locations = storedLocations ? JSON.parse(storedLocations) : [];
            setAvailableLocations(locations);
        } catch (error) {
            console.error('Erro ao carregar localizações:', error);
        }
    };

    const checkAndSetCustomLocation = async (location) => {
        if (!location) {
            setIsCustomLocation(false);
            return;
        }
        try {
            const storedLocations = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
            const locations = storedLocations ? JSON.parse(storedLocations) : [];
            const exists = locations.some(loc => loc.name === location);
            setIsCustomLocation(!exists);
        } catch (error) {
            console.error('Erro ao verificar localização customizada:', error);
            setIsCustomLocation(false);
        }
    };

    const handleSave = async () => {
        if (!motorcycle) return;

        try {
            // 🔹 Tenta atualizar na API
            await updateMoto(motorcycle.id, {
                ...motorcycle,
                status: editedStatus,
                location: editedLocation,
            });
            Alert.alert('Sucesso', 'Moto atualizada com sucesso!');
        } catch (apiError) {
            console.error('Erro na API ao atualizar moto:', apiError);
            // 🔹 Fallback no AsyncStorage
            try {
                const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
                let motos = storedMotos ? JSON.parse(storedMotos) : [];
                motos = motos.map(m => (m.id === motorcycle.id ? { ...m, status: editedStatus, location: editedLocation } : m));
                await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));
                Alert.alert('Aviso', 'API indisponível. Moto atualizada localmente.');
            } catch (storageError) {
                console.error('Erro ao atualizar moto no AsyncStorage:', storageError);
                Alert.alert('Erro', 'Não foi possível atualizar a moto.');
            }
        } finally {
            onClose();
        }
    };

    const handleDelete = async () => {
        if (!motorcycle) return;

        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir esta moto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 🔹 Tenta excluir na API
                            await deleteMoto(motorcycle.id);
                            Alert.alert('Sucesso', 'Moto excluída com sucesso!');
                        } catch (apiError) {
                            console.error('Erro na API ao excluir moto:', apiError);
                            // 🔹 Fallback no AsyncStorage
                            try {
                                const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
                                let motos = storedMotos ? JSON.parse(storedMotos) : [];
                                motos = motos.filter(m => m.id !== motorcycle.id);
                                await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));
                                Alert.alert('Aviso', 'API indisponível. Moto excluída localmente.');
                            } catch (storageError) {
                                console.error('Erro ao excluir moto no AsyncStorage:', storageError);
                                Alert.alert('Erro', 'Não foi possível excluir a moto.');
                            }
                        } finally {
                            onClose();
                        }
                    }
                }
            ]
        );
    };

    const getBikeImage = () => {
        if (!motorcycle) return require('../assets/Mottu 110i.jpg');
        const bikeModel = BIKE_MODELS.find(model => model.id === motorcycle.modelId);
        return bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={modalStyles.centeredView}
            >
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Editar Moto</Text>

                    <View style={modalStyles.imageContainer}>
                        <Image source={getBikeImage()} style={modalStyles.motorcycleImage} resizeMode="cover" />
                    </View>

                    <Text style={modalStyles.label}>Modelo: {motorcycle?.model}</Text>
                    <Text style={modalStyles.label}>Placa: {motorcycle?.licensePlate}</Text>

                    <Text style={modalStyles.label}>Status:</Text>
                    <View style={modalStyles.pickerContainer}>
                        <Picker selectedValue={editedStatus} onValueChange={setEditedStatus} style={modalStyles.picker} mode="dropdown">
                            <Picker.Item label="Disponível" value="Disponível" />
                            <Picker.Item label="Em Manutenção" value="Em Manutenção" />
                            <Picker.Item label="Alugada" value="Alugada" />
                            <Picker.Item label="Aguardando Revisão" value="Aguardando Revisão" />
                        </Picker>
                    </View>

                    <Text style={modalStyles.label}>Localização:</Text>
                    <View style={modalStyles.pickerContainer}>
                        <Picker
                            selectedValue={editedLocation}
                            onValueChange={(itemValue) => {
                                if (itemValue === "custom") {
                                    setIsCustomLocation(true);
                                    setEditedLocation('');
                                } else {
                                    setIsCustomLocation(false);
                                    setEditedLocation(itemValue);
                                }
                            }}
                            style={modalStyles.picker}
                            mode="dropdown"
                        >
                            <Picker.Item label="-- Selecione ou digite --" value="" />
                            {availableLocations.map((loc, index) => (
                                <Picker.Item key={index} label={loc.name} value={loc.name} />
                            ))}
                            <Picker.Item label="Adicionar nova localização..." value="custom" />
                        </Picker>
                    </View>

                    {isCustomLocation && (
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Nova Localização"
                            placeholderTextColor={Colors.mottuLightGray}
                            value={editedLocation}
                            onChangeText={setEditedLocation}
                        />
                    )}

                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
                            <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
                            <Text style={modalStyles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={modalStyles.deleteButton} onPress={handleDelete}>
                        <Text style={modalStyles.deleteButtonText}>Excluir Moto</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '90%',
        backgroundColor: Colors.mottuWhite,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 20,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
        backgroundColor: Colors.mottuGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    motorcycleImage: {
        width: '100%',
        height: '100%',
    },
    label: {
        fontSize: 16,
        color: Colors.mottuDark,
        alignSelf: 'flex-start',
        marginBottom: 5,
        marginTop: 10,
        fontWeight: '600',
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: Colors.mottuLightGray,
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: { width: '100%', color: Colors.mottuDark },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.mottuLightGray,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: Colors.mottuDark,
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: Colors.mottuGray,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    cancelButtonText: { color: Colors.mottuDark, fontSize: 16, fontWeight: 'bold' },
    saveButton: {
        backgroundColor: Colors.mottuGreen,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    saveButtonText: { color: Colors.mottuDark, fontSize: 16, fontWeight: 'bold' },
    deleteButton: {
        backgroundColor: Colors.mottuRed,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: '100%',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    deleteButtonText: { color: Colors.mottuWhite, fontSize: 16, fontWeight: 'bold' },
});

export default EditMotorcycleModal;
