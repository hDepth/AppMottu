// src/screens/MotosScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import MotosStyles from '../style/MotosScreen';
import { Colors } from '../style/Colors';
import { BIKE_MODELS } from '../config/bikeModels';
import EditMotorcycleModal from '../components/EditMotorcycleModal';
import FilterModal from '../components/FilterModal';
import { scheduleLocalNotification } from '../services/notificationService'; // ✅ Novo import

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';

function MotosScreen({ navigation, route }) {
  const [motorcycles, setMotorcycles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('Todos');
  const [currentModelFilter, setCurrentModelFilter] = useState('Todos');
  const [currentLocationFilter, setCurrentLocationFilter] = useState('Todos');

  const [searchText, setSearchText] = useState('');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);

  const loadMotorcycles = async () => {
    setRefreshing(true);
    try {
      const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
      if (storedMotos) {
        setMotorcycles(JSON.parse(storedMotos));
      } else {
        setMotorcycles([]);
      }
    } catch (error) {
      console.error('Erro ao carregar motos do AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível carregar as motos salvas localmente.');
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Atualizar moto com notificação
  const handleUpdateMotorcycle = async (motoId, updatedFields) => {
    try {
      const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
      let motos = storedMotos ? JSON.parse(storedMotos) : [];

      const updatedMotos = motos.map(moto =>
        moto.id === motoId ? { ...moto, ...updatedFields } : moto
      );

      await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(updatedMotos));
      Alert.alert('Sucesso', 'Moto atualizada com sucesso!');
      closeEditModal();

      // 🔔 Notificação local
      const updatedMoto = updatedMotos.find(m => m.id === motoId);
      await scheduleLocalNotification({
        title: '🛠️ Moto atualizada',
        body: `${updatedMoto.model} (${updatedMoto.licensePlate}) agora está com status "${updatedMoto.status}".`,
      });
    } catch (error) {
      console.error('Erro ao atualizar moto no AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a moto. Tente novamente.');
    }
  };

  // ✅ Excluir moto com notificação
  const handleDeleteMotorcycle = async (motoId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta moto? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const storedMotos = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
              let motos = storedMotos ? JSON.parse(storedMotos) : [];

              const deletedMoto = motos.find(m => m.id === motoId);
              const filteredMotos = motos.filter(moto => moto.id !== motoId);

              await AsyncStorage.setItem(MOTOS_STORAGE_KEY, JSON.stringify(filteredMotos));
              Alert.alert('Sucesso', 'Moto excluída com sucesso!');
              closeEditModal();

              // 🔔 Notificação local
              if (deletedMoto) {
                await scheduleLocalNotification({
                  title: '🗑️ Moto removida da frota',
                  body: `${deletedMoto.model} (${deletedMoto.licensePlate}) foi excluída.`,
                });
              }
            } catch (error) {
              console.error('Erro ao excluir moto do AsyncStorage:', error);
              Alert.alert('Erro', 'Não foi possível excluir a moto. Tente novamente.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadMotorcycles();
      if (route.params?.initialLocationFilter) {
        setCurrentLocationFilter(route.params.initialLocationFilter);
        navigation.setParams({ initialLocationFilter: undefined });
      }
    }, [route.params?.initialLocationFilter])
  );

  const getFilteredAndSortedMotorcycles = () => {
    let filtered = motorcycles;

    if (currentStatusFilter !== 'Todos') {
      filtered = filtered.filter(moto => moto.status === currentStatusFilter);
    }
    if (currentModelFilter !== 'Todos') {
      filtered = filtered.filter(moto => moto.modelId === currentModelFilter);
    }
    if (currentLocationFilter !== 'Todos') {
      filtered = filtered.filter(moto => moto.location === currentLocationFilter);
    }
    if (searchText.trim() !== '') {
      const lowerCaseSearchText = searchText.trim().toLowerCase();
      filtered = filtered.filter(moto =>
        moto.licensePlate.toLowerCase().includes(lowerCaseSearchText)
      );
    }
    filtered.sort((a, b) => a.licensePlate.localeCompare(b.licensePlate));
    return filtered;
  };

  const openEditModal = (moto) => {
    setSelectedMotorcycle(moto);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedMotorcycle(null);
    loadMotorcycles();
  };

  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  const handleApplyFilters = (status, model, location) => {
    setCurrentStatusFilter(status);
    setCurrentModelFilter(model);
    setCurrentLocationFilter(location);
  };

  const renderMotorcycleItem = ({ item }) => {
    const bikeModel = BIKE_MODELS.find(model => model.id === item.modelId);
    const imageUrl = bikeModel ? bikeModel.image : require('../assets/Mottu 110i.jpg');

    return (
      <TouchableOpacity style={MotosStyles.card} onPress={() => openEditModal(item)}>
        <View style={MotosStyles.imageContainer}>
          <Image source={imageUrl} style={MotosStyles.motorcycleImage} resizeMode="cover" />
        </View>
        <View style={MotosStyles.detailsContainer}>
          <Text style={MotosStyles.cardTitle}>{item.model}</Text>
          <Text style={MotosStyles.cardSubtitle}>Placa: {item.licensePlate}</Text>
          <Text style={MotosStyles.cardText}>
            Local: {item.location}{item.patio ? ` · ${item.patio}` : ''}
          </Text>
          <View style={MotosStyles.statusBadgeContainer}>
            <Text
              style={[
                MotosStyles.statusBadge,
                item.status === 'Disponível' && MotosStyles.statusAvailable,
                item.status === 'Em Manutenção' && MotosStyles.statusMaintenance,
                item.status === 'Alugada' && MotosStyles.statusRented,
                item.status === 'Aguardando Revisão' && MotosStyles.statusPending,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={MotosStyles.safeArea}>
      <View style={MotosStyles.container}>
        <View style={MotosStyles.headerContainer}>
          <Text style={MotosStyles.headerTitle}>Frota de Motos</Text>

          <TouchableOpacity
            style={MotosStyles.manageLocationsButton}
            onPress={() => navigation.navigate('Mapa')}
          >
            <Text style={MotosStyles.manageLocationsButtonText}>Localizações</Text>
          </TouchableOpacity>
        </View>

        <View style={MotosStyles.searchAndFilterContainer}>
          <TextInput
            style={MotosStyles.searchInput}
            placeholder="Buscar por placa..."
            placeholderTextColor={Colors.mottuLightGray}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={MotosStyles.filterButtonIcon} onPress={openFilterModal}>
            <Text style={MotosStyles.filterButtonIconText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        <View style={MotosStyles.activeFiltersContainer}>
          {currentStatusFilter !== 'Todos' && (
            <View style={MotosStyles.activeFilterChip}>
              <Text style={MotosStyles.activeFilterChipText}>{currentStatusFilter}</Text>
              <TouchableOpacity onPress={() => setCurrentStatusFilter('Todos')} style={MotosStyles.removeFilterButton}>
                <Text style={MotosStyles.removeFilterText}>x</Text>
              </TouchableOpacity>
            </View>
          )}
          {currentModelFilter !== 'Todos' && (
            <View style={MotosStyles.activeFilterChip}>
              <Text style={MotosStyles.activeFilterChipText}>
                {BIKE_MODELS.find(m => m.id === currentModelFilter)?.name || currentModelFilter}
              </Text>
              <TouchableOpacity onPress={() => setCurrentModelFilter('Todos')} style={MotosStyles.removeFilterButton}>
                <Text style={MotosStyles.removeFilterText}>x</Text>
              </TouchableOpacity>
            </View>
          )}
          {currentLocationFilter !== 'Todos' && (
            <View style={MotosStyles.activeFilterChip}>
              <Text style={MotosStyles.activeFilterChipText}>{currentLocationFilter}</Text>
              <TouchableOpacity onPress={() => setCurrentLocationFilter('Todos')} style={MotosStyles.removeFilterButton}>
                <Text style={MotosStyles.removeFilterText}>x</Text>
              </TouchableOpacity>
            </View>
          )}
          {(currentStatusFilter === 'Todos' &&
            currentModelFilter === 'Todos' &&
            currentLocationFilter === 'Todos' &&
            searchText.trim() === '') && (
              <Text style={MotosStyles.noFiltersText}>Todos os filtros desativados.</Text>
            )}
        </View>

        <FlatList
          data={getFilteredAndSortedMotorcycles()}
          renderItem={renderMotorcycleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={MotosStyles.listContent}
          ListEmptyComponent={
            <Text style={MotosStyles.emptyListText}>
              Nenhuma moto para exibir com os filtros atuais. Adicione motos ou mude os filtros/pesquisa.
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadMotorcycles}
              tintColor={Colors.mottuGreen}
              colors={[Colors.mottuGreen]}
            />
          }
        />

        <TouchableOpacity
          style={MotosStyles.fab}
          onPress={() => navigation.navigate('AdicionarMoto')}
        >
          <Text style={MotosStyles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      <EditMotorcycleModal
        visible={isEditModalVisible}
        onClose={closeEditModal}
        motorcycle={selectedMotorcycle}
        onSave={handleUpdateMotorcycle}
        onDelete={handleDeleteMotorcycle}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={closeFilterModal}
        onApplyFilters={handleApplyFilters}
        currentStatusFilter={currentStatusFilter}
        currentModelFilter={currentModelFilter}
        currentLocationFilter={currentLocationFilter}
      />
    </SafeAreaView>
  );
}

export default MotosScreen;
