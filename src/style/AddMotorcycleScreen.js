// src/style/AddMotorcycleScreen.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

const AddMotorcycleStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.mottuDark,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 10,
        shadowColor: Colors.mottuDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    label: {
        fontSize: 16,
        color: Colors.mottuDark,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.mottuWhite,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
        color: Colors.mottuDark,
        fontSize: 16,
    },
    inputError: {
        borderColor: Colors.mottuError,
        borderWidth: 2,
    },
    errorText: {
        color: Colors.mottuError,
        fontSize: 12,
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginLeft: 5,
    },
    // Estilos para a imagem do modelo selecionado
    selectedImageContainer: {
        width: '100%',
        height: 150, // Altura da imagem de pré-visualização
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: Colors.mottuLightGray,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
    },
    selectedMotorcycleImage: {
        width: '100%',
        height: '100%',
    },
    // Estilos para o Picker (já existente, mas pode ser ajustado)
    pickerContainer: {
        width: '100%',
        backgroundColor: Colors.mottuWhite,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        color: Colors.mottuDark,
        height: 50,
    },
    pickerItem: {
        color: Colors.mottuDark,
    },
    button: {
        backgroundColor: Colors.mottuGreen,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: Colors.mottuDark,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddMotorcycleStyles;