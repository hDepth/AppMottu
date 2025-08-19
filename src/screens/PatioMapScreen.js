import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';

import { listMotorcycles } from '../services/motorcycleService';
import { getYardById } from '../services/yardService';
import styles from '../style/PatioMapScreen'; // Seus estilos

const PatioMapScreen = () => {
    const route = useRoute();
    const { yardId } = route.params;

    const [permissionStatus, setPermissionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yard, setYard] = useState(null);
    const [motorcycles, setMotorcycles] = useState([]);

    useEffect(() => {
        const setupMap = async () => {
            setIsLoading(true);
            setError(null);

            let { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);

            if (status !== 'granted') {
                setError('Permissão de localização não concedida.');
                setIsLoading(false);
                return;
            }

            try {
                const [yardData, motorcyclesData] = await Promise.all([
                    getYardById(yardId),
                    listMotorcycles({ yardId })
                ]);
                
                if (!yardData) {
                    throw new Error("Pátio não encontrado ou erro na API.");
                }

                setYard(yardData);
                setMotorcycles(motorcyclesData);

            } catch (apiError) {
                console.error('Erro ao carregar dados do mapa:', apiError);
                setError(apiError.message || 'Não foi possível carregar os dados.');
            } finally {
                setIsLoading(false);
            }
        };

        setupMap();
    }, [yardId]);

    const getPolygonCoordinates = () => {
        if (!yard || !yard.polygon_geojson) return [];
        try {
            const geojson = JSON.parse(yard.polygon_geojson);
            const coords = geojson.coordinates[0];
            return coords.map(point => ({ latitude: point[1], longitude: point[0] }));
        } catch (e) {
            console.error("Erro ao processar polígono do pátio:", e);
            return [];
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container_centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Carregando mapa do pátio...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container_centered}>
                <Text style={styles.errorText}>{error}</Text>
                {permissionStatus !== 'granted' && (
                  <Button title="Tentar Novamente" onPress={() => Location.requestForegroundPermissionsAsync()} />
                )}
            </View>
        );
    }

    const polygonCoords = getPolygonCoordinates();
    const initialRegion = polygonCoords.length > 0 ? {
        latitude: polygonCoords[0].latitude,
        longitude: polygonCoords[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    } : null;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                {polygonCoords.length > 0 && <Polygon
                    coordinates={polygonCoords}
                    strokeColor="#FF0000"
                    fillColor="rgba(255, 0, 0, 0.2)"
                    strokeWidth={2}
                />}

                {motorcycles.map(moto => (
                    <Marker
                        key={moto.id}
                        coordinate={{
                            latitude: moto.last_lat,
                            longitude: moto.last_lng,
                        }}
                        title={`Placa: ${moto.plate}`}
                        description={`Status: ${moto.status}`}
                        pinColor={moto.status === 'available' ? 'green' : (moto.status === 'in_use' ? 'blue' : 'orange')}
                    />
                ))}
            </MapView>
        </View>
    );
};

export default PatioMapScreen;