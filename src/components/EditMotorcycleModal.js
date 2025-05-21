// src/components/EditMotorcycleModal.js
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert, // Importar Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para carregar localizações
import { Colors } from '../style/Colors'; // Suas cores
import { BIKE_MODELS } from '../config/bikeModels';

const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';

function EditMotorcycleModal({ visible, onClose, motorcycle, onSave, onDelete }) {
    const [editedStatus, setEditedStatus] = useState('');
    const [editedLocation, setEditedLocation] = useState('');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false); // Para alternar entre Picker e TextInput

    useEffect(() => {
        if (motorcycle) {
            setEditedStatus(motorcycle.status);
            setEditedLocation(motorcycle.location || '');
            // Verifica se a localização da moto já existe nas predefinidas
            // se não existir, assume que é uma localização customizada
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
        if (!location) { // Se não tiver localização definida, não é customizada
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
            setIsCustomLocation(false); // Fallback
        }
    };

    const handleSave = () => {
        if (!motorcycle) return;
        onSave(motorcycle.id, {
            status: editedStatus,
            location: editedLocation,
        });
        // Não fechamos o modal aqui, onSave (em MotosScreen) já fará isso após a atualização
    };

    // NOVO: Função para lidar com a exclusão (chama a prop onDelete)
    const handleDelete = () => {
        if (!motorcycle) return;
        onDelete(motorcycle.id); // Chama a função de exclusão passada por prop
    };

    // Imagem da moto no modal (reutilizando a lógica da MotosScreen)
    const getBikeImage = () => {
        if (!motorcycle) return require('../assets/Mottu 110i.jpg'); // Imagem padrão
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
                        <Image
                            source={getBikeImage()}
                            style={modalStyles.motorcycleImage}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={modalStyles.label}>Modelo: {motorcycle?.model}</Text>
                    <Text style={modalStyles.label}>Placa: {motorcycle?.licensePlate}</Text>

                    <Text style={modalStyles.label}>Status:</Text>
                    <View style={modalStyles.pickerContainer}>
                        <Picker
                            selectedValue={editedStatus}
                            onValueChange={(itemValue) => setEditedStatus(itemValue)}
                            style={modalStyles.picker}
                            itemStyle={modalStyles.pickerItem}
                            mode="dropdown"
                        >
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
                                    setEditedLocation(''); // Limpa para nova entrada
                                } else {
                                    setIsCustomLocation(false);
                                    setEditedLocation(itemValue);
                                }
                            }}
                            style={modalStyles.picker}
                            itemStyle={modalStyles.pickerItem}
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
                            placeholder="Nova Localização (Ex: Pátio A vaga 52)"
                            placeholderTextColor={Colors.mottuLightGray}
                            value={editedLocation}
                            onChangeText={setEditedLocation}
                            autoCapitalize="words"
                        />
                    )}
                    {/* Se a localização atual da moto não estiver nas predefinidas e não for customizada, mostra o input */}
                    {!isCustomLocation && motorcycle?.location && !availableLocations.some(loc => loc.name === motorcycle.location) && (
                        <TextInput
                            style={modalStyles.input}
                            value={motorcycle.location}
                            editable={false} // Não editável, apenas exibido
                            placeholderTextColor={Colors.mottuLightGray}
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

                    {/* NOVO: Botão de Excluir */}
                    <TouchableOpacity style={modalStyles.deleteButton} onPress={handleDelete}>
                        <Text style={modalStyles.deleteButtonText}>Excluir Moto</Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// Estilos para o EditMotorcycleModal
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        resizeMode: 'cover',
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
        overflow: 'hidden', // Para garantir que o Picker respeite o borderRadius
    },
    picker: {
        width: '100%',
        color: Colors.mottuDark, // Cor do texto selecionado
    },
    pickerItem: {
        color: Colors.mottuDark, // Cor do texto das opções no iOS
    },
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
    cancelButtonText: {
        color: Colors.mottuDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: Colors.mottuGreen,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.mottuDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // NOVO: Estilos para o botão de exclusão no modal
    deleteButton: {
        backgroundColor: Colors.mottuRed, // Cor vermelha para exclusão
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 25,
        width: '100%', // Largura total
        alignItems: 'center',
        marginTop: 15, // Espaçamento superior
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    deleteButtonText: {
        color: Colors.mottuWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditMotorcycleModal;