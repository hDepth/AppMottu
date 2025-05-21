// src/style/PatioMapScreen.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; // Importa as cores da sua paleta

const PatioMapStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.mottuDark,
        paddingTop: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        marginBottom: 15,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 16,
        color: Colors.mottuLightGray,
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    locationCard: {
        backgroundColor: Colors.mottuWhite,
        borderRadius: 12, // Um pouco mais arredondado
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 7, // Maior elevação
        minHeight: 100, // Altura mínima para o cartão
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
    },
    locationName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.mottuDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    motorcycleCount: {
        fontSize: 18,
        color: Colors.mottuGreen,
        fontWeight: '600',
    },
    emptyListText: {
        color: Colors.mottuLightGray,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default PatioMapStyles;