// src/style/ManageLocationsScreen.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; // Importa as cores da sua paleta

const ManageLocationsStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: Colors.mottuDark,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        marginBottom: 25,
        textAlign: 'center',
        paddingTop: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 10,
        paddingHorizontal: 15,
        color: Colors.mottuDark,
        fontSize: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
    },
    addButton: {
        backgroundColor: Colors.mottuGreen,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: Colors.mottuDark,
        fontWeight: 'bold',
        fontSize: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.mottuWhite,
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    listContent: {
        paddingBottom: 20,
    },
    locationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.mottuWhite,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    locationName: {
        fontSize: 18,
        color: Colors.mottuDark,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: Colors.mottuError,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    deleteButtonText: {
        color: Colors.mottuWhite,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyListText: {
        color: Colors.mottuLightGray,
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
    },
});

export default ManageLocationsStyles;