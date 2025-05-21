// src/screens/AddMotorcycleScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AddMotorcycleStyles from '../style/AddMotorcycleScreen'; // Seu caminho de estilo
import { Colors } from '../style/Colors'; // Seu caminho de estilo
import { BIKE_MODELS } from '../config/bikeModels';

const STATUS_OPTIONS = ['Selecione um status', 'Disponível', 'Em Manutenção', 'Alugada', 'Aguardando Revisão'];
const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

function AddMotorcycleScreen({ navigation }) { // <--- AQUI COMEÇA O ESCOPO DO COMPONENTE
    const [selectedModelId, setSelectedModelId] = useState('selecione_modelo');
    const [licensePlate, setLicensePlate] = useState('');
    const [status, setStatus] = useState(STATUS_OPTIONS[0]);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    // Erros
    const [modelError, setModelError] = useState('');
    const [licensePlateError, setLicensePlateError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [locationError, setLocationError] = useState('');

    const currentSelectedModel = BIKE_MODELS.find(model => model.id === selectedModelId);
    const modelName = currentSelectedModel ? currentSelectedModel.name : '';
    const modelImage = currentSelectedModel ? currentSelectedModel.image : null;

    const handleModelChange = (itemValue) => {
        setSelectedModelId(itemValue);
        if (itemValue === 'selecione_modelo') {
            setModelError('Por favor, selecione um modelo de moto.');
        } else {
            setModelError('');
        }
    };

    const validateLicensePlate = (text) => {
        setLicensePlate(text.toUpperCase());
        const plateRegex = /^[A-Z]{3}-\d{4}$/;
        const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

        if (text.length > 0 && !plateRegex.test(text) && !mercosulRegex.test(text)) {
            setLicensePlateError('Formato de placa inválido (ex: ABC-1234 ou ABC1D23).');
        } else {
            setLicensePlateError('');
        }
    };

    const handleStatusChange = (itemValue) => {
        setStatus(itemValue);
        if (itemValue === STATUS_OPTIONS[0]) {
            setStatusError('Por favor, selecione um status válido.');
        } else {
            setStatusError('');
        }
    };

    const validateLocation = (text) => {
        setLocation(text);
        if (text.trim().length < 5 && text.trim().length > 0) {
            setLocationError('A localização deve ter pelo menos 5 caracteres.');
        } else {
            setLocationError('');
        }
    };

    // <--- MOVA ESTA FUNÇÃO PARA DENTRO DO ESCOPO DO COMPONENTE
    const handleSaveMotorcycle = async () => {
        setModelError('');
        setLicensePlateError('');
        setStatusError('');
        setLocationError('');

        let hasError = false;

        if (selectedModelId === 'selecione_modelo') { setModelError('Modelo é obrigatório.'); hasError = true; }

        if (!licensePlate.trim()) { setLicensePlateError('Placa é obrigatória.'); hasError = true; }
        else {
            const plateRegex = /^[A-Z]{3}-\d{4}$/;
            const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;
            if (!plateRegex.test(licensePlate) && !mercosulRegex.test(licensePlate)) {
                setLicensePlateError('Formato de placa inválido (ex: ABC-1234 ou ABC1D23).'); hasError = true;
            }
        }

        if (status === STATUS_OPTIONS[0]) { setStatusError('Status é obrigatório.'); hasError = true; }
        if (!location.trim()) { setLocationError('Localização é obrigatória.'); hasError = true; }
        else if (location.trim().length < 5) { setLocationError('A localização deve ter pelo menos 5 caracteres.'); hasError = true; }

        if (hasError) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados.');
            return;
        }

        setLoading(true);
        try {
            const newMotorcycle = {
                id: Date.now().toString(),
                modelId: selectedModelId,
                model: modelName, 
                licensePlate,
                status,
                location,
            };

            const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
            let motos = storedMotos ? JSON.parse(storedMotos) : [];

            motos.push(newMotorcycle);
            await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));

            Alert.alert('Sucesso!', 'Moto adicionada e salva localmente!');

            // Limpar formulário
            setSelectedModelId('selecione_modelo');
            setLicensePlate('');
            setStatus(STATUS_OPTIONS[0]);
            setLocation('');

            navigation.navigate('Motos', { refresh: true });

        } catch (error) {
            console.error('Erro ao salvar moto com AsyncStorage:', error);
            Alert.alert('Erro', 'Não foi possível salvar a moto localmente. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }; // <--- FIM DA FUNÇÃO handleSaveMotorcycle

    return (
        <SafeAreaView style={AddMotorcycleStyles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={AddMotorcycleStyles.container}>
                    <Text style={AddMotorcycleStyles.headerTitle}>Adicionar Nova Moto</Text>

                    <View style={AddMotorcycleStyles.formContainer}>
                        {modelImage && (
                            <View style={AddMotorcycleStyles.selectedImageContainer}>
                                <Image
                                    source={modelImage}
                                    style={AddMotorcycleStyles.selectedMotorcycleImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        <Text style={AddMotorcycleStyles.label}>Modelo da Moto:</Text>
                        <View style={[AddMotorcycleStyles.pickerContainer, modelError ? AddMotorcycleStyles.inputError : {}]}>
                            <Picker
                                selectedValue={selectedModelId}
                                onValueChange={handleModelChange}
                                style={AddMotorcycleStyles.picker}
                                itemStyle={AddMotorcycleStyles.pickerItem}
                            >
                                {BIKE_MODELS.map((model) => (
                                    <Picker.Item key={model.id} label={model.name} value={model.id} />
                                ))}
                            </Picker>
                        </View>
                        {modelError ? <Text style={AddMotorcycleStyles.errorText}>{modelError}</Text> : null}

                        <Text style={AddMotorcycleStyles.label}>Placa:</Text>
                        <TextInput
                            style={[AddMotorcycleStyles.input, licensePlateError ? AddMotorcycleStyles.inputError : {}]}
                            placeholder="Ex: ABC-1234 ou ABC1D23"
                            placeholderTextColor={Colors.mottuLightGray}
                            value={licensePlate}
                            onChangeText={validateLicensePlate}
                            autoCapitalize="characters"
                        />
                        {licensePlateError ? <Text style={AddMotorcycleStyles.errorText}>{licensePlateError}</Text> : null}

                        <Text style={AddMotorcycleStyles.label}>Status:</Text>
                        <View style={[AddMotorcycleStyles.pickerContainer, statusError ? AddMotorcycleStyles.inputError : {}]}>
                            <Picker
                                selectedValue={status}
                                onValueChange={handleStatusChange}
                                style={AddMotorcycleStyles.picker}
                                itemStyle={AddMotorcycleStyles.pickerItem}
                            >
                                {STATUS_OPTIONS.map((opt, index) => (
                                    <Picker.Item key={index} label={opt} value={opt} />
                                ))}
                            </Picker>
                        </View>
                        {statusError ? <Text style={AddMotorcycleStyles.errorText}>{statusError}</Text> : null}

                        <Text style={AddMotorcycleStyles.label}>Localização:</Text>
                        <TextInput
                            style={[AddMotorcycleStyles.input, locationError ? AddMotorcycleStyles.inputError : {}]}
                            placeholder="Ex: Pátio A - Vaga 10"
                            placeholderTextColor={Colors.mottuLightGray}
                            value={location}
                            onChangeText={validateLocation}
                        />
                        {locationError ? <Text style={AddMotorcycleStyles.errorText}>{locationError}</Text> : null}

                        <TouchableOpacity
                            style={AddMotorcycleStyles.button}
                            onPress={handleSaveMotorcycle} // Agora handleSaveMotorcycle está no escopo
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.mottuDark} size="small" />
                            ) : (
                                <Text style={AddMotorcycleStyles.buttonText}>Salvar Moto</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default AddMotorcycleScreen;