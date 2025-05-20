// src/styles/HomeStyles.js
import { StyleSheet } from 'react-native';

const HomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#e0f7fa', // Um fundo mais claro para a Home
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#00796b',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: '#004d40',
    },
    infoText: {
        fontSize: 16,
        marginTop: 10,
        color: '#333',
    },
});

export default HomeStyles;