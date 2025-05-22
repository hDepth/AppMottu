import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%', // Ajuste para a largura que deseja, '100%' é comum
        height: '100%', // Ajuste para a altura que deseja. Flex 1 no container pode gerenciar
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, // Preenche a tela toda
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo semi-transparente
        zIndex: 10,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default styles;