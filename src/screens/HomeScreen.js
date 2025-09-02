// src/screens/HomeScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import HomeStyles from '../style/HomeScreen';

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';

function HomeScreen() {
  const [counts, setCounts] = useState({
    total: 0,
    disponiveis: 0,
    manutencao: 0,
    locais: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      const motosRaw = await AsyncStorage.getItem(MOTOS_STORAGE_KEY);
      const locsRaw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);

      const motos = motosRaw ? JSON.parse(motosRaw) : [];
      const locs = locsRaw ? JSON.parse(locsRaw) : [];

      const total = motos.length;
      const disponiveis = motos.filter(m => m.status === 'Disponível').length;
      const manutencao = motos.filter(m => m.status === 'Em Manutenção').length;
      const locais = locs.length;

      setCounts({ total, disponiveis, manutencao, locais });
    } catch (e) {
      // Em caso de erro, mantém 0 sem travar a tela
      setCounts({ total: 0, disponiveis: 0, manutencao: 0, locais: 0 });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={HomeStyles.container}
      contentContainerStyle={HomeStyles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={HomeStyles.title}>Dashboard do Pátio</Text>
      <Text style={HomeStyles.subtitle}>Resumo rápido da operação</Text>

      <View style={HomeStyles.grid}>
        <View style={HomeStyles.card}>
          <Text style={HomeStyles.cardLabel}>Motos (Total)</Text>
          <Text style={HomeStyles.cardValue}>{counts.total}</Text>
        </View>

        <View style={HomeStyles.card}>
          <Text style={HomeStyles.cardLabel}>Disponíveis</Text>
          <Text style={HomeStyles.cardValue}>{counts.disponiveis}</Text>
        </View>

        <View style={HomeStyles.card}>
          <Text style={HomeStyles.cardLabel}>Em Manutenção</Text>
          <Text style={HomeStyles.cardValue}>{counts.manutencao}</Text>
        </View>

        <View style={HomeStyles.card}>
          <Text style={HomeStyles.cardLabel}>Localizações</Text>
          <Text style={HomeStyles.cardValue}>{counts.locais}</Text>
        </View>
      </View>

      <View style={HomeStyles.noteBox}>
        <Text style={HomeStyles.noteTitle}>Dica</Text>
        <Text style={HomeStyles.noteText}>
          Use as abas abaixo para alternar entre o mapa e a lista de motos.
          Você pode adicionar motos no botão “+” da lista e gerenciar os locais
          pelo ícone no topo da aba Motos.
        </Text>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;
