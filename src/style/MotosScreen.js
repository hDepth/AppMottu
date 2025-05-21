// src/style/MotosScreen.js
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './Colors';

const { width } = Dimensions.get('window');

const MotosStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark,
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: Colors.mottuDark,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        marginBottom: 20, // Ajuste para dar espaço à barra de filtros
        textAlign: 'center',
        paddingTop: 10,
    },
    // NOVOS ESTILOS PARA A BARRA DE FILTROS
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 5, // Pequeno padding para as bordas
        minHeight: 45, // Garante altura mínima para scroll
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: Colors.mottuLightGray, // Cor de fundo para botões inativos
        marginHorizontal: 5, // Espaçamento entre os botões
        borderWidth: 1,
        borderColor: Colors.mottuDark,
        minWidth: 90, // Largura mínima para botões menores
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: Colors.mottuGreen, // Cor de fundo para o botão ativo
        borderColor: Colors.mottuGreen,
    },
    filterButtonText: {
        color: Colors.mottuDark,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    filterButtonTextActive: {
        color: Colors.mottuDark, // Texto preto para contraste no verde
    },
    listContent: {
        paddingBottom: 80,
        paddingTop: 5,
    },
    card: {
        backgroundColor: Colors.mottuWhite,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 18,
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 10,
        flexDirection: 'row',
    },
    imageContainer: {
        width: width * 0.35,
        height: 120,
        backgroundColor: Colors.mottuLightGray,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    motorcycleImage: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        flex: 1,
        padding: 15,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    statusBadgeContainer: {
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    statusBadge: {
        fontSize: 13,
        fontWeight: 'bold',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        overflow: 'hidden',
        color: Colors.mottuWhite,
    },
    statusAvailable: {
        backgroundColor: Colors.mottuSuccess,
    },
    statusMaintenance: {
        backgroundColor: Colors.mottuError,
    },
    statusRented: {
        backgroundColor: Colors.mottuGreen,
    },
    statusPending: {
        backgroundColor: '#FFA000',
    },
    emptyListText: {
        color: Colors.mottuLightGray,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: Colors.mottuGreen,
        borderRadius: 30,
        elevation: 8,
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    fabText: {
        fontSize: 30,
        color: Colors.mottuDark,
        lineHeight: 30,
    }
});

export default MotosStyles;