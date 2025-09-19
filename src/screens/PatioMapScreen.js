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
const CANVAS_SIZE = Math.min(width - 32, 840);
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
  const [tooltipMoto, setTooltipMoto] = useState(null);

  const [creatingArea, setCreatingArea] = useState(false);
  const [tempArea, setTempArea] = useState(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const areasRef = useRef({});

  // Carrega dados por pátio
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const rawM = await AsyncStorage.getItem(MOTOS_KEY);
          const allMotos = rawM ? JSON.parse(rawM) : [];
          setMotos(allMotos.filter((m) => m.patio === selectedPatio));
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

  // Criar área
  const startCreateArea = () => {
    const w = snapToGrid(CANVAS_SIZE * 0.25);
    const h = snapToGrid(CANVAS_SIZE * 0.15);
    const a = {
      id: uid("area-"),
      name: "",
      patio: selectedPatio,
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
      Alert.alert("Nome obrigatório", "Dê um nome para a área.");
      return;
    }
    const saved = { ...tempArea, name: newAreaName.trim() };
    setTempArea(null);
    setCreatingArea(false);
    setNewAreaName("");
    await persistAreas([...areas, saved]);
  };

  const cancelCreateArea = () => {
    setTempArea(null);
    setCreatingArea(false);
    setNewAreaName("");
  };

  // Movimentar área
  const createMovePan = (areaId) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const base =
          areas.find((a) => a.id === areaId) ||
          (tempArea && tempArea.id === areaId ? tempArea : null);
        areasRef.current[areaId] = base ? { ...base } : null;
      },
      onPanResponderMove: (evt, gesture) => {
        const ar = areasRef.current[areaId];
        if (!ar) return;
        const nx = snapToGrid(
          Math.min(Math.max(ar.x + gesture.dx, 0), CANVAS_SIZE - ar.width)
        );
        const ny = snapToGrid(
          Math.min(Math.max(ar.y + gesture.dy, 0), CANVAS_SIZE - ar.height)
        );
        if (tempArea && tempArea.id === areaId)
          setTempArea((p) => (p ? { ...p, x: nx, y: ny } : p));
        else
          setAreas((prev) =>
            prev.map((p) => (p.id === areaId ? { ...p, x: nx, y: ny } : p))
          );
      },
      onPanResponderRelease: () => {
        areasRef.current[areaId] = null;
      },
    });
  };

  const renderArea = (a, isTemp = false) => {
    const movePan = createMovePan(a.id);
    const fill = isTemp ? "rgba(76,175,80,0.12)" : "#f2f2f2";
    const stroke = isTemp ? Colors.mottuGreen : Colors.mottuDark;

    return (
      <React.Fragment key={`${a.id}${isTemp ? "-temp" : ""}`}>
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
        <SvgText
          x={a.x + a.width / 2}
          y={a.y + 16}
          fontSize={12}
          fill={stroke}
          fontWeight="700"
          textAnchor="middle"
        >
          {a.name || "Área"}
        </SvgText>
      </React.Fragment>
    );
  };

  // Renderiza formato do mapa
  const renderMapShape = () => {
    switch (shape) {
      case "circle":
        return (
          <Circle
            cx={CANVAS_SIZE / 2}
            cy={CANVAS_SIZE / 2}
            r={CANVAS_SIZE / 2 - 20}
            fill="#fafafa"
            stroke={Colors.mottuDark}
          />
        );
      case "L":
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={CANVAS_SIZE * 0.35}
              height={CANVAS_SIZE}
              fill="#fafafa"
              stroke={Colors.mottuDark}
            />
            <Rect
              x={CANVAS_SIZE * 0.35}
              y={CANVAS_SIZE * 0.65}
              width={CANVAS_SIZE * 0.65}
              height={CANVAS_SIZE * 0.35}
              fill="#fafafa"
              stroke={Colors.mottuDark}
            />
          </>
        );
      case "X":
        return (
          <>
            <Rect
              x={CANVAS_SIZE / 2 - 30}
              y={0}
              width={60}
              height={CANVAS_SIZE}
              fill="#fafafa"
              stroke={Colors.mottuDark}
              rx={20}
              ry={20}
              transform={`rotate(45 ${CANVAS_SIZE / 2} ${CANVAS_SIZE / 2})`}
            />
            <Rect
              x={CANVAS_SIZE / 2 - 30}
              y={0}
              width={60}
              height={CANVAS_SIZE}
              fill="#fafafa"
              stroke={Colors.mottuDark}
              rx={20}
              ry={20}
              transform={`rotate(-45 ${CANVAS_SIZE / 2} ${CANVAS_SIZE / 2})`}
            />
          </>
        );
      default: // grid
        return (
          <>
            {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => (
              <Rect
                key={`v-${i}`}
                x={i * GRID_SIZE}
                y={0}
                width={1}
                height={CANVAS_SIZE}
                fill={"rgba(0,0,0,0.05)"}
              />
            ))}
            {[...Array(Math.floor(CANVAS_SIZE / GRID_SIZE))].map((_, i) => (
              <Rect
                key={`h-${i}`}
                x={0}
                y={i * GRID_SIZE}
                width={CANVAS_SIZE}
                height={1}
                fill={"rgba(0,0,0,0.05)"}
              />
            ))}
          </>
        );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setTooltipMoto(null)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {selectedPatio} ({shape})
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.btn} onPress={startCreateArea}>
              <Text style={styles.btnText}>Criar área</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#f44336" }]}
              onPress={resetAreas}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Resetar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.canvasWrapper}>
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
            {renderMapShape()}
            {areas.map((a) => renderArea(a))}
            {tempArea && renderArea(tempArea, true)}
          </Svg>
        </View>

        <Modal transparent visible={nameModalVisible} animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>
                Nome da área
              </Text>
              <TextInput
                value={newAreaName}
                onChangeText={setNewAreaName}
                placeholder="Ex: Setor A"
                style={styles.input}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity
                  style={{ marginRight: 12 }}
                  onPress={() => setNameModalVisible(false)}
                >
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
  container: { flex: 1, backgroundColor: "#f8fafb" },
  header: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.mottuDark },
  btn: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: Colors.mottuDark,
  },
  btnText: { fontWeight: "700", color: "#fff" },
  canvasWrapper: { alignItems: "center", padding: 8 },
  canvas: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    width: "90%",
    borderRadius: 8,
  },
  input: { borderBottomWidth: 1, borderColor: "#ddd", paddingVertical: 6 },
});
