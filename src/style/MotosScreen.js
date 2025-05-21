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
        marginBottom: 20,
        textAlign: 'center',
        paddingTop: 10,
    },
    // NOVO: Contêiner para a barra de pesquisa e o botão de filtro
    searchAndFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        // Remover shadow daqui, colocar no searchInput para controle individual
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 10, // Um pouco mais arredondado
        paddingHorizontal: 15,
        color: Colors.mottuDark,
        fontSize: 16,
        marginRight: 10, // Espaçamento entre o input e o botão de filtro
        shadowColor: Colors.mottuDark, // Sombra para o input
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    // NOVO: Botão de ícone para abrir o modal de filtros
    filterButtonIcon: {
        width: 80, // Largura fixa para o botão
        height: 50,
        backgroundColor: Colors.mottuGreen,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    filterButtonIconText: {
        color: Colors.mottuDark, // Texto preto para o botão verde
        fontWeight: 'bold',
        fontSize: 15,
    },
    // NOVO: Contêiner para exibir os chips de filtros ativos
    activeFiltersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Permite que os chips quebrem a linha
        marginBottom: 15,
        minHeight: 30, // Garante altura mínima mesmo sem filtros
        alignItems: 'center', // Centraliza verticalmente se houver apenas texto
    },
    activeFilterChip: {
        flexDirection: 'row',
        backgroundColor: Colors.mottuGreen, // Fundo verde para chips ativos
        borderRadius: 15,
        paddingVertical: 6,
        paddingLeft: 12,
        paddingRight: 8,
        marginRight: 8,
        marginBottom: 5,
        alignItems: 'center',
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    activeFilterChipText: {
        color: Colors.mottuDark,
        fontSize: 13,
        fontWeight: '600',
    },
    removeFilterButton: {
        marginLeft: 5,
        padding: 2,
        borderRadius: 10,
        backgroundColor: Colors.mottuDark, // Fundo escuro para o "x"
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeFilterText: {
        color: Colors.mottuWhite,
        fontSize: 10,
        fontWeight: 'bold',
    },
    noFiltersText: {
        color: Colors.mottuLightGray,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        width: '100%', // Para centralizar
    },
    // Removemos filterSectionTitle, filterChipsContainer, filterChip, filterChipActive, filterChipText, filterChipTextActive daqui
    // pois eles agora estão no FilterModalStyle.

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