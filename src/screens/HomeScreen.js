// src/screens/HomeScreen.js
import React, { useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Animated, Easing, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeStyles from '../style/HomeScreen';
import { useTheme } from '../context/ThemeContext';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../services/notificationService'; // ✅ Novo

const MOTOS_STORAGE_KEY = '@mottuApp:motorcycles';
const LOCATIONS_STORAGE_KEY = '@mottuApp:locations';

function HomeScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();

  const [counts, setCounts] = useState({
    total: 0,
    disponiveis: 0,
    manutencao: 0,
    locais: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // 🔔 Registrar notificações ao abrir a Home
  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();
    })();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  // ⚙️ Header (tema + logout)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.text,
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <Ionicons
            name="moon-outline"
            size={24}
            color={theme.text}
            style={{ marginRight: 16 }}
            onPress={toggleTheme}
          />
          <Ionicons
            name="log-out-outline"
            size={24}
            color={theme.text}
            style={{ marginRight: 16 }}
            onPress={handleLogout}
          />
        </View>
      ),
    });
  }, [navigation, theme]);

  // 🎞️ Animações
  const animValues = {
    total: useRef(new Animated.Value(0)).current,
    disponiveis: useRef(new Animated.Value(0)).current,
    manutencao: useRef(new Animated.Value(0)).current,
    locais: useRef(new Animated.Value(0)).current,
  };

  // 📊 Resumo
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
    } catch {
      setCounts({ total: 0, disponiveis: 0, manutencao: 0, locais: 0 });
    }
  };

  useFocusEffect(useCallback(() => { loadSummary(); }, []));

  // 🔄 Atualizar + enviar notificação local
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);

    await scheduleLocalNotification({
      title: '📊 Atualização concluída',
      body: `Total: ${counts.total} | Disponíveis: ${counts.disponiveis} | Em manutenção: ${counts.manutencao}`,
    });
  };

  // 🔽 Animação dos cards
  const toggleExpand = (key) => {
    const isExpanded = expanded === key;
    Object.entries(animValues).forEach(([_, anim]) => {
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
    } else setExpanded(null);
  };

  const renderCard = (key, label, value, icon) => {
    const anim = animValues[key];
    const height = anim.interpolate({ inputRange: [0, 1], outputRange: [110, 200] });
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    return (
      <Pressable key={key} onPress={() => toggleExpand(key)} style={{ flexBasis: '48%' }}>
        <Animated.View
          style={[
            HomeStyles.card,
            {
              height,
              transform: [{ scale }],
              backgroundColor: theme.card,
              shadowOpacity: 0.25,
              shadowRadius: 4,
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={theme.accent} style={{ marginBottom: 6 }} />
          <Text style={[HomeStyles.cardLabel, { color: theme.text }]}>{label}</Text>
          <Text style={[HomeStyles.cardValue, { color: theme.text }]}>{value}</Text>

          <Animated.View style={[HomeStyles.extraContent, { opacity }]}>
            <Text style={[HomeStyles.extraText, { color: theme.text }]}>
              Última atualização: agora mesmo
            </Text>
            <View style={[HomeStyles.fakeBar, { backgroundColor: theme.background }]}>
              <View
                style={[
                  HomeStyles.fakeBarFill,
                  { width: `${Math.min(value * 10, 100)}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[HomeStyles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={HomeStyles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[HomeStyles.title, { color: theme.text }]}>Dashboard do Pátio</Text>
      <Text style={[HomeStyles.subtitle, { color: theme.text }]}>Resumo rápido da operação</Text>

      <View style={HomeStyles.grid}>
        {renderCard('total', 'Motos (Total)', counts.total, 'bicycle-outline')}
        {renderCard('disponiveis', 'Disponíveis', counts.disponiveis, 'checkmark-circle-outline')}
        {renderCard('manutencao', 'Em Manutenção', counts.manutencao, 'construct-outline')}
        {renderCard('locais', 'Localizações', counts.locais, 'location-outline')}
      </View>

      <View style={[HomeStyles.noteBox, { backgroundColor: theme.card }]}>
        <Text style={[HomeStyles.noteTitle, { color: theme.accent }]}>Dica</Text>
        <Text style={[HomeStyles.noteText, { color: theme.text }]}>
          Use as abas abaixo para alternar entre o mapa e a lista de motos.
          Você pode adicionar motos no botão “+” da lista e gerenciar os locais
          pelo ícone no topo da aba Motos.
        </Text>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;
