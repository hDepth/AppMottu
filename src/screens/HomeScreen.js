import React, { useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Animated, Easing, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeStyles from '../style/HomeScreen';
import { useTheme } from '../context/ThemeContext';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../services/notificationService';
// 👈 CORREÇÃO: Importar a função 't' para usar o wrapper seguro
import I18n, { t } from '../i18n/'; 

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

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      t('home.logout_title'), // 👈 Usando t()
      t('home.logout_confirm'), // 👈 Usando t()
      [
        { text: t('home.cancel'), style: 'cancel' }, // 👈 Usando t()
        {
          text: t('home.logout'), // 👈 Usando t()
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.text,
      // 👈 Adiciona o título da tela (usando t())
      headerTitle: t('home.header_title'), 
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
    } catch {
      setCounts({ total: 0, disponiveis: 0, manutencao: 0, locais: 0 });
    }
  };

  useFocusEffect(useCallback(() => { loadSummary(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);

    // 👈 Usando t()
    await scheduleLocalNotification({
      title: t('home.refresh_done_title'),
      body: t('home.refresh_done_body', {
        total: counts.total,
        disponiveis: counts.disponiveis,
        manutencao: counts.manutencao,
      }),
    });
  };

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
              {t('home.last_update')} {/* 👈 Usando t() */}
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
      <Text style={[HomeStyles.title, { color: theme.text }]}>{t('home.title')}</Text>
      <Text style={[HomeStyles.subtitle, { color: theme.text }]}>{t('home.subtitle')}</Text>

      <View style={HomeStyles.grid}>
        {renderCard('total', t('home.total'), counts.total, 'bicycle-outline')}
        {renderCard('disponiveis', t('home.available'), counts.disponiveis, 'checkmark-circle-outline')}
        {renderCard('manutencao', t('home.maintenance'), counts.manutencao, 'construct-outline')}
        {renderCard('locais', t('home.locations'), counts.locais, 'location-outline')}
      </View>

      <View style={[HomeStyles.noteBox, { backgroundColor: theme.card }]}>
        <Text style={[HomeStyles.noteTitle, { color: theme.accent }]}>{t('home.tip_title')}</Text>
        <Text style={[HomeStyles.noteText, { color: theme.text }]}>{t('home.tip_text')}</Text>
      </View>
    </ScrollView>
  );
}

export default HomeScreen;