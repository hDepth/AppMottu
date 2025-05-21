// src/screens/AddMotorcycleScreen.js
import React, { useState, useEffect } from 'react'; // Adicionado useEffect
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
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations'; // Nova chave para as localizações

function AddMotorcycleScreen({ navigation }) { // <--- AQUI COMEÇA O ESCOPO DO COMPONENTE
    const [selectedModelId, setSelectedModelId] = useState('selecione_modelo');
    const [licensePlate, setLicensePlate] = useState('');
    const [status, setStatus] = useState(STATUS_OPTIONS[0]);
    const [location, setLocation] = useState(''); // Estado para a localização
    const [loading, setLoading] = useState(false);
    const [availableLocations, setAvailableLocations] = useState([]); // NOVO: Estado para armazenar as localizações disponíveis

    // Erros
    const [modelError, setModelError] = useState('');
    const [licensePlateError, setLicensePlateError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [locationError, setLocationError] = useState('');

    const currentSelectedModel = BIKE_MODELS.find(model => model.id === selectedModelId);
    const modelName = currentSelectedModel ? currentSelectedModel.name : '';
    const modelImage = currentSelectedModel ? currentSelectedModel.image : null;

    // NOVO: Carregar localizações ao montar o componente
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
                console.error('Erro ao carregar localizações para a tela de adição:', error);
                Alert.alert('Erro', 'Não foi possível carregar as localizações salvas.');
            }
        };
        loadAvailableLocations();
    }, []); // Array de dependências vazio para rodar apenas na montagem

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
        // Ajustado para permitir tanto o formato antigo quanto o Mercosul
        const plateRegex = /^[A-Z]{3}-\d{4}$/;
        const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/; // Permite número ou letra na 4ª posição

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

    const handleLocationChange = (value) => { // Unificado para o Picker e TextInput
        setLocation(value);
        if (value.trim().length < 3 && value.trim().length > 0) { // Mínimo de 3 caracteres para localização
            setLocationError('A localização deve ter pelo menos 3 caracteres.');
        } else {
            setLocationError('');
        }
    };

    // <--- MOVA ESTA FUNÇÃO PARA DENTRO DO ESCOPO DO COMPONENTE
    const handleSaveMotorcycle = async () => {
        // Resetar erros
        setModelError('');
        setLicensePlateError('');
        setStatusError('');
        setLocationError('');

        let hasError = false;

        if (selectedModelId === 'selecione_modelo') { setModelError('Modelo é obrigatório.'); hasError = true; }

        if (!licensePlate.trim()) { setLicensePlateError('Placa é obrigatória.'); hasError = true; }
        else {
            const plateRegex = /^[A-Z]{3}-\d{4}$/;
            const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/; // Permite número ou letra na 4ª posição
            if (!plateRegex.test(licensePlate) && !mercosulRegex.test(licensePlate)) {
                setLicensePlateError('Formato de placa inválido (ex: ABC-1234 ou ABC1D23).'); hasError = true;
            }
        }

        if (status === STATUS_OPTIONS[0]) { setStatusError('Status é obrigatório.'); hasError = true; }
        
        // NOVO: Validação da localização para ser pelo menos 3 caracteres
        if (!location.trim()) { setLocationError('Localização é obrigatória.'); hasError = true; }
        else if (location.trim().length < 3) { setLocationError('A localização deve ter pelo menos 3 caracteres.'); hasError = true; }


        if (hasError) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados.');
            return;
        }

        setLoading(true);
        try {
            const trimmedLocation = location.trim(); // Limpa espaços em branco

            // NOVO: Se a localização digitada não existe na lista, adicione-a
            const locationExists = availableLocations.some(loc => loc.name.toLowerCase() === trimmedLocation.toLowerCase());
            if (trimmedLocation !== '' && !locationExists) {
                const newLocationEntry = {
                    id: Date.now().toString(), // ID único para a nova localização
                    name: trimmedLocation,
                };
                const updatedLocations = [...availableLocations, newLocationEntry];
                await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedLocations));
                setAvailableLocations(updatedLocations); // Atualiza a lista de locais em memória
            }

            const newMotorcycle = {
                id: Date.now().toString(),
                modelId: selectedModelId,
                model: modelName,
                licensePlate,
                status,
                location: trimmedLocation, // Garante que a localização esteja limpa
            };

            const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
            let motos = storedMotos ? JSON.parse(storedMotos) : [];

            // NOVO: Verificar se a placa já existe
            const plateAlreadyExists = motos.some(moto => moto.licensePlate === newMotorcycle.licensePlate);
            if (plateAlreadyExists) {
                Alert.alert('Erro', 'Já existe uma moto cadastrada com esta placa.');
                setLoading(false);
                return;
            }

            motos.push(newMotorcycle);
            await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));

            Alert.alert('Sucesso!', 'Moto adicionada e salva localmente!');

            // Limpar formulário
            setSelectedModelId('selecione_modelo');
            setLicensePlate('');
            setStatus(STATUS_OPTIONS[0]);
            setLocation(''); // Limpa a localização também

            navigation.navigate('Motos', { refresh: true }); // Pode ser útil para atualizar a lista na tela de motos

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
                            maxLength={7} // Limita o tamanho para placas (antigas e mercosul são até 7)
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

                        {/* NOVO: Campo de Localização com Picker e TextInput (mantendo estilos) */}
                        <Text style={AddMotorcycleStyles.label}>Localização:</Text>
                        {availableLocations.length > 0 && ( // Mostra o picker se houver localizações salvas
                            <View style={[AddMotorcycleStyles.pickerContainer, locationError ? AddMotorcycleStyles.inputError : {}]}>
                                <Picker
                                    selectedValue={location}
                                    onValueChange={(itemValue) => handleLocationChange(itemValue)}
                                    style={AddMotorcycleStyles.picker}
                                    itemStyle={AddMotorcycleStyles.pickerItem}
                                >
                                    <Picker.Item label="-- Selecione uma localização --" value="" />
                                    {availableLocations.map(loc => (
                                        <Picker.Item key={loc.id} label={loc.name} value={loc.name} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                        {/* O TextInput sempre aparece, mas com placeholder ajustado */}
                        <TextInput
                            style={[
                                AddMotorcycleStyles.input,
                                locationError ? AddMotorcycleStyles.inputError : {},
                                // Adiciona margem superior se o Picker estiver visível para separar
                                availableLocations.length > 0 ? { marginTop: 10 } : {}
                            ]}
                            placeholder={availableLocations.length > 0 ? "Ou digite uma nova localização" : "Ex: Pátio A - Vaga 10"}
                            placeholderTextColor={Colors.mottuLightGray}
                            value={location}
                            onChangeText={handleLocationChange}
                        />
                        {locationError ? <Text style={AddMotorcycleStyles.errorText}>{locationError}</Text> : null}

                        <TouchableOpacity
                            style={AddMotorcycleStyles.button}
                            onPress={handleSaveMotorcycle}
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