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
  FlatList,
} from 'react-native';
import Svg, { Rect, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../style/Colors';

// Keys
const MOTOS_KEY = '@appmottu/motos';
const AREAS_KEY = '@appmottu/areas';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(width - 16, 800);

function uid(prefix = '') {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 999)}`;
}

export default function PatioMapScreen() {
  const [areas, setAreas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [creatingArea, setCreatingArea] = useState(false);
  const [tempArea, setTempArea] = useState(null); // used during creation
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  // refs to store mutable positions for pan responders
  const areasRef = useRef({});

  // Load motos and areas
  useEffect(() => {
    (async () => {
      try {
        const rawM = await AsyncStorage.getItem(MOTOS_KEY);
        if (rawM) setMotos(JSON.parse(rawM));
        else setMotos([]);
      } catch (e) {
        console.warn('Erro ao carregar motos', e);
      }

      try {
        const rawA = await AsyncStorage.getItem(AREAS_KEY);
        if (rawA) setAreas(JSON.parse(rawA));
      } catch (e) {
        console.warn('Erro ao carregar áreas', e);
      }
    })();
  }, []);

  // Persist areas
  const persistAreas = async (newAreas) => {
    setAreas(newAreas);
    try {
      await AsyncStorage.setItem(AREAS_KEY, JSON.stringify(newAreas));
    } catch (e) {
      console.warn('Erro ao salvar áreas', e);
    }
  };

  // Persist motos (for area assignment)
  const persistMotos = async (newMotos) => {
    setMotos(newMotos);
    try {
      await AsyncStorage.setItem(MOTOS_KEY, JSON.stringify(newMotos));
    } catch (e) {
      console.warn('Erro ao salvar motos', e);
    }
  };

  // --- Area creation flow ---
  const startCreateArea = () => {
    // default temp area in center
    const w = CANVAS_SIZE * 0.25;
    const h = CANVAS_SIZE * 0.18;
    const a = {
      id: uid('area-'),
      name: '',
      x: (CANVAS_SIZE - w) / 2,
      y: (CANVAS_SIZE - h) / 2,
      width: w,
      height: h,
      creating: true,
    };
    setTempArea(a);
    setCreatingArea(true);
    setEditingAreaId(a.id);
    areasRef.current[a.id] = { ...a };
  };

  const confirmCreateArea = async () => {
    if (!tempArea) return;
    if (!newAreaName.trim()) {
      Alert.alert('Nome obrigatório', 'Dê um nome para a área antes de salvar.');
      return;
    }
    const saved = { ...tempArea, name: newAreaName.trim(), creating: false };
    setTempArea(null); // limpa antes de salvar
    const newAreas = [...areas, saved];
    await persistAreas(newAreas);
    setCreatingArea(false);                     
    setEditingAreaId(null);
    setNewAreaName('');
  };

  const cancelCreateArea = () => {
    setTempArea(null);
    setCreatingArea(false);
    setEditingAreaId(null);
    setNewAreaName('');
  };

  // --- Area manipulation: move & resize via PanResponder ---
  const createMovePan = (areaId) => {
    const pan = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        areasRef.current[areaId] = areasRef.current[areaId] || { ...(areas.find((a) => a.id === areaId) || {}) };
      },
      onPanResponderMove: (evt, gesture) => {
        const ar = areasRef.current[areaId];
        if (!ar) return;
        const nx = Math.min(Math.max(ar.x + gesture.dx, 0), CANVAS_SIZE - ar.width);
        const ny = Math.min(Math.max(ar.y + gesture.dy, 0), CANVAS_SIZE - ar.height);
        // temporary update
        if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, x: nx, y: ny });
        else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny } : p)));
      },
      onPanResponderRelease: (evt, gesture) => {
        const ar = areasRef.current[areaId];
        if (!ar) return;
        const base = tempArea && tempArea.id === areaId ? tempArea : areas.find((a) => a.id === areaId);
        const nx = Math.min(Math.max(base.x + gesture.dx, 0), CANVAS_SIZE - base.width);
        const ny = Math.min(Math.max(base.y + gesture.dy, 0), CANVAS_SIZE - base.height);
        if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, x: nx, y: ny });
        else persistAreas(areas.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny } : p)));
        areasRef.current[areaId] = null;
      },
    });
    return pan;
  };

  const createResizePan = (areaId, corner) => {
    // corner: 'tl'|'tr'|'bl'|'br'
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        areasRef.current[areaId] = areasRef.current[areaId] || { ...(areas.find((a) => a.id === areaId) || {}) };
      },
      onPanResponderMove: (evt, gesture) => {
        const base = tempArea && tempArea.id === areaId ? tempArea : areas.find((a) => a.id === areaId);
        if (!base) return;
        let { x, y, width: w, height: h } = base;
        const minSize = 24;
        if (corner === 'br') {
          const nw = Math.min(Math.max(w + gesture.dx, minSize), CANVAS_SIZE - x);
          const nh = Math.min(Math.max(h + gesture.dy, minSize), CANVAS_SIZE - y);
          if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, width: nw, height: nh });
          else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, width: nw, height: nh } : p)));
        } else if (corner === 'tl') {
          const nx = Math.min(Math.max(x + gesture.dx, 0), x + w - minSize);
          const ny = Math.min(Math.max(y + gesture.dy, 0), y + h - minSize);
          const nw = w - (nx - x);
          const nh = h - (ny - y);
          if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, x: nx, y: ny, width: nw, height: nh });
          else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny, width: nw, height: nh } : p)));
        } else if (corner === 'tr') {
          const ny = Math.min(Math.max(y + gesture.dy, 0), y + h - minSize);
          const nw = Math.min(Math.max(w + gesture.dx, minSize), CANVAS_SIZE - x);
          const nh = h - (ny - y);
          if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, y: ny, width: nw, height: nh });
          else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, y: ny, width: nw, height: nh } : p)));
        } else if (corner === 'bl') {
          const nx = Math.min(Math.max(x + gesture.dx, 0), x + w - minSize);
          const nw = w - (nx - x);
          const nh = Math.min(Math.max(h + gesture.dy, minSize), CANVAS_SIZE - y);
          if (tempArea && tempArea.id === areaId) setTempArea({ ...tempArea, x: nx, width: nw, height: nh });
          else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, x: nx, width: nw, height: nh } : p)));
        }
      },
      onPanResponderRelease: (evt, gesture) => {
        const base = tempArea && tempArea.id === areaId ? tempArea : areas.find((a) => a.id === areaId);
        if (!base) return;
        // persist final
        if (tempArea && tempArea.id === areaId) persistAreas([...areas, { ...tempArea, creating: false }].filter(Boolean));
        else persistAreas(areas.map((p) => (p.id === areaId ? p : p)));
        areasRef.current[areaId] = null;
      },
    });
  };

  // Handlers for assigning motos to area
  const handleMotoPress = (moto) => {
    // if assigned -> show options (unassign or details)
    if (moto.areaId) {
      const ar = areas.find((a) => a.id === moto.areaId);
      Alert.alert(
        'Moto já atribuída',
        `Placa ${moto.plate} está na área: ${ar ? ar.name : '—'}`,
        [
          { text: 'Remover atribuição', onPress: () => unassignMoto(moto.id), style: 'destructive' },
          { text: 'Fechar', style: 'cancel' },
        ]
      );
      return;
    }
    // if no areas -> inform
    if (areas.length === 0) {
      Alert.alert('Nenhuma área', 'Crie uma área primeiro para poder atribuir a moto a um local do pátio.');
      return;
    }
    // build buttons for each area
    const buttons = areas.map((a) => ({ text: a.name || a.id, onPress: () => assignMotoToArea(moto.id, a.id) }));
    buttons.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert(`Atribuir ${moto.plate}`, 'Escolha a área', buttons);
  };

  const assignMotoToArea = async (motoId, areaId) => {
    const newM = motos.map((m) => (m.id === motoId ? { ...m, areaId } : m));
    await persistMotos(newM);
  };

  const unassignMoto = async (motoId) => {
    const newM = motos.map((m) => (m.id === motoId ? { ...m, areaId: null } : m));
    await persistMotos(newM);
  };

  const removeArea = (areaId) => {
    Alert.alert('Remover área', 'Remover esta área também desassociará motos dela. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const newAreas = areas.filter((a) => a.id !== areaId);
          await persistAreas(newAreas);
          // remove association from motos
          const newMotos = motos.map((m) => (m.areaId === areaId ? { ...m, areaId: null } : m));
          await persistMotos(newMotos);
        },
      },
    ]);
  };

  // Render helpers
  const renderArea = (a, isTemp = false) => {
    const areaId = a.id;
    // pan responders created per render — acceptable here
    const movePan = createMovePan(areaId);
    const tl = createResizePan(areaId, 'tl');
    const tr = createResizePan(areaId, 'tr');
    const bl = createResizePan(areaId, 'bl');
    const br = createResizePan(areaId, 'br');

    const fill = isTemp ? 'rgba(50,150,250,0.18)' : 'rgba(0,120,200,0.08)';
    const stroke = isTemp ? Colors.mottuGreen : Colors.mottuDark;

    return (
        <React.Fragment key={`area-${areaId}${isTemp ? '-temp' : ''}`}>
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

        {/* corner handles */}
        <Rect x={a.x - 8} y={a.y - 8} width={16} height={16} fill={stroke} {...tl.panHandlers} />
        <Rect x={a.x + a.width - 8} y={a.y - 8} width={16} height={16} fill={stroke} {...tr.panHandlers} />
        <Rect x={a.x - 8} y={a.y + a.height - 8} width={16} height={16} fill={stroke} {...bl.panHandlers} />
        <Rect x={a.x + a.width - 8} y={a.y + a.height - 8} width={16} height={16} fill={stroke} {...br.panHandlers} />

        {/* label */}
        <SvgText x={a.x + 8} y={a.y + 18} fontSize={12} fill={stroke} fontWeight="700">
          {a.name || 'Área sem nome'}
        </SvgText>

        {/* button area remove (invisible rect with touch) */}
      </React.Fragment>
    );
  };

  const renderMotoInArea = (m) => {
    const area = areas.find((a) => a.id === m.areaId);
    if (!area) return null;
    // place moto randomly inside area if no pos
    const margin = 8;
    const key = `moto-${m.id}`;
    // try to compute consistent position using the moto id hash
    const hash = m.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const col = (hash % Math.max(1, Math.floor((area.width - margin * 2) / 20))) + 1;
    const row = (Math.floor(hash / 10) % Math.max(1, Math.floor((area.height - margin * 2) / 20))) + 1;
    const x = area.x + margin + col * 18;
    const y = area.y + margin + row * 18;
    return (
      <React.Fragment key={key}>
        <Circle cx={x} cy={y} r={8} fill={Colors.mottuGreen} onPress={() => handleMotoPress(m)} />
        <SvgText x={x} y={y + 18} fontSize={10} fill="#111" textAnchor="middle">
          {m.plate}
        </SvgText>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planta do Pátio</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.btn} onPress={startCreateArea}>
            <Text style={styles.btnText}>Criar área</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: Colors.mottuDark }]}
            onPress={async () => {
              // quick debug: reload motos & areas
              const rawM = await AsyncStorage.getItem(MOTOS_KEY);
              if (rawM) setMotos(JSON.parse(rawM));
              const rawA = await AsyncStorage.getItem(AREAS_KEY);
              if (rawA) setAreas(JSON.parse(rawA));
              Alert.alert('Reloaded', 'Dados recarregados do AsyncStorage');
            }}
          >
            <Text style={styles.btnText}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.canvasWrapper}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
          {/* background grid subtle */}
          {[...Array(10)].map((_, i) => (
            <Rect
              key={`bg-${i}`}
              x={(i / 10) * CANVAS_SIZE}
              y={0}
              width={1}
              height={CANVAS_SIZE}
              fill={'rgba(0,0,0,0.03)'}
            />
          ))}

          {/* existing areas */}
          {areas.map((a) => renderArea(a, false))}

          {/* temp area (creation) */}
          {tempArea && renderArea(tempArea, true)}

          {/* motos inside areas */}
          {motos.map((m) => renderMotoInArea(m))}
        </Svg>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#eee' }]}
          onPress={() => {
            // list areas
            if (areas.length === 0) Alert.alert('Áreas', 'Nenhuma área cadastrada.');
            else
              Alert.alert('Áreas cadastradas', areas.map((a) => `${a.name || a.id}`).join('\n') || '—');
          }}
        >
          <Text>Áreas ({areas.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: Colors.mottuGreen }]}
          onPress={() => {
            // open modal to name area when creating
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

      {/* Modal para nome da área */}
      <Modal transparent visible={nameModalVisible} animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Nome da área</Text>
            <TextInput value={newAreaName} onChangeText={setNewAreaName} placeholder="Ex: Setor A - Estacionamento" style={styles.input} />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  btn: { backgroundColor: '#ddd', padding: 8, borderRadius: 8, marginLeft: 8 },
  btnText: { fontWeight: '700' },
  canvasWrapper: { alignItems: 'center', padding: 8 },
  canvas: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  modalWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalCard: { backgroundColor: '#fff', padding: 16, width: '90%', borderRadius: 8 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 6 },
});
