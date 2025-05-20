// src/styles/HomeStyles.js
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

const HomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.mottuDark, // Fundo escuro para a Home também
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.mottuGreen, // Título em verde
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: Colors.mottuWhite, // Subtítulo em branco
    },
    button: {
        backgroundColor: Colors.mottuGreen,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: Colors.mottuDark,
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 16,
        marginTop: 10,
        color: Colors.mottuLightGray,
        textAlign: 'center',
    },
});

export default HomeStyles;