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
import { useTheme } from '../context/ThemeContext'; // <-- Importa o tema

const API_URL = 'http://10.0.2.2:3000'; // ajuste este IP para o do backend

function AuthScreen({ navigation }) {
    const { theme } = useTheme(); // pega tema do contexto

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

                await AsyncStorage.setItem('user', JSON.stringify({ username }));
                navigation.replace('Home');
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
        <SafeAreaView style={[AuthStyles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={AuthStyles.container}>
                    <View style={AuthStyles.logoContainer}>
                        <Text style={[AuthStyles.logoText, { color: theme.accent }]}>MOTTU</Text>
                    </View>

                    <View style={AuthStyles.toggleButtonContainer}>
                        <TouchableOpacity
                            style={[
                                AuthStyles.toggleButton,
                                { backgroundColor: isLogin ? theme.accent : theme.card },
                            ]}
                            onPress={() => {
                                setIsLogin(true);
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0);
                                Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
                            }}
                        >
                            <Text style={{ color: isLogin ? theme.background : theme.text }}>
                                Login
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                AuthStyles.toggleButton,
                                { backgroundColor: !isLogin ? theme.accent : theme.card },
                            ]}
                            onPress={() => {
                                setIsLogin(false);
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0);
                                Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
                            }}
                        >
                            <Text style={{ color: !isLogin ? theme.background : theme.text }}>
                                Registrar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={[AuthStyles.fadeContainer, { opacity: fadeAnim }]}>
                        <View style={AuthStyles.formContainer}>
                            <TextInput
                                style={[
                                    AuthStyles.input,
                                    { backgroundColor: theme.card, color: theme.text },
                                    usernameError ? AuthStyles.inputError : {},
                                ]}
                                placeholder="Nome de Usuário"
                                placeholderTextColor={theme.text + '99'}
                                value={username}
                                onChangeText={validateUsername}
                                autoCapitalize="none"
                            />
                            {usernameError ? <Text style={{ color: theme.accent }}>{usernameError}</Text> : null}

                            {!isLogin && (
                                <>
                                    <TextInput
                                        style={[
                                            AuthStyles.input,
                                            { backgroundColor: theme.card, color: theme.text },
                                            emailError ? AuthStyles.inputError : {},
                                        ]}
                                        placeholder="E-mail"
                                        placeholderTextColor={theme.text + '99'}
                                        value={email}
                                        onChangeText={validateEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {emailError ? <Text style={{ color: theme.accent }}>{emailError}</Text> : null}
                                </>
                            )}

                            <TextInput
                                style={[
                                    AuthStyles.input,
                                    { backgroundColor: theme.card, color: theme.text },
                                    passwordError ? AuthStyles.inputError : {},
                                ]}
                                placeholder="Senha"
                                placeholderTextColor={theme.text + '99'}
                                value={password}
                                onChangeText={validatePassword}
                                secureTextEntry
                            />
                            {passwordError ? <Text style={{ color: theme.accent }}>{passwordError}</Text> : null}

                            {!isLogin && (
                                <>
                                    <TextInput
                                        style={[
                                            AuthStyles.input,
                                            { backgroundColor: theme.card, color: theme.text },
                                            confirmPasswordError ? AuthStyles.inputError : {},
                                        ]}
                                        placeholder="Confirme a Senha"
                                        placeholderTextColor={theme.text + '99'}
                                        value={confirmPassword}
                                        onChangeText={validateConfirmPassword}
                                        secureTextEntry
                                    />
                                    {confirmPasswordError ? <Text style={{ color: theme.accent }}>{confirmPasswordError}</Text> : null}
                                </>
                            )}

                            <TouchableOpacity
                                style={[
                                    AuthStyles.button,
                                    { backgroundColor: theme.accent },
                                ]}
                                onPress={handleAuthenticate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={theme.background} size="small" />
                                ) : (
                                    <Text style={[AuthStyles.buttonText, { color: theme.background }]}>
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
