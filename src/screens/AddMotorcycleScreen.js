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
import { useFocusEffect } from '@react-navigation/native';

import AddMotorcycleStyles from '../style/AddMotorcycleScreen';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';
import { scheduleLocalNotification } from '../services/notificationService'; // ✅ Importação do serviço

const STATUS_OPTIONS = [
  'Selecione um status',
  'Disponível',
  'Em Manutenção',
  'Alugada',
  'Aguardando Revisão',
];
const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

function AddMotorcycleScreen({ navigation, route }) {
  const [selectedModelId, setSelectedModelId] = useState('selecione_modelo');
  const [licensePlate, setLicensePlate] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);

  const [selectedPatio, setSelectedPatio] = useState('');
  const [selectedPatioId, setSelectedPatioId] = useState('');
  const [areasOptions, setAreasOptions] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  // Erros
  const [modelError, setModelError] = useState('');
  const [licensePlateError, setLicensePlateError] = useState('');
  const [statusError, setStatusError] = useState('');

  const currentSelectedModel = BIKE_MODELS.find(
    (model) => model.id === selectedModelId
  );
  const modelName = currentSelectedModel ? currentSelectedModel.name : '';
  const modelImage = currentSelectedModel ? currentSelectedModel.image : null;

  useFocusEffect(
    React.useCallback(() => {
      const loadPatioAreas = async () => {
        try {
          if (route.params?.selectedPatio && route.params?.patioId) {
            setSelectedPatio(route.params.selectedPatio);
            setSelectedPatioId(route.params.patioId);

            const AREAS_KEY = `@mottuApp:areas_patio_${route.params.patioId}`;
            const storedAreas = await AsyncStorage.getItem(AREAS_KEY);
            setAreasOptions(storedAreas ? JSON.parse(storedAreas) : []);
            setSelectedAreaId(null);

            navigation.setParams({ selectedPatio: undefined, patioId: undefined });
          }
        } catch (error) {
          console.error('Erro ao carregar áreas do pátio:', error);
          Alert.alert('Erro', 'Não foi possível carregar as áreas.');
        }
      };
      loadPatioAreas();
    }, [route.params?.selectedPatio, route.params?.patioId])
  );

  const handleModelChange = (itemValue) => {
    setSelectedModelId(itemValue);
    setModelError(
      itemValue === 'selecione_modelo'
        ? 'Por favor, selecione um modelo de moto.'
        : ''
    );
  };

  const validateLicensePlate = (text) => {
    const up = text.toUpperCase();
    setLicensePlate(up);
    const plateRegex = /^[A-Z]{3}-\d{4}$/;
    const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
    if (
      up.length > 0 &&
      !plateRegex.test(up) &&
      !mercosulRegex.test(up)
    ) {
      setLicensePlateError(
        'Formato de placa inválido (ex: ABC-1234 ou ABC1D23).'
      );
    } else {
      setLicensePlateError('');
    }
  };

  const handleStatusChange = (itemValue) => {
    setStatus(itemValue);
    setStatusError(
      itemValue === STATUS_OPTIONS[0]
        ? 'Por favor, selecione um status válido.'
        : ''
    );
  };

  const handleSaveMotorcycle = async () => {
    setModelError('');
    setLicensePlateError('');
    setStatusError('');

    let hasError = false;

    if (selectedModelId === 'selecione_modelo') {
      setModelError('Modelo é obrigatório.');
      hasError = true;
    }

    if (!licensePlate.trim()) {
      setLicensePlateError('Placa é obrigatória.');
      hasError = true;
    } else {
      const plateRegex = /^[A-Z]{3}-\d{4}$/;
      const mercosulRegex = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
      if (
        !plateRegex.test(licensePlate) &&
        !mercosulRegex.test(licensePlate)
      ) {
        setLicensePlateError(
          'Formato de placa inválido (ex: ABC-1234 ou ABC1D23).'
        );
        hasError = true;
      }
    }

    if (status === STATUS_OPTIONS[0]) {
      setStatusError('Status é obrigatório.');
      hasError = true;
    }

    if (!selectedPatioId) {
      Alert.alert('Erro', 'Selecione um pátio para cadastrar a moto.');
      hasError = true;
    }

    if (hasError) {
      Alert.alert(
        'Erro de Validação',
        'Por favor, corrija os campos destacados.'
      );
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
        patio: selectedPatio || null,
        patioId: selectedPatioId || null,
        areaId: selectedAreaId || null,
      };

      const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
      let motos = storedMotos ? JSON.parse(storedMotos) : [];

      const plateAlreadyExists = motos.some(
        (moto) => moto.licensePlate === newMotorcycle.licensePlate
      );
      if (plateAlreadyExists) {
        Alert.alert('Erro', 'Já existe uma moto com esta placa.');
        setLoading(false);
        return;
      }

      motos.push(newMotorcycle);
      await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(motos));

      Alert.alert('Sucesso!', 'Moto adicionada com sucesso!');

      // 🔔 Notificação local
      await scheduleLocalNotification({
        title: '🏍️ Nova moto adicionada',
        body: `${modelName} (${licensePlate}) foi adicionada à frota com status "${status}".`,
      });

      // Limpar
      setSelectedModelId('selecione_modelo');
      setLicensePlate('');
      setStatus(STATUS_OPTIONS[0]);
      setSelectedPatio('');
      setSelectedPatioId('');
      setAreasOptions([]);
      setSelectedAreaId(null);

      navigation.navigate('EscolherPatio', { from: 'AdicionarMoto' });
    } catch (error) {
      console.error('Erro ao salvar moto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a moto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={AddMotorcycleStyles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={AddMotorcycleStyles.container}>
          <Text style={AddMotorcycleStyles.headerTitle}>
            Adicionar Nova Moto
          </Text>

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

            {/* Modelo */}
            <Text style={AddMotorcycleStyles.label}>Modelo da Moto:</Text>
            <View
              style={[
                AddMotorcycleStyles.pickerContainer,
                modelError ? AddMotorcycleStyles.inputError : {},
              ]}
            >
              <Picker
                selectedValue={selectedModelId}
                onValueChange={handleModelChange}
                style={AddMotorcycleStyles.picker}
                itemStyle={AddMotorcycleStyles.pickerItem}
              >
                {BIKE_MODELS.map((model) => (
                  <Picker.Item
                    key={model.id}
                    label={model.name}
                    value={model.id}
                  />
                ))}
              </Picker>
            </View>
            {modelError ? (
              <Text style={AddMotorcycleStyles.errorText}>{modelError}</Text>
            ) : null}

            {/* Placa */}
            <Text style={AddMotorcycleStyles.label}>Placa:</Text>
            <TextInput
              style={[
                AddMotorcycleStyles.input,
                licensePlateError ? AddMotorcycleStyles.inputError : {},
              ]}
              placeholder="Ex: ABC-1234 ou ABC1D23"
              placeholderTextColor={Colors.mottuLightGray}
              value={licensePlate}
              onChangeText={validateLicensePlate}
              maxLength={7}
              autoCapitalize="characters"
            />
            {licensePlateError ? (
              <Text style={AddMotorcycleStyles.errorText}>
                {licensePlateError}
              </Text>
            ) : null}

            {/* Status */}
            <Text style={AddMotorcycleStyles.label}>Status:</Text>
            <View
              style={[
                AddMotorcycleStyles.pickerContainer,
                statusError ? AddMotorcycleStyles.inputError : {},
              ]}
            >
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
            {statusError ? (
              <Text style={AddMotorcycleStyles.errorText}>{statusError}</Text>
            ) : null}

            {/* Áreas */}
            {selectedPatioId ? (
              <View style={{ marginBottom: 16 }}>
                <Text style={AddMotorcycleStyles.label}>
                  Área do {selectedPatio}
                </Text>
                {areasOptions.length > 0 ? (
                  <View style={AddMotorcycleStyles.pickerContainer}>
                    <Picker
                      selectedValue={selectedAreaId}
                      onValueChange={(val) => setSelectedAreaId(val)}
                      style={AddMotorcycleStyles.picker}
                      itemStyle={AddMotorcycleStyles.pickerItem}
                    >
                      <Picker.Item label="(Sem área específica)" value={null} />
                      {areasOptions.map((a) => (
                        <Picker.Item key={a.id} label={a.name} value={a.id} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text style={{ color: '#666', marginBottom: 8 }}>
                    Nenhuma área criada neste pátio
                  </Text>
                )}
              </View>
            ) : null}

            {/* Seleção de Pátio */}
            <View
              style={{
                marginTop: 12,
                marginBottom: 6,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#444' }}>
                Pátio: {selectedPatio ? selectedPatio : 'Nenhum selecionado'}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EscolherPatio', {
                    returnTo: 'AdicionarMoto',
                  })
                }
              >
                <Text
                  style={{
                    color: Colors.mottuGreen,
                    fontWeight: '700',
                  }}
                >
                  {selectedPatio ? 'Alterar pátio' : 'Escolher pátio'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botão */}
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
