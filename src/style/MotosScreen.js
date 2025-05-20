// src/styles/MotosStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

const MotosStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark,
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: Colors.mottuDark,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        marginBottom: 20,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20, // Espaçamento na parte inferior da lista
    },
    card: {
        backgroundColor: Colors.mottuWhite,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 5,
    },
    cardText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    statusText: {
        fontWeight: 'bold',
    },
    statusAvailable: {
        color: Colors.mottuSuccess, // Verde para disponível
    },
    statusMaintenance: {
        color: Colors.mottuError, // Vermelho para manutenção
    },
    statusRented: {
        color: Colors.mottuGreen, // Verde para alugada (pode ser ajustado)
    },
    emptyListText: {
        color: Colors.mottuLightGray,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});

export default MotosStyles;