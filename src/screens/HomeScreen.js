// src/screens/HomeScreen.js
import React, { useCallback, useState, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Animated, Easing, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
  const [expanded, setExpanded] = useState(null);

  const resetStorage = async () => {
    await AsyncStorage.clear();
    console.log('AsyncStorage limpo!');
  };
  // Animated values para os 4 cards
  const animValues = {
    total: useRef(new Animated.Value(0)).current,
    disponiveis: useRef(new Animated.Value(0)).current,
    manutencao: useRef(new Animated.Value(0)).current,
    locais: useRef(new Animated.Value(0)).current,
  };

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

  const toggleExpand = (key) => {
    const isExpanded = expanded === key;

    // recolher todos antes
    Object.entries(animValues).forEach(([name, anim]) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    if (!isExpanded) {
      setExpanded(key);
      Animated.timing(animValues[key], {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      setExpanded(null);
    }
  };

  const renderCard = (key, label, value, icon) => {
    const anim = animValues[key];
    const height = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [110, 200],
    });
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.02],
    });
    const shadow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 8],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Pressable onPress={() => toggleExpand(key)} style={{ flexBasis: '48%' }}>
        <Animated.View
          style={[
            HomeStyles.card,
            {
              height,
              transform: [{ scale }],
              shadowOpacity: 0.25,
              shadowRadius: shadow,
              shadowOffset: { width: 0, height: 2 },
              elevation: shadow, // Android
            },
          ]}
        >
          <Ionicons name={icon} size={22} color="#0f0" style={{ marginBottom: 6 }} />
          <Text style={HomeStyles.cardLabel}>{label}</Text>
          <Text style={HomeStyles.cardValue}>{value}</Text>

          <Animated.View style={[HomeStyles.extraContent, { opacity }]}>
            <Text style={HomeStyles.extraText}>Última atualização: agora mesmo</Text>
            <View style={HomeStyles.fakeBar}>
              <View style={[HomeStyles.fakeBarFill, { width: `${Math.min(value * 10, 100)}%` }]} />
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
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
        {renderCard('total', 'Motos (Total)', counts.total, 'bicycle-outline')}
        {renderCard('disponiveis', 'Disponíveis', counts.disponiveis, 'checkmark-circle-outline')}
        {renderCard('manutencao', 'Em Manutenção', counts.manutencao, 'construct-outline')}
        {renderCard('locais', 'Localizações', counts.locais, 'location-outline')}
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
