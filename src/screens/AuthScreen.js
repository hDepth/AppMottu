// src/screens/AuthScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity, // Melhor para botões customizados
    Alert,
    ActivityIndicator, // Indicador de carregamento
    ScrollView, // Para evitar que o teclado cubra os inputs
    Animated, // Para animações
    KeyboardAvoidingView, // Para ajustar o layout quando o teclado aparece
    Platform, // Para identificar a plataforma
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Para padding seguro
import axios from 'axios';
import AuthStyles from '../style/AuthScreen';
import { Colors } from '../style/Colors'; // Importa as cores


const API_URL = 'http://10.0.2.2:3000'; // Não esqueça de ajustar este IP!

function AuthScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // Novo campo: email
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Novo campo: confirmar senha
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false); // Estado para o indicador de carregamento

    // Estados para validação
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Animação para o formulário
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000, // Duração da animação em milissegundos
            useNativeDriver: true, // Use o driver nativo para melhor performance
        }).start();
    }, [fadeAnim, isLogin]); // Reinicia a animação quando isLogin muda

    // Validações em tempo real
    const validateUsername = (text) => {
        setUsername(text);
        if (text.length < 3 && !isLogin) { // Mínimo de 3 caracteres para registro
            setUsernameError('O nome de usuário deve ter pelo menos 3 caracteres.');
        } else {
            setUsernameError('');
        }
    };

    const validateEmail = (text) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text) && !isLogin && text.length > 0) { // Valida formato de email
            setEmailError('Formato de e-mail inválido.');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (text) => {
        setPassword(text);
        if (!isLogin) { // Validações de senha apenas para registro
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
        // Resetar erros antes de cada tentativa
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validação final antes de enviar
        let hasError = false;

        if (isLogin) {
            if (!username) { setUsernameError('Nome de usuário é obrigatório.'); hasError = true; }
            if (!password) { setPasswordError('Senha é obrigatória.'); hasError = true; }
        } else { // Registro
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
                navigation.navigate('Home');
            } else {
                response = await axios.post(`${API_URL}/register`, { username, email, password });
                Alert.alert('Sucesso', response.data.message + ' Agora faça login.');
                setIsLogin(true); // Após o registro, volta para o login
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
                                // Resetar campos e erros ao trocar de modo
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0); // Reinicia a animação
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
                                // Resetar campos e erros ao trocar de modo
                                setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setUsernameError(''); setEmailError(''); setPasswordError(''); setConfirmPasswordError('');
                                fadeAnim.setValue(0); // Reinicia a animação
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
                                disabled={loading} // Desabilita o botão enquanto carrega
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