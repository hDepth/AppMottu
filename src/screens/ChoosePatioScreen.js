// src/screens/ChoosePatioScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../style/Colors';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = Math.round(width * 0.66);
const ITEM_MARGIN = 12;

const PATIOS = [
  { id: 'patio-a', name: 'Pátio A', color: '#ffdede', emoji: '🏁' },
  { id: 'patio-b', name: 'Pátio B', color: '#dff7df', emoji: '🏍️' },
  { id: 'patio-c', name: 'Pátio C', color: '#dcecff', emoji: '🧭' },
  { id: 'patio-d', name: 'Pátio D', color: '#fff8cc', emoji: '📍' },
];

export default function ChoosePatioScreen({ navigation }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [gridMode, setGridMode] = useState(false);
  const route = useRoute();

  const onSelectPatio = (patio) => {
    // If the caller expects to return to AddMotorcycle, send it back
    if (route.params?.returnTo === 'AdicionarMoto' || route.params?.from === 'AdicionarMoto') {
      // navigate back to AddMotorcycle with the selected patio
      navigation.navigate('AdicionarMoto', { selectedPatio: patio.name });
      return;
    }

    // Otherwise open the Mapa and pass the selected patio
    navigation.navigate('Mapa', { selectedPatio: patio.name });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolha o Pátio</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setGridMode((v) => !v)}>
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
            contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {PATIOS.map((p, i) => {
              const inputRange = [(i - 1) * (ITEM_WIDTH + ITEM_MARGIN), i * (ITEM_WIDTH + ITEM_MARGIN), (i + 1) * (ITEM_WIDTH + ITEM_MARGIN)];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.9, 1, 0.9],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.7, 1, 0.7],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View key={p.id} style={[styles.itemWrapper, { transform: [{ scale }], opacity, marginRight: ITEM_MARGIN }]}>
                  <TouchableOpacity activeOpacity={0.85} style={[styles.card, { backgroundColor: p.color }]} onPress={() => onSelectPatio(p)}>
                    <Text style={styles.emoji}>{p.emoji}</Text>
                    <Text style={styles.cardTitle}>{p.name}</Text>
                    <Text style={styles.cardSubtitle}>Abrir mapa do pátio</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>
      ) : (
        <View style={styles.gridWrap}>
          {PATIOS.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.gridItem, { backgroundColor: p.color }]} onPress={() => onSelectPatio(p)}>
              <Text style={styles.emoji}>{p.emoji}</Text>
              <Text style={styles.cardTitle}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>Dica: ao cadastrar uma moto você pode abrir esta tela para escolher o pátio.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f6fbfc' },
  header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.mottuDark },
  toggleBtn: { padding: 8, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#eee' },
  toggleTxt: { fontWeight: '700', color: Colors.mottuDark },
  carouselWrap: { flex: 1, justifyContent: 'center' },
  itemWrapper: { width: ITEM_WIDTH, alignItems: 'center' },
  card: { width: '100%', height: ITEM_WIDTH * 0.7, borderRadius: 14, justifyContent: 'center', alignItems: 'center', padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  emoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.mottuDark },
  cardSubtitle: { fontSize: 12, color: '#444', marginTop: 6 },
  gridWrap: { flex: 1, padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
  gridItem: { width: (width - 60) / 2, height: (width - 60) / 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  footer: { padding: 14, alignItems: 'center' },
  hint: { color: '#666', fontSize: 13 },
});
