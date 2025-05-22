import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Importando MapView e Marker
import * as Location from 'expo-location'; // Importando expo-location

// Importe seus estilos, como você já tem:
import styles from '../style/PatioMapScreen';

const PatioMapScreen = () => {
    // Estado para armazenar as coordenadas geográficas
    const [location, setLocation] = useState(null);
    // Estado para o status da permissão de localização
    const [permissionStatus, setPermissionStatus] = useState(null);
    // Estado para indicar se o mapa está carregando
    const [isLoading, setIsLoading] = useState(true);

    // UseEffect para solicitar permissão e obter a localização
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);

            if (status !== 'granted') {
                console.log('Permissão de localização não concedida!');
                setIsLoading(false); // Para parar o loading se a permissão não for concedida
                return;
            }

            // Se a permissão foi concedida, tente obter a localização
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation.coords);
                console.log('Localização do usuário:', currentLocation.coords);
            } catch (error) {
                console.error('Erro ao obter localização:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Função para solicitar a permissão novamente (se o usuário negou antes)
    const requestPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        if (status === 'granted') {
            setIsLoading(true);
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation.coords);
                console.log('Localização do usuário (após re-solicitação):', currentLocation.coords);
            } catch (error) {
                console.error('Erro ao obter localização após re-solicitação:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Coordenadas do pátio fixas (Exemplo: São Paulo)
    // Você pode ajustar isso para a localização real do seu pátio
    const patioLocation = {
        latitude: -23.550520,  // Exemplo: Lat de São Paulo
        longitude: -46.633300, // Exemplo: Lng de São Paulo
        latitudeDelta: 0.0922, // Zoom padrão
        longitudeDelta: 0.0421, // Zoom padrão
    };

    // Renderiza o mapa ou mensagens de carregamento/permissão
    const renderMapContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>Carregando mapa e localização...</Text>
                </View>
            );
        }

        if (permissionStatus !== 'granted') {
            return (
                <View style={styles.permissionContainer}>
                    <Text>Permissão de localização não concedida.</Text>
                    <Text>Para visualizar o mapa, precisamos da sua localização.</Text>
                    <Button title="Solicitar Permissão" onPress={requestPermission} />
                </View>
            );
        }

        // Se tiver a localização do usuário, centraliza lá, senão no pátio
        const initialRegion = location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01, // Um zoom mais próximo para o usuário
            longitudeDelta: 0.01,
        } : patioLocation; // Caso não consiga a localização do usuário, usa a do pátio

        return (
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                // Você pode usar onRegionChangeComplete se quiser saber a região atual do mapa
            >
                {/* Marcador para a localização do usuário (se disponível) */}
                {location && (
                    <Marker
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title="Sua Localização"
                        description="Você está aqui!"
                    />
                )}
                {/* Marcador para o pátio da Mottu */}
                <Marker
                    coordinate={{ latitude: patioLocation.latitude, longitude: patioLocation.longitude }}
                    title="Pátio da Mottu"
                    description="Localização principal da frota"
                    pinColor="blue" // Cor diferente para o marcador do pátio
                />
                {/* Aqui você adicionaria marcadores para as motos */}
                {/* Exemplo de um marcador de moto (você buscará isso do backend) */}
                {/*
                <Marker
                    coordinate={{ latitude: -23.5510, longitude: -46.6340 }}
                    title="Moto A123"
                    description="Status: Em pátio"
                    pinColor="green"
                />
                */}
            </MapView>
        );
    };

    return (
        <View style={styles.container}>
            {renderMapContent()}
        </View>
    );
};

// Seus estilos separados em src/style/PatioMapScreenStyles.js
// Aqui estão os estilos base que devem estar lá, adaptados
// Remova o StyleSheet.create daqui, já está importado!

export default PatioMapScreen;