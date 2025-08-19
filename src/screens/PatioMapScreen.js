import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Dimensions, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Svg, Polygon, Circle, G } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { listMotorcycles } from '../services/motorcycleService';
import { getYardById } from '../services/yardService';
import styles from '../style/PatioMapScreen'; // Seus estilos

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PatioMapScreen = () => {
    const route = useRoute();
    const { yardId } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yard, setYard] = useState(null);
    const [motorcycles, setMotorcycles] = useState([]);
    const [selectedMoto, setSelectedMoto] = useState(null);

    // Valores para animação de pan e zoom
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [yardData, motorcyclesData] = await Promise.all([
                    getYardById(yardId),
                    listMotorcycles({ yardId }),
                ]);
                setYard(yardData);
                setMotorcycles(motorcyclesData);
            } catch (e) {
                setError('Falha ao carregar dados do pátio.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [yardId]);

    // Gestos para zoom e arraste
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
        .onEnd(() => { savedScale.value = scale.value; });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Converte as coordenadas do polígono (0 a 1) para pontos na tela
    const getPolygonPoints = () => {
        if (!yard || !yard.polygon_geojson) return '';
        try {
            const geojson = JSON.parse(yard.polygon_geojson);
            const coords = geojson.coordinates[0];
            return coords.map(p => `${p[0] * SCREEN_WIDTH},${p[1] * SCREEN_HEIGHT}`).join(' ');
        } catch (e) {
            return '';
        }
    };

    if (isLoading) {
        return <View style={styles.container_centered}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return <View style={styles.container_centered}><Text style={styles.errorText}>{error}</Text></View>;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={composedGesture}>
                <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                    <Animated.View style={animatedStyle}>
                        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
                            <G>
                                <Polygon
                                    points={getPolygonPoints()}
                                    fill="#DCDCDC"
                                    stroke="gray"
                                    strokeWidth="2"
                                />
                                {motorcycles.map((moto) => {
                                    if (moto.last_x == null || moto.last_y == null) return null;
                                    const isSelected = selectedMoto && selectedMoto.id === moto.id;
                                    return (
                                        <Pressable key={moto.id} onPress={() => setSelectedMoto(moto)}>
                                            <Circle
                                                cx={moto.last_x * SCREEN_WIDTH}
                                                cy={moto.last_y * SCREEN_HEIGHT}
                                                r={isSelected ? 10 / scale.value : 6 / scale.value}
                                                fill={moto.status === 'available' ? 'green' : (moto.status === 'in_use' ? 'blue' : 'orange')}
                                                stroke="white"
                                                strokeWidth={2 / scale.value}
                                            />
                                        </Pressable>
                                    );
                                })}
                            </G>
                        </Svg>
                    </Animated.View>
                </View>
            </GestureDetector>

            {selectedMoto && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Placa: {selectedMoto.plate}</Text>
                    <Text style={styles.infoText}>Modelo: {selectedMoto.model}</Text>
                    <Text style={styles.infoText}>Status: {selectedMoto.status}</Text>
                </View>
            )}
        </GestureHandlerRootView>
    );
};

export default PatioMapScreen;