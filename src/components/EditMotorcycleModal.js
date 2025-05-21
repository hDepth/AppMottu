import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert, // Para exibir alertas
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para carregar e salvar localizações

import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';

const STATUS_OPTIONS = ['Disponível', 'Em Manutenção', 'Alugada', 'Aguardando Revisão'];
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations'; // Chave para as localizações

function EditMotorcycleModal({ visible, onClose, motorcycle, onSave }) {
    const [currentStatus, setCurrentStatus] = useState(motorcycle ? motorcycle.status : STATUS_OPTIONS[0]);
    const [currentLocation, setCurrentLocation] = useState(motorcycle ? motorcycle.location : '');
    const [locationError, setLocationError] = useState('');
    const [availableLocations, setAvailableLocations] = useState([]); 

    useEffect(() => {
        if (motorcycle) {
            setCurrentStatus(motorcycle.status);
            setCurrentLocation(motorcycle.location);
            setLocationError('');
        }
    }, [motorcycle]);


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
                console.error('Erro ao carregar localizações para o modal:', error);
            }
        };
        if (visible) { // Carrega apenas quando o modal está visível
            loadAvailableLocations();
        }
    }, [visible]);


    const bikeModel = BIKE_MODELS.find(model => model.id === motorcycle?.modelId);
    const imageUrl = bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg');

    const validateLocation = (text) => {
        setCurrentLocation(text);
        if (text.trim().length < 3 && text.trim().length > 0) { 
            setLocationError('A localização deve ter pelo menos 3 caracteres.');
        } else {
            setLocationError('');
        }
    };

    const handleSave = async () => { // Função agora é assíncrona
        if (currentLocation.trim().length < 3) {
            setLocationError('A localização deve ter pelo menos 3 caracteres.');
            return;
        }
        if (currentStatus === 'Selecione um status') {
            Alert.alert('Erro', 'Por favor, selecione um status válido.');
            return;
        }


        const trimmedLocation = currentLocation.trim();
        const locationExists = availableLocations.some(loc => loc.name.toLowerCase() === trimmedLocation.toLowerCase());

        if (trimmedLocation !== '' && !locationExists) {
            const newLocation = {
                id: Date.now().toString(),
                name: trimmedLocation,
            };
            try {
                const updatedLocations = [...availableLocations, newLocation];
                await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedLocations));
                setAvailableLocations(updatedLocations); // Atualiza a lista de locais no modal
            } catch (error) {
                console.error('Erro ao salvar nova localização do modal:', error);
                Alert.alert('Erro', 'Não foi possível salvar a nova localização.');
                return; // Impede o salvamento da moto se a localização não puder ser salva
            }
        }

        onSave(motorcycle.id, {
            status: currentStatus,
            location: trimmedLocation, // Usa a localização validada/adicionada
        });
        onClose();
    };

    if (!motorcycle) return null;

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
                        <Image
                            source={imageUrl}
                            style={modalStyles.motorcycleImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={modalStyles.motoInfoText}>Modelo: {motorcycle.model}</Text>
                    <Text style={modalStyles.motoInfoText}>Placa: {motorcycle.licensePlate}</Text>

                    <Text style={modalStyles.label}>Status:</Text>
                    <View style={modalStyles.pickerContainer}>
                        <Picker
                            selectedValue={currentStatus}
                            onValueChange={(itemValue) => setCurrentStatus(itemValue)}
                            style={modalStyles.picker}
                            itemStyle={modalStyles.pickerItem}
                        >
                            {STATUS_OPTIONS.map((opt, index) => (
                                <Picker.Item key={index} label={opt} value={opt} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={modalStyles.label}>Localização:</Text>
                    {/* Picker para localizações pré-definidas */}
                    {availableLocations.length > 0 && (
                        <View style={modalStyles.pickerContainer}>
                            <Picker
                                selectedValue={currentLocation}
                                onValueChange={(itemValue) => setCurrentLocation(itemValue)}
                                style={modalStyles.picker}
                                itemStyle={modalStyles.pickerItem}
                            >
                                <Picker.Item label="-- Selecione ou digite --" value="" />
                                {availableLocations.map(loc => (
                                    <Picker.Item key={loc.id} label={loc.name} value={loc.name} />
                                ))}
                            </Picker>
                        </View>
                    )}
                    {/* Campo de texto para digitar, se necessário ou se não houver opções */}
                    <TextInput
                        style={[modalStyles.input, locationError ? modalStyles.inputError : {}]}
                        placeholder="Digite ou selecione a localização..."
                        placeholderTextColor={Colors.mottuLightGray}
                        value={currentLocation}
                        onChangeText={validateLocation}
                    />
                    {locationError ? <Text style={modalStyles.errorText}>{locationError}</Text> : null}

                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonClose]}
                            onPress={onClose}
                        >
                            <Text style={modalStyles.textStyle}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonSave]}
                            onPress={handleSave}
                        >
                            <Text style={modalStyles.textStyle}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 20,
    },
    imageContainer: {
        width: '80%',
        height: 120,
        marginBottom: 15,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: Colors.mottuLightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    motorcycleImage: {
        width: '100%',
        height: '100%',
    },
    motoInfoText: {
        fontSize: 16,
        color: Colors.mottuDark,
        marginBottom: 5,
        textAlign: 'left',
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: Colors.mottuDark,
        marginBottom: 5,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginTop: 15,
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: Colors.mottuWhite,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
        marginBottom: 15, 
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        color: Colors.mottuDark,
        height: 50,
    },
    pickerItem: {
        color: Colors.mottuDark,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
        color: Colors.mottuDark,
        fontSize: 16,
    },
    inputError: {
        borderColor: Colors.mottuError,
        borderWidth: 2,
    },
    errorText: {
        color: Colors.mottuError,
        fontSize: 12,
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginLeft: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: Colors.mottuLightGray,
    },
    buttonSave: {
        backgroundColor: Colors.mottuGreen,
    },
    textStyle: {
        color: Colors.mottuDark,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default EditMotorcycleModal;