import React, { useState, useEffect } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

import AddMotorcycleStyles from '../style/AddMotorcycleScreen';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';

const STATUS_OPTIONS = ['Selecione um status', 'Disponível', 'Em Manutenção', 'Alugada', 'Aguardando Revisão'];
const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';

function AddMotorcycleScreen({ navigation }) {
  const [selectedModelId, setSelectedModelId] = useState('selecione_modelo');
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Erros
  const [modelError, setModelError] = useState('');
  const [licensePlateError, setLicensePlateError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [locationError, setLocationError] = useState('');

  const currentSelectedModel = BIKE_MODELS.find(model => model.id === selectedModelId);
  const modelName = currentSelectedModel ? currentSelectedModel.name : '';
  const modelImage = currentSelectedModel ? currentSelectedModel.image : null;

  // Reload locations when screen focuses (so newly created areas appear)
  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );

  const handleModelChange = (itemValue) => {
    setSelectedModelId(itemValue);
    if (itemValue === 'selecione_modelo') setModelError('Por favor, selecione um modelo de moto.');
    else setModelError('');
  };

  const validateLicensePlate = (text) => {
    const up = text.toUpperCase();
    setLicensePlate(up);
    const plateRegex = /^[A-Z]{3}-\d{4}$/;
    const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
    if (up.length > 0 && !plateRegex.test(up) && !mercosulRegex.test(up)) setLicensePlateError('Formato de placa inválido (ex: ABC-1234 ou ABC1D23).');
    else setLicensePlateError('');
  };

  const handleStatusChange = (itemValue) => {
    setStatus(itemValue);
    if (itemValue === STATUS_OPTIONS[0]) setStatusError('Por favor, selecione um status válido.');
    else setStatusError('');
  };

  const handleLocationChange = (value) => {
    setLocation(value);
    if (!value) setLocationError('Por favor, selecione uma área criada ou crie uma nova.');
    else setLocationError('');
  };

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
      const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
      if (!plateRegex.test(licensePlate) && !mercosulRegex.test(licensePlate)) { setLicensePlateError('Formato de placa inválido (ex: ABC-1234 ou ABC1D23).'); hasError = true; }
    }

    if (status === STATUS_OPTIONS[0]) { setStatusError('Status é obrigatório.'); hasError = true; }

    
    if (!location || location.trim() === '') { setLocationError('Selecione uma área criada ou crie uma nova no Pátio.'); hasError = true; }

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
        location: location.trim(), // store area name
      };

      const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
      let motos = storedMotos ? JSON.parse(storedMotos) : [];

      const plateAlreadyExists = motos.some(moto => moto.licensePlate === newMotorcycle.licensePlate);
      if (plateAlreadyExists) {
        Alert.alert('Erro', 'Já existe uma moto cadastrada com esta placa.');
        setLoading(false);
        return;
      }

      motos.push(newMotorcycle);
      await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));

      Alert.alert('Sucesso!', 'Moto adicionada e vinculada à área selecionada!');

      // Limpar formulário
      setSelectedModelId('selecione_modelo');
      setLicensePlate('');
      setStatus(STATUS_OPTIONS[0]);
      setLocation('');

      navigation.navigate('Mapa', { refresh: true });

    } catch (error) {
      console.error('Erro ao salvar moto com AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível salvar a moto localmente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={AddMotorcycleStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={AddMotorcycleStyles.container}>
          <Text style={AddMotorcycleStyles.headerTitle}>Adicionar Nova Moto</Text>

          <View style={AddMotorcycleStyles.formContainer}>
            {modelImage && (
              <View style={AddMotorcycleStyles.selectedImageContainer}>
                <Image source={modelImage} style={AddMotorcycleStyles.selectedMotorcycleImage} resizeMode="contain" />
              </View>
            )}

            <Text style={AddMotorcycleStyles.label}>Modelo da Moto:</Text>
            <View style={[AddMotorcycleStyles.pickerContainer, modelError ? AddMotorcycleStyles.inputError : {}]}>
              <Picker selectedValue={selectedModelId} onValueChange={handleModelChange} style={AddMotorcycleStyles.picker} itemStyle={AddMotorcycleStyles.pickerItem}>
                {BIKE_MODELS.map((model) => (<Picker.Item key={model.id} label={model.name} value={model.id} />))}
              </Picker>
            </View>
            {modelError ? <Text style={AddMotorcycleStyles.errorText}>{modelError}</Text> : null}

            <Text style={AddMotorcycleStyles.label}>Placa:</Text>
            <TextInput style={[AddMotorcycleStyles.input, licensePlateError ? AddMotorcycleStyles.inputError : {}]} placeholder="Ex: ABC-1234 ou ABC1D23" placeholderTextColor={Colors.mottuLightGray} value={licensePlate} onChangeText={validateLicensePlate} maxLength={7} autoCapitalize="characters" />
            {licensePlateError ? <Text style={AddMotorcycleStyles.errorText}>{licensePlateError}</Text> : null}

            <Text style={AddMotorcycleStyles.label}>Status:</Text>
            <View style={[AddMotorcycleStyles.pickerContainer, statusError ? AddMotorcycleStyles.inputError : {}]}>
              <Picker selectedValue={status} onValueChange={handleStatusChange} style={AddMotorcycleStyles.picker} itemStyle={AddMotorcycleStyles.pickerItem}>
                {STATUS_OPTIONS.map((opt, index) => (<Picker.Item key={index} label={opt} value={opt} />))}
              </Picker>
            </View>
            {statusError ? <Text style={AddMotorcycleStyles.errorText}>{statusError}</Text> : null}

            <Text style={AddMotorcycleStyles.label}>Área do Pátio:</Text>
            {availableLocations.length === 0 ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: '#666', marginBottom: 8 }}>Nenhuma área criada ainda.</Text>
                <TouchableOpacity style={[AddMotorcycleStyles.button, { backgroundColor: '#ffdd57' }]} onPress={() => navigation.navigate('Mapa')}>
                  <Text style={{ color: '#000', fontWeight: '700' }}>Criar área no Pátio</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[AddMotorcycleStyles.pickerContainer, locationError ? AddMotorcycleStyles.inputError : {}]}>
                <Picker selectedValue={location} onValueChange={(v) => handleLocationChange(v)} style={AddMotorcycleStyles.picker} itemStyle={AddMotorcycleStyles.pickerItem}>
                  <Picker.Item label="-- Selecione uma área --" value="" />
                  {availableLocations.map(loc => (<Picker.Item key={loc.id} label={loc.name} value={loc.name} />))}
                </Picker>
              </View>
            )}
            {locationError ? <Text style={AddMotorcycleStyles.errorText}>{locationError}</Text> : null}

            <TouchableOpacity style={AddMotorcycleStyles.button} onPress={handleSaveMotorcycle} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.mottuDark} size="small" /> : <Text style={AddMotorcycleStyles.buttonText}>Salvar Moto</Text>}
            </TouchableOpacity>

            <View style={{ marginTop: 12 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Mapa')}>
                <Text style={{ color: Colors.mottuGreen, fontWeight: '700' }}>Criar/Editar Áreas do Pátio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AddMotorcycleScreen;