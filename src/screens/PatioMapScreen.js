// src/screens/PatioMapScreen.js
import React, { useState, useRef } from "react";
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
} from "react-native";
import Svg, { Rect, Circle, Text as SvgText } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../style/Colors";
import { useFocusEffect, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = Math.min(width - 48, 760);
const GRID_SIZE = 20;

function uid(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 999)}`;
}
function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export default function PatioMapScreen() {
  const route = useRoute();
  const { patioId, selectedPatio, shape } = route.params || {};
  const AREAS_KEY = `@mottuApp:areas_patio_${patioId}`;
  const MOTOS_KEY = "@mottuApp:motorcycles";

  const [areas, setAreas] = useState([]);
  const [motos, setMotos] = useState([]);
  const [tempArea, setTempArea] = useState(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const areasRef = useRef({});

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const rawM = await AsyncStorage.getItem(MOTOS_KEY);
          const allMotos = rawM ? JSON.parse(rawM) : [];
          setMotos(allMotos.filter((m) => m.patioId === patioId));
        } catch {}
        try {
          const rawA = await AsyncStorage.getItem(AREAS_KEY);
          setAreas(rawA ? JSON.parse(rawA) : []);
        } catch {}
      })();
    }, [patioId])
  );

  const persistAreas = async (newAreas) => {
    setAreas(newAreas);
    await AsyncStorage.setItem(AREAS_KEY, JSON.stringify(newAreas));
  };

  const resetAreas = async () => {
    Alert.alert("Resetar áreas", `Apagar TODAS as áreas do ${selectedPatio}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(AREAS_KEY);
          setAreas([]);
        },
      },
    ]);
  };

  const startCreateArea = () => {
    const w = snapToGrid(CANVAS_SIZE * 0.25);
    const h = snapToGrid(CANVAS_SIZE * 0.15);
    const a = {
      id: uid("area-"),
      name: "",
      patioId,
      x: snapToGrid((CANVAS_SIZE - w) / 2),
      y: snapToGrid((CANVAS_SIZE - h) / 2),
      width: w,
      height: h,
    };
    setTempArea(a);
    setNewAreaName("");
    setNameModalVisible(true);
  };

  const confirmCreateArea = async () => {
    if (!tempArea) return;
    if (!newAreaName.trim()) {
      Alert.alert("Nome obrigatório", "Dê um nome para a área.");
      return;
    }
    const saved = { ...tempArea, name: newAreaName.trim() };
    setTempArea(null);
    setNewAreaName("");
    setNameModalVisible(false);
    await persistAreas([...areas, saved]);
  };

  const cancelCreateArea = () => {
    setTempArea(null);
    setNewAreaName("");
    setNameModalVisible(false);
  };

  const createMovePan = (areaId, isTemp = false) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const base = isTemp ? tempArea : areas.find((a) => a.id === areaId);
        areasRef.current[areaId] = base ? { ...base } : null;
      },
      onPanResponderMove: (evt, gesture) => {
        const ar = areasRef.current[areaId];
        if (!ar) return;
        const nx = snapToGrid(Math.min(Math.max(ar.x + gesture.dx, 0), CANVAS_SIZE - ar.width));
        const ny = snapToGrid(Math.min(Math.max(ar.y + gesture.dy, 0), CANVAS_SIZE - ar.height));
        if (isTemp) setTempArea((prev) => (prev ? { ...prev, x: nx, y: ny } : prev));
        else setAreas((prev) => prev.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny } : p)));
      },
      onPanResponderRelease: () => { areasRef.current[areaId] = null; },
    });
  };

  const createResizePan = (areaId, corner, isTemp = false) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        if (isTemp) setTempArea((prev) => prev && prev.id === areaId ? resizeLogic(prev, corner, gesture) : prev);
        else setAreas((prev) => prev.map((a) => (a.id === areaId ? resizeLogic(a, corner, gesture) : a)));
      },
    });
  };

  const resizeLogic = (a, corner, gesture) => {
    let { x, y, width, height } = a;
    if (corner.includes("right")) width = snapToGrid(Math.max(40, width + gesture.dx));
    if (corner.includes("bottom")) height = snapToGrid(Math.max(40, height + gesture.dy));
    if (corner.includes("left")) { const newX = snapToGrid(Math.max(0, x + gesture.dx)); width = snapToGrid(Math.max(40, width - (newX - x))); x = newX; }
    if (corner.includes("top")) { const newY = snapToGrid(Math.max(0, y + gesture.dy)); height = snapToGrid(Math.max(40, height - (newY - y))); y = newY; }
    return { ...a, x, y, width, height };
  };

  const renderArea = (a, isTemp = false) => {
    const movePan = createMovePan(a.id, isTemp);
    const handles = [
      { corner: "top-left", x: a.x - 8, y: a.y - 8 },
      { corner: "top-right", x: a.x + a.width - 8, y: a.y - 8 },
      { corner: "bottom-left", x: a.x - 8, y: a.y + a.height - 8 },
      { corner: "bottom-right", x: a.x + a.width - 8, y: a.y + a.height - 8 },
    ];
    return (
      <React.Fragment key={a.id + (isTemp ? '-temp' : '')}>
        <Rect x={a.x} y={a.y} width={a.width} height={a.height}
          fill={isTemp ? "rgba(76,175,80,0.12)" : "rgba(76,175,80,0.18)"} stroke={isTemp ? Colors.mottuGreen : Colors.mottuDark} strokeWidth={2} {...movePan.panHandlers} />
        <SvgText x={a.x + a.width/2} y={a.y + 16} fontSize={12} fill={Colors.mottuDark} fontWeight="700" textAnchor="middle">{a.name || 'Área'}</SvgText>
        {handles.map(h => {
          const resizePan = createResizePan(a.id, h.corner, isTemp);
          return <Rect key={h.corner} x={h.x} y={h.y} width={16} height={16} fill={Colors.mottuGreen} stroke="#fff" strokeWidth={2} rx={4} ry={4} {...resizePan.panHandlers} />;
        })}
      </React.Fragment>
    );
  };

  const renderMapShape = () => {
    switch (shape) {
      case "circle":
        return <Circle cx={CANVAS_SIZE/2} cy={CANVAS_SIZE/2} r={CANVAS_SIZE/2 - 20} fill="#fff" stroke={Colors.mottuDark} />;
      case "L":
        return <>
          <Rect x={0} y={0} width={CANVAS_SIZE*0.35} height={CANVAS_SIZE} fill="#fff" stroke={Colors.mottuDark} />
          <Rect x={CANVAS_SIZE*0.35} y={CANVAS_SIZE*0.65} width={CANVAS_SIZE*0.65} height={CANVAS_SIZE*0.35} fill="#fff" stroke={Colors.mottuDark} />
        </>;
      case "X":
        return <>
          <Rect x={CANVAS_SIZE/2 - 30} y={0} width={60} height={CANVAS_SIZE} fill="#fff" stroke={Colors.mottuDark} rx={20} ry={20} transform={`rotate(45 ${CANVAS_SIZE/2} ${CANVAS_SIZE/2})`} />
          <Rect x={CANVAS_SIZE/2 - 30} y={0} width={60} height={CANVAS_SIZE} fill="#fff" stroke={Colors.mottuDark} rx={20} ry={20} transform={`rotate(-45 ${CANVAS_SIZE/2} ${CANVAS_SIZE/2})`} />
        </>;
      default:
        return <>
          {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => <Rect key={'v'+i} x={i*GRID_SIZE} y={0} width={1} height={CANVAS_SIZE} fill={'rgba(0,0,0,0.05)'} />)}
          {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => <Rect key={'h'+i} x={0} y={i*GRID_SIZE} width={CANVAS_SIZE} height={1} fill={'rgba(0,0,0,0.05)'} />)}
        </>;
    }
  };

  return (
    <TouchableWithoutFeedback>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>{selectedPatio} <Text style={styles.shapeTag}>• {shape}</Text></Text>
          <View style={{ flexDirection: 'row' }}>
            {!tempArea ? (
              <>
                <TouchableOpacity style={styles.btn} onPress={startCreateArea}><Text style={styles.btnText}>Criar área</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#f44336' }]} onPress={resetAreas}><Text style={[styles.btnText, { color:'#fff' }]}>Resetar</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.mottuGreen }]} onPress={confirmCreateArea}><Text style={styles.btnText}>Confirmar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#f44336' }]} onPress={cancelCreateArea}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.canvasOuter}>
            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
              {renderMapShape()}
              {areas.map(a => renderArea(a))}
              {tempArea && renderArea(tempArea, true)}
            </Svg>
          </View>
        </View>

        <Modal transparent visible={nameModalVisible} animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Nome da área</Text>
              <TextInput value={newAreaName} onChangeText={setNewAreaName} placeholder="Ex: Setor A" style={styles.input} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ marginRight: 12 }} onPress={cancelCreateArea}><Text>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setNameModalVisible(false)}><Text style={{ color: Colors.mottuGreen }}>Ok</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex:1, backgroundColor: Colors.mottuDark, padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: Colors.mottuGreen, fontSize: 18, fontWeight: '800' },
  shapeTag: { color: Colors.mottuLightGray, fontSize: 13, fontWeight: '600' },
  btn: { padding: 8, borderRadius: 8, marginLeft: 8, backgroundColor: '#0f1a16' },
  btnText: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: '#0b0f0f', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  canvasOuter: { backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  canvas: { borderWidth: 1, borderColor: '#eee' },

  modalWrap: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.35)' },
  modalCard: { backgroundColor:'#fff', padding:16, width:'90%', borderRadius:10 },
  input: { borderBottomWidth:1, borderColor:'#ddd', paddingVertical:6 },
});
