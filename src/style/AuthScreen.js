// src/styles/AuthStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; // Importa as cores

const AuthStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.mottuDark, // Fundo escuro
    },
    container: {
        flexGrow: 1, // Para ScrollView
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.mottuDark,
    },
    logoContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.mottuGreen,
        textShadowColor: 'rgba(0, 0, 0, 0.75)', // Sombra para o logo
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    toggleButtonContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        backgroundColor: Colors.mottuDark,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.mottuLightGray,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.mottuLightGray,
    },
    toggleButtonActive: {
        backgroundColor: Colors.mottuGreen,
    },
    toggleButtonTextActive: {
        color: Colors.mottuDark,
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
        alignSelf: 'flex-start', // Alinha o texto de erro à esquerda
        marginLeft: 5,
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
    // Estilos para o Animated.View (opcional, pode ser ajustado)
    fadeContainer: {
        width: '100%',
        alignItems: 'center',
    },
});

export default AuthStyles;