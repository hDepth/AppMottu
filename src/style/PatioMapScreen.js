import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; // Importar suas cores corretamente (com chaves se for export const)

const PatioMapStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mottuWhite, // Fundo geral do container, usando o branco da Mottu
    },
    header: {
        backgroundColor: Colors.mottuDark, // Cor do cabeçalho - usando o escuro da Mottu
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.mottuWhite, // Texto branco no cabeçalho
    },
    map: {
        flex: 1, // O mapa ocupa todo o espaço restante
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
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
        backgroundColor: Colors.mottuWhite,
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: Colors.mottuDark, // Texto escuro
    },
    calloutContainer: {
        width: 180,
        padding: 10,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 8,
        borderColor: Colors.mottuLightGray, // Borda clara
        borderWidth: 1,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        color: Colors.mottuDark,
    },
    calloutDescription: {
        fontSize: 14,
        color: Colors.mottuDark,
    },
    // Estilos para o botão de filtros (se for adicionar depois)
    filterButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: Colors.mottuGreen, // Botão com o verde da Mottu
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    filterButtonText: {
        color: Colors.mottuWhite,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default PatioMapStyles;