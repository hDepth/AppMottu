import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Rect, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../style/Colors';

const MOTOS_KEY = '@mottuApp:motorcycles';
const LOCATIONS_KEY = '@mottuApp:locations';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(width - 32, 840);
const GRID_SIZE = 20; // snapping grid

function uid(prefix = '') {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 999)}`;
}

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function colorFromId(id) {
  const colors = ['#ffe0e0', '#e0ffe0', '#e0e0ff', '#fff5e0', '#e0f7fa', '#f3e5f5'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function PatioMapScreen() {
  const [areas, setAreas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [tooltipMoto, setTooltipMoto] = useState(null);

  const [creatingArea, setCreatingArea] = useState(false);
  const [tempArea, setTempArea] = useState(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const areasRef = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const rawM = await AsyncStorage.getItem(MOTOS_KEY);
        setMotos(rawM ? JSON.parse(rawM) : []);
      } catch {}
      try {
        const rawA = await AsyncStorage.getItem(LOCATIONS_KEY);
        setAreas(rawA ? JSON.parse(rawA) : []);
      } catch {}
    })();
  }, []);

  const persistAreas = async (newAreas) => {
    setAreas(newAreas);
    await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(newAreas));
  };

  const persistMotos = async (newMotos) => {
    setMotos(newMotos);
    await AsyncStorage.setItem(MOTOS_KEY, JSON.stringify(newMotos));
  };

  const resetAllData = async () => {
    Alert.alert('Resetar dados', 'Deseja apagar TODOS os dados locais?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([MOTOS_KEY, LOCATIONS_KEY]);
          setMotos([]);
          setAreas([]);
          setTooltipMoto(null);
        },
      },
    ]);
  };

  const startCreateArea = () => {
    const w = snapToGrid(CANVAS_SIZE * 0.28);
    const h = snapToGrid(CANVAS_SIZE * 0.16);
    const a = {
      id: uid('area-'),
      name: '',
      x: snapToGrid((CANVAS_SIZE - w) / 2),
      y: snapToGrid((CANVAS_SIZE - h) / 2),
      width: w,
      height: h,
    };
    setTempArea(a);
    setCreatingArea(true);
    areasRef.current[a.id] = { ...a };
  };

  const confirmCreateArea = async () => {
    if (!tempArea) return;
    if (!newAreaName.trim()) {
      Alert.alert('Nome obrigatório', 'Dê um nome para a área.');
      return;
    }
    const saved = { ...tempArea, name: newAreaName.trim() };
    setTempArea(null);
    setCreatingArea(false);
    setNewAreaName('');
    await persistAreas([...areas, saved]);
  };

  const cancelCreateArea = () => {
    setTempArea(null);
    setCreatingArea(false);
    setNewAreaName('');
  };

  const createMovePan = (areaId) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const base = areas.find((a) => a.id === areaId) || (tempArea && tempArea.id === areaId ? tempArea : null);
        areasRef.current[areaId] = base ? { ...base } : null;
      },
      onPanResponderMove: (evt, gesture) => {
        const ar = areasRef.current[areaId];
        if (!ar) return;
        const nx = snapToGrid(Math.min(Math.max(ar.x + gesture.dx, 0), CANVAS_SIZE - ar.width));
        const ny = snapToGrid(Math.min(Math.max(ar.y + gesture.dy, 0), CANVAS_SIZE - ar.height));
        if (tempArea && tempArea.id === areaId) setTempArea((p) => (p ? { ...p, x: nx, y: ny } : p));
        else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny } : p)));
      },
      onPanResponderRelease: () => {
        areasRef.current[areaId] = null;
      },
    });
  };

  const handleMotoPress = (m) => {
    setTooltipMoto(m);
  };

  const renderArea = (a, isTemp = false) => {
    const movePan = createMovePan(a.id);
    const fill = isTemp ? 'rgba(76,175,80,0.12)' : colorFromId(a.id);
    const stroke = isTemp ? Colors.mottuGreen : Colors.mottuDark;

    return (
      <React.Fragment key={`area-${a.id}${isTemp ? '-temp' : ''}`}>
        <Rect
          x={a.x}
          y={a.y}
          width={a.width}
          height={a.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          {...movePan.panHandlers}
        />
        <SvgText x={a.x + a.width / 2} y={a.y + 16} fontSize={12} fill={stroke} fontWeight="700" textAnchor="middle">
          {a.name || 'Área'}
        </SvgText>
      </React.Fragment>
    );
  };

  const renderMotoInArea = (m) => {
    let area = null;
    if (m.location) {
      area = areas.find((a) => a.name && a.name.toLowerCase() === m.location.toLowerCase());
    }
    if (!area) return null;

    const margin = 8;
    const maxCols = Math.max(1, Math.floor((area.width - margin * 2) / 28));
    const maxRows = Math.max(1, Math.floor((area.height - margin * 2) / 28));
    const hash = m.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const col = hash % maxCols;
    const row = Math.floor(hash / 7) % maxRows;
    const x = area.x + margin + col * 28 + 14;
    const y = area.y + margin + row * 28 + 14;

    let color = Colors.mottuGreen;
    if (m.status === 'Em Manutenção') color = '#ff9800';
    else if (m.status === 'Alugada') color = '#f44336';
    else if (m.status === 'Aguardando Revisão') color = '#2196f3';

    return (
      <React.Fragment key={`moto-${m.id}`}>
        <Circle cx={x} cy={y} r={10} fill={color} onPress={() => handleMotoPress(m)} />
        <SvgText x={x} y={y + 20} fontSize={9} fill="#111" textAnchor="middle">
          🛵
        </SvgText>
        {tooltipMoto && tooltipMoto.id === m.id && (
          <>
            <Rect x={x + 12} y={y - 10} width={120} height={60} fill="#fff" stroke="#333" rx={6} />
            <SvgText x={x + 16} y={y + 5} fontSize={10} fill="#111">{m.licensePlate}</SvgText>
            <SvgText x={x + 16} y={y + 18} fontSize={9} fill="#555">{m.model}</SvgText>
            <SvgText x={x + 16} y={y + 30} fontSize={9} fill={color}>{m.status}</SvgText>
            <SvgText x={x + 16} y={y + 42} fontSize={9} fill="#777">{m.location}</SvgText>
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setTooltipMoto(null)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mapa do Pátio</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#fff' }]} onPress={startCreateArea}>
              <Text style={[styles.btnText, { color: Colors.mottuDark }]}>Criar área</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.mottuDark }]} onPress={resetAllData}>
              <Text style={[styles.btnText, { color: '#fff' }]}>Resetar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.canvasWrapper}>
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
            {/* grid background */}
            {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => (
              <Rect key={`g-${i}`} x={i * GRID_SIZE} y={0} width={1} height={CANVAS_SIZE} fill={'rgba(0,0,0,0.04)'} />
            ))}
            {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => (
              <Rect key={`h-${i}`} x={0} y={i * GRID_SIZE} width={CANVAS_SIZE} height={1} fill={'rgba(0,0,0,0.04)'} />
            ))}

            {/* user point */}
            <Circle cx={CANVAS_SIZE / 2} cy={CANVAS_SIZE - 40} r={8} fill="#1976d2" />
            <SvgText x={CANVAS_SIZE / 2} y={CANVAS_SIZE - 22} fontSize={10} fill="#1976d2" textAnchor="middle">Você</SvgText>

            {areas.map((a) => renderArea(a, false))}
            {tempArea && renderArea(tempArea, true)}
            {motos.map((m) => renderMotoInArea(m))}
          </Svg>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.mottuGreen }]}
            onPress={() => {
              if (!creatingArea || !tempArea) return Alert.alert('Criar área', 'Primeiro pressione Criar área.');
              setNameModalVisible(true);
            }}
          >
            <Text style={{ color: '#fff' }}>OK (Salvar área)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, { backgroundColor: '#ff6666' }]} onPress={() => cancelCreateArea()}>
            <Text style={{ color: '#fff' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <Modal transparent visible={nameModalVisible} animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Nome da área</Text>
              <TextInput value={newAreaName} onChangeText={setNewAreaName} placeholder="Ex: Setor A" style={styles.input} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ marginRight: 12 }} onPress={() => setNameModalVisible(false)}>
                  <Text>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    confirmCreateArea();
                    setNameModalVisible(false);
                  }}
                >
                  <Text style={{ color: Colors.mottuGreen }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafb' },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.mottuDark },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  btn: { padding: 8, borderRadius: 8, marginLeft: 8 },
  btnText: { fontWeight: '700' },
  canvasWrapper: { alignItems: 'center', padding: 8 },
  canvas: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
  modalWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: { backgroundColor: '#fff', padding: 16, width: '90%', borderRadius: 8 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 6 },
});
