// src/screens/AuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // Para fazer requisições HTTP

const API_URL = 'http://seu_ip_da_maquina_backend:3000'; // Mude para o IP da sua máquina ou localhost se estiver no emulador

function AuthScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // Alterna entre login e registro

    const handleAuthenticate = async () => {
        try {
            let response;
            if (isLogin) {
                response = await axios.post(`${API_URL}/login`, { username, password });
                Alert.alert('Sucesso', response.data.message);
                // Se o login for bem-sucedido, navegar para a tela principal (ex: Home)
                navigation.navigate('Home'); // Você precisará criar a tela 'Home' e configurar a navegação
            } else {
                response = await axios.post(`${API_URL}/register`, { username, password });
                Alert.alert('Sucesso', response.data.message);
                setIsLogin(true); // Após o registro, pode-se voltar para a tela de login
            }
        } catch (error) {
            console.error('Erro de autenticação:', error.response ? error.response.data : error.message);
            Alert.alert('Erro', error.response ? error.response.data.message : 'Não foi possível conectar ao servidor.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Login' : 'Registro'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome de Usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button
                title={isLogin ? 'Entrar' : 'Registrar'}
                onPress={handleAuthenticate}
            />
            <Button
                title={isLogin ? 'Criar uma conta' : 'Já tenho uma conta'}
                onPress={() => setIsLogin(!isLogin)}
                color="#6200EE"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});

export default AuthScreen;