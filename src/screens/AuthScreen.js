// src/screens/AuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios'; // Para fazer requisições HTTP
import AuthStyles from '../style/AuthScreen';

const API_URL = 'http://10.0.2.2:3000'; // Mude para o IP da sua máquina ou localhost se estiver no emulador

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
        <View style={AuthStyles.container}>
            <Text style={AuthStyles.title}>{isLogin ? 'Login' : 'Registro'}</Text>
            <TextInput
                style={AuthStyles.input}
                placeholder="Nome de Usuário"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={AuthStyles.input}
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

export default AuthScreen;