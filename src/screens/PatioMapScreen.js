import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../style/Colors';
import PatioMapStyles from '../style/PatioMapScreen';



const PatioMapScreen = () => {
    const navigation = useNavigation();
    const [location, setLocation] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dados mock de motos (para testes). Em um projeto real, viriam do backend.
    const [motos, setMotos] = useState([
        { id: '1', placa: 'ABC1234', status: 'disponivel', latitude: -23.5510, longitude: -46.6340 },
        { id: '2', placa: 'DEF5678', status: 'emUso', latitude: -23.5520, longitude: -46.6350 },
        { id: '3', placa: 'GHI9012', status: 'manutencao', latitude: -23.5530, longitude: -46.6320 },
        { id: '4', placa: 'JKL3456', status: 'disponivel', latitude: -23.5540, longitude: -46.6360 },
        { id: '5', placa: 'MNO7890', status: 'manutencao', latitude: -23.5500, longitude: -46.6300 },
        { id: '6', placa: 'PQR1234', status: 'emUso', latitude: -23.5550, longitude: -46.6310 },
    ]);

    const getPinColorForStatus = (status) => {
        switch (status) {
            case 'disponivel':
                return Colors.mottuGreen;
            case 'emUso':
                return Colors.mottuError;
            case 'manutencao':
                return Colors.mottuLightGray;
            default:
                return Colors.mottuDark;
        }
    };

    const patioLocation = {
        latitude: -23.550520,
        longitude: -46.633300,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };


    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);

            if (status !== 'granted') {
                console.log('Permissão de localização não concedida!');
                setIsLoading(false);
                return;
            }

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

    const requestPermission = async () => {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        if (status === 'granted') {
            try {
                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation(currentLocation.coords);
            } catch (error) {
                console.error('Erro ao obter localização após re-solicitação:', error);
            }
        }
        setIsLoading(false);
    };


    const renderMapContent = () => {
        if (isLoading) {
            return (
                <View style={PatioMapStyles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.mottuGreen} />
                    {/* ESTA LINHA ESTÁ CORRETA, MAS SE TIVESSE SÓ 'Carregando...', DARIA ERRO */}
                    <Text style={{ color: Colors.mottuDark, marginTop: 10 }}>Carregando mapa e localização...</Text>
                </View>
            );
        }
        
        if (permissionStatus !== 'granted') {
            return (
                <View style={PatioMapStyles.permissionContainer}>
                    {/* ESTAS LINHAS ESTÃO CORRETAS, MAS SE TIVESSE SÓ O TEXTO, DARIA ERRO */}
                    <Text style={PatioMapStyles.permissionText}>Permissão de localização não concedida.</Text>
                    <Text style={PatioMapStyles.permissionText}>Para visualizar o mapa, precisamos da sua localização.</Text>
                    <Button title="Solicitar Permissão" onPress={requestPermission} color={Colors.mottuGreen} />
                </View>
            );
        }

        const initialRegion = location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        } : patioLocation;

        return (
            <MapView
                style={PatioMapStyles.map}
                initialRegion={initialRegion}
            >
                
                {location && (
                    <Marker
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title="Sua Localização"
                        description="Você está aqui!"
                        pinColor={Colors.mottuDark} // Pino escuro para o usuário
                    />
                )}

                {/* Marcador do Pátio Principal (cor vibrante da Mottu) */}
                <Marker
                    coordinate={{ latitude: patioLocation.latitude, longitude: patioLocation.longitude }}
                    title="Pátio da Mottu"
                    description="Local principal da frota de motos."
                    pinColor={Colors.mottuGreen} // Usando a cor verde da Mottu para o pátio
                >
                    {/* Exemplo de Callout personalizado para o Pátio */}
                    <Callout tooltip>
                        <View style={PatioMapStyles.calloutContainer}>
                            <Text style={PatioMapStyles.calloutTitle}>Pátio da Mottu</Text>
                            <Text style={PatioMapStyles.calloutDescription}>Este é o ponto de controle das motos.</Text>
                        </View>
                    </Callout>
                </Marker>

                {/* Marcadores das Motos */}
                {motos.map(moto => (
                    <Marker
                        key={moto.id}
                        coordinate={{ latitude: moto.latitude, longitude: moto.longitude }}
                        title={`Moto: ${moto.placa}`}
                        description={`Status: ${moto.status}`}
                        pinColor={getPinColorForStatus(moto.status)} // Cor dinâmica baseada no status
                    >
                        {/* Se quiser usar um ícone personalizado para cada moto, você pode fazer assim:
                        <Image
                            source={require('../../assets/moto-icon.png')} // Certifique-se que o caminho esteja correto!
                            style={{ width: 30, height: 30, tintColor: getPinColorForStatus(moto.status) }} // Opcional: tingir o ícone
                        />
                        */}
                        <Callout tooltip>
                            <View style={PatioMapStyles.calloutContainer}>
                                <Text style={PatioMapStyles.calloutTitle}>{`Moto: ${moto.placa}`}</Text>
                                <Text style={PatioMapStyles.calloutDescription}>{`Status: ${moto.status}`}</Text>
                                {/* Adicione mais detalhes da moto aqui */}
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        );
    };

    return (
        <View style={PatioMapStyles.container}>
        {/* Cabeçalho da tela */}
        <View style={PatioMapStyles.header}>
            {/* ESTA LINHA ESTÁ CORRETA */}
            <Text style={PatioMapStyles.headerText}>Mapeamento da Frota</Text>
        </View>
        {renderMapContent()}
    </View>
    );
};

export default PatioMapScreen;