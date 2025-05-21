// src/components/EditMotorcycleModal.js
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput, // Para a localização
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image, // Para exibir a imagem da moto dentro do modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Colors } from '../style/Colors'; // Seu caminho de estilo
import { BIKE_MODELS } from '../config/bikeModels'; // Importar os modelos de moto

const STATUS_OPTIONS = ['Disponível', 'Em Manutenção', 'Alugada', 'Aguardando Revisão'];

function EditMotorcycleModal({ visible, onClose, motorcycle, onSave }) {
    // Usamos estados locais para os valores que podem ser editados no modal
    const [currentStatus, setCurrentStatus] = useState(motorcycle ? motorcycle.status : STATUS_OPTIONS[0]);
    const [currentLocation, setCurrentLocation] = useState(motorcycle ? motorcycle.location : '');
    const [locationError, setLocationError] = useState('');

    // Efeitos para atualizar o estado local quando a prop 'motorcycle' muda (ao abrir o modal para outra moto)
    useEffect(() => {
        if (motorcycle) {
            setCurrentStatus(motorcycle.status);
            setCurrentLocation(motorcycle.location);
            setLocationError(''); // Limpa erros ao reabrir
        }
    }, [motorcycle]);

    // Encontrar a imagem do modelo para exibição no modal
    const bikeModel = BIKE_MODELS.find(model => model.id === motorcycle?.modelId);
    const imageUrl = bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg'); // Imagem padrão

    const validateLocation = (text) => {
        setCurrentLocation(text);
        if (text.trim().length < 5 && text.trim().length > 0) {
            setLocationError('A localização deve ter pelo menos 5 caracteres.');
        } else {
            setLocationError('');
        }
    };

    const handleSave = () => {
        if (currentLocation.trim().length < 5) {
            setLocationError('A localização deve ter pelo menos 5 caracteres.');
            return;
        }
        if (currentStatus === 'Selecione um status') { // Se essa opção estiver visível, validar
            Alert.alert('Erro', 'Por favor, selecione um status válido.');
            return;
        }

        // Chamamos a função onSave passada pela MotosScreen
        // Passamos o ID da moto e os valores atualizados
        onSave(motorcycle.id, {
            status: currentStatus,
            location: currentLocation,
        });
        onClose(); // Fechar o modal
    };

    if (!motorcycle) return null; // Não renderiza nada se não houver moto

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} // Garante que o modal pode ser fechado pelo botão de voltar do Android
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
                    <TextInput
                        style={[modalStyles.input, locationError ? modalStyles.inputError : {}]}
                        placeholder="Localização da moto"
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

// Estilos para o modal (você pode colocar em um arquivo de estilo separado se preferir, mas para começar, aqui está ok)
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)', // Fundo escuro semi-transparente
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
        width: '90%', // Largura responsiva
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