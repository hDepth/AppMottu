// src/screens/AuthScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStyles from '../style/AuthScreen';
import { Colors } from '../style/Colors';

const API_URL = 'http://10.0.2.2:3000'; // ajuste este IP para o do backend

function AuthScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Estados de validação
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Animação
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, isLogin]);

    // Validações em tempo real
    const validateUsername = (text) => {
        setUsername(text);
        if (text.length < 3 && !isLogin) {
            setUsernameError('O nome de usuário deve ter pelo menos 3 caracteres.');
        } else {
            setUsernameError('');
        }
    };

    const validateEmail = (text) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text) && !isLogin && text.length > 0) {
            setEmailError('Formato de e-mail inválido.');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (text) => {
        setPassword(text);
        if (!isLogin) {
            if (text.length < 6) {
                setPasswordError('A senha deve ter pelo menos 6 caracteres.');
            } else if (!/[A-Z]/.test(text)) {
                setPasswordError('A senha deve conter pelo menos uma letra maiúscula.');
            } else if (!/[a-z]/.test(text)) {
                setPasswordError('A senha deve conter pelo menos uma letra minúscula.');
            } else if (!/[0-9]/.test(text)) {
                setPasswordError('A senha deve conter pelo menos um número.');
            } else if (!/[!@#$%^&*()]/.test(text)) {
                setPasswordError('A senha deve conter pelo menos um caractere especial.');
            } else {
                setPasswordError('');
            }
            if (confirmPassword.length > 0 && text !== confirmPassword) {
                setConfirmPasswordError('As senhas não coincidem.');
            } else if (confirmPassword.length > 0) {
                setConfirmPasswordError('');
            }
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (text) => {
        setConfirmPassword(text);
        if (!isLogin && text !== password) {
            setConfirmPasswordError('As senhas não coincidem.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleAuthenticate = async () => {
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        let hasError = false;

        if (isLogin) {
            if (!username) { setUsernameError('Nome de usuário é obrigatório.'); hasError = true; }
            if (!password) { setPasswordError('Senha é obrigatória.'); hasError = true; }
        } else {
            if (!username || username.length < 3) { setUsernameError('O nome de usuário deve ter pelo menos 3 caracteres.'); hasError = true; }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('E-mail inválido.'); hasError = true; }
            if (!password || password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()]/.test(password)) {
                setPasswordError('Senha fraca. Requisitos: 6+ caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial.');
                hasError = true;
            }
            if (!confirmPassword || password !== confirmPassword) {
                setConfirmPasswordError('As senhas não coincidem.');
                hasError = true;
            }
        }

        if (hasError) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os campos destacados.');
            return;
        }

        setLoading(true);
        try {
            let response;
            if (isLogin) {
                response = await axios.post(`${API_URL}/login`, { username, password });
                Alert.alert('Sucesso', response.data.message);

                // Salva usuário logado no AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify({ username }));

                navigation.replace('Home'); // troca a pilha e vai para Home
            } else {
                response = await axios.post(`${API_URL}/register`, { username, email, password });
                Alert.alert('Sucesso', response.data.message + ' Agora faça login.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error('Erro de autenticação:', error.response ? error.response.data : error.message);
            Alert.alert(
                'Erro',
                error.response ? (error.response.data.message || 'Erro desconhecido.') : 'Não foi possível conectar ao servidor. Verifique sua conexão e o IP da API.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={AuthStyles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={AuthStyles.container}>
                    <View style={AuthStyles.logoContainer}>
                        <Text style={AuthStyles.logoText}>MOTTU</Text>
                    </View>

                    <View style={AuthStyles.toggleButtonContainer}>
                        <TouchableOpacity
                            style={[AuthStyles.toggleButton, isLogin && AuthStyles.toggleButtonActive]}
                            onPress={() => {
                                setIsLogin(true);
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0);
                                Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
                            }}
                        >
                            <Text style={[AuthStyles.toggleButtonText, isLogin && AuthStyles.toggleButtonTextActive]}>
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[AuthStyles.toggleButton, !isLogin && AuthStyles.toggleButtonActive]}
                            onPress={() => {
                                setIsLogin(false);
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0);
                                Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
                            }}
                        >
                            <Text style={[AuthStyles.toggleButtonText, !isLogin && AuthStyles.toggleButtonTextActive]}>
                                Registrar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={[AuthStyles.fadeContainer, { opacity: fadeAnim }]}>
                        <View style={AuthStyles.formContainer}>
                            <TextInput
                                style={[AuthStyles.input, usernameError ? AuthStyles.inputError : {}]}
                                placeholder="Nome de Usuário"
                                placeholderTextColor={Colors.mottuLightGray}
                                value={username}
                                onChangeText={validateUsername}
                                autoCapitalize="none"
                            />
                            {usernameError ? <Text style={AuthStyles.errorText}>{usernameError}</Text> : null}

                            {!isLogin && (
                                <>
                                    <TextInput
                                        style={[AuthStyles.input, emailError ? AuthStyles.inputError : {}]}
                                        placeholder="E-mail"
                                        placeholderTextColor={Colors.mottuLightGray}
                                        value={email}
                                        onChangeText={validateEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {emailError ? <Text style={AuthStyles.errorText}>{emailError}</Text> : null}
                                </>
                            )}

                            <TextInput
                                style={[AuthStyles.input, passwordError ? AuthStyles.inputError : {}]}
                                placeholder="Senha"
                                placeholderTextColor={Colors.mottuLightGray}
                                value={password}
                                onChangeText={validatePassword}
                                secureTextEntry
                            />
                            {passwordError ? <Text style={AuthStyles.errorText}>{passwordError}</Text> : null}

                            {!isLogin && (
                                <>
                                    <TextInput
                                        style={[AuthStyles.input, confirmPasswordError ? AuthStyles.inputError : {}]}
                                        placeholder="Confirme a Senha"
                                        placeholderTextColor={Colors.mottuLightGray}
                                        value={confirmPassword}
                                        onChangeText={validateConfirmPassword}
                                        secureTextEntry
                                    />
                                    {confirmPasswordError ? <Text style={AuthStyles.errorText}>{confirmPasswordError}</Text> : null}
                                </>
                            )}

                            <TouchableOpacity
                                style={AuthStyles.button}
                                onPress={handleAuthenticate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.mottuDark} size="small" />
                                ) : (
                                    <Text style={AuthStyles.buttonText}>
                                        {isLogin ? 'Entrar' : 'Registrar'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default AuthScreen;
