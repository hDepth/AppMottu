// src/screens/ChoosePatioScreen.js
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../style/Colors';
import { useRoute } from '@react-navigation/native';

// 🔗 API
import { getPatios } from '../services/api';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = Math.round(width * 0.64);
const ITEM_MARGIN = 14;

// 🔙 fallback se API não responder
const FALLBACK_PATIOS = [
  { id: "A", name: "Pátio A", shape: "grid", color: "#112f1f", image: require('../assets/PatioA.png') },
  { id: "B", name: "Pátio B", shape: "circle", color: "#123041", image: require('../assets/PatioB.png') },
  { id: "C", name: "Pátio C", shape: "L", color: "#2b123d", image: require('../assets/PatioD.png') },
  { id: "D", name: "Pátio D", shape: "X", color: "#3a2b12", image: require('../assets/PatioX.png') },
];

export default function ChoosePatioScreen({ navigation }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [gridMode, setGridMode] = useState(false);
  const [patios, setPatios] = useState(FALLBACK_PATIOS);
  const route = useRoute();

  // 🚀 Buscar pátios da API
  useEffect(() => {
    const fetchPatios = async () => {
      try {
        const data = await getPatios();
        if (Array.isArray(data) && data.length > 0) {
          // ⚠️ API não retorna imagem/shape → adicionamos defaults
          const patiosWithDefaults = data.map((p, idx) => ({
            id: p.id || idx.toString(),
            name: p.nome || p.name || `Pátio ${idx + 1}`,
            shape: p.shape || "grid",
            color: ["#112f1f", "#123041", "#2b123d", "#3a2b12"][idx % 4],
            image: FALLBACK_PATIOS[idx % FALLBACK_PATIOS.length].image,
          }));
          setPatios(patiosWithDefaults);
        } else {
          setPatios(FALLBACK_PATIOS);
        }
      } catch (err) {
        console.error("Erro ao buscar pátios:", err.message);
        Alert.alert("Aviso", "Não foi possível carregar os pátios da API. Usando padrão local.");
        setPatios(FALLBACK_PATIOS);
      }
    };
    fetchPatios();
  }, []);

  const onSelectPatio = (patio) => {
    if (route.params?.returnTo === 'AdicionarMoto' || route.params?.from === 'AdicionarMoto') {
      // Voltando para cadastro de moto
      navigation.navigate('AdicionarMoto', { selectedPatio: patio.name, patioId: patio.id });
      return;
    }

    // Ir para Mapa
    navigation.navigate('Home', {
      screen: 'Mapa',
      params: {
        patioId: patio.id,
        selectedPatio: patio.name,
        shape: patio.shape,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolha o Pátio</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setGridMode(v => !v)}>
          <Text style={styles.toggleTxt}>{gridMode ? 'Carrossel' : 'Grade'}</Text>
        </TouchableOpacity>
      </View>

      {!gridMode ? (
        <View style={styles.carouselWrap}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH + ITEM_MARGIN}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2, alignItems: 'center' }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {patios.map((p, i) => {
              const inputRange = [(i - 1) * (ITEM_WIDTH + ITEM_MARGIN), i * (ITEM_WIDTH + ITEM_MARGIN), (i + 1) * (ITEM_WIDTH + ITEM_MARGIN)];
              const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });
              const opacity = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' });

              return (
                <Animated.View key={p.id} style={[styles.itemWrapper, { transform: [{ scale }], opacity, marginRight: ITEM_MARGIN }]}>
                  <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={() => onSelectPatio(p)}>
                    <View style={styles.imageWrap}>
                      <Image source={p.image} style={styles.patioImage} resizeMode="cover" />
                      <View style={styles.imageOverlay} />
                      <Text style={styles.cardBadge}>{p.name}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardSubtitle}>Abrir mapa do pátio</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>
      ) : (
        <View style={styles.gridWrap}>
          {patios.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.gridItem, { backgroundColor: p.color }]} onPress={() => onSelectPatio(p)}>
              <Image source={p.image} style={styles.gridImage} resizeMode="cover" />
              <Text style={styles.gridTitle}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>Escolha um pátio para abrir ou vincular durante o cadastro.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.mottuDark },
  header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: Colors.mottuGreen },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#0f1a16' },
  toggleTxt: { fontWeight: '700', color: Colors.mottuLightGray },

  carouselWrap: { flex: 1, justifyContent: 'center' },
  itemWrapper: { width: ITEM_WIDTH, alignItems: 'center' },

  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0b1110',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  imageWrap: { position: 'relative', height: ITEM_WIDTH * 0.56, width: '100%' },
  patioImage: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(4,8,6,0.25)' },
  cardBadge: { position: 'absolute', left: 12, bottom: 12, color: '#fff', fontWeight: '800', fontSize: 18 },

  cardFooter: { padding: 12, backgroundColor: '#07100e' },
  cardSubtitle: { color: Colors.mottuLightGray, fontSize: 13 },

  gridWrap: { flex: 1, padding: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: (width - 64) / 2, height: (width - 64) / 2, borderRadius: 12, marginBottom: 18, justifyContent: 'flex-end', overflow: 'hidden' },
  gridImage: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  gridTitle: { padding: 10, color: '#fff', fontWeight: '700' },

  footer: { padding: 14, alignItems: 'center' },
  hint: { color: Colors.mottuLightGray, fontSize: 13 },
});
