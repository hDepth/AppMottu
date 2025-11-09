import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
// ⚠️ Importe o I18n e o t do seu index.js!
import I18n, { t } from '../i18n/'; 

const LOCALE_KEY = '@mottuApp:locale';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  // Define o estado inicial com o locale já carregado pelo i18n
  const [locale, setLocale] = useState(I18n.locale || 'pt-BR'); 

  useEffect(() => {
    const loadData = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));

      // Carrega o idioma salvo, se não houver, usa o que já foi detectado
      const saved = await AsyncStorage.getItem(LOCALE_KEY);
      const initialLocale = saved || I18n.locale;
      if (saved) {
        I18n.locale = saved;
      }
      setLocale(initialLocale);
    };
    loadData();
  }, []);

  const changeLanguage = async (newLocale) => {
    try {
      I18n.locale = newLocale;
      await AsyncStorage.setItem(LOCALE_KEY, newLocale);
      setLocale(newLocale); // Força a re-renderização da tela com o novo estado
      
      // O Alert agora vai usar o idioma que acabamos de definir
      Alert.alert(t('profile.languageChangedTitle'), t('profile.languageChanged'));
    } catch (e) {
      console.error('Erro ao trocar idioma', e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Auth');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={100} color={theme.accent} />
        </View>

        {/* Nome e cargo */}
        <Text style={[styles.name, { color: theme.text }]}>
          {user?.username || t('profile.defaultUser')}
        </Text>
        <Text style={[styles.role, { color: theme.accent }]}>
          {t('profile.role')}
        </Text>

        {/* Infos extras */}
        <View style={[styles.infoBox, { borderColor: theme.text }]}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>{t('profile.employeeId')}</Text>
          <Text style={[styles.infoValue, { color: theme.accent }]}>#MOT-1029</Text>

          <Text style={[styles.infoLabel, { color: theme.text }]}>{t('profile.patio')}</Text>
          <Text style={[styles.infoValue, { color: theme.accent }]}>Pátio Central - SP</Text>

          <Text style={[styles.infoLabel, { color: theme.text }]}>{t('profile.motos')}</Text>
          <Text style={[styles.infoValue, { color: theme.accent }]}>128</Text>
        </View>

        {/* Seção de idioma */}
        <View style={styles.langSection}>
          <Text style={[styles.langTitle, { color: theme.text }]}>
            {t('profile.chooseLanguage')}
          </Text>

          <View style={styles.langButtons}>
            {/* Botão Português */}
            <TouchableOpacity
              style={[styles.langButton, locale === 'pt-BR' && styles.langButtonActive]}
              onPress={() => changeLanguage('pt-BR')}
            >
              <Text style={[styles.langText, locale === 'pt-BR' && styles.langTextActive]}>
                {t('profile.langPt')} {/* 👈 MUDANÇA */}
              </Text>
            </TouchableOpacity>

            {/* Botão Inglês */}
            <TouchableOpacity
              style={[styles.langButton, locale === 'en-US' && styles.langButtonActive]}
              onPress={() => changeLanguage('en-US')}
            >
              <Text style={[styles.langText, locale === 'en-US' && styles.langTextActive]}>
                {t('profile.langEn')} {/* 👈 MUDANÇA */}
              </Text>
            </TouchableOpacity>
            
            {/* 👈 NOVO BOTÃO DE ESPANHOL */}
            <TouchableOpacity
              style={[styles.langButton, locale === 'es' && styles.langButtonActive]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={[styles.langText, locale === 'es' && styles.langTextActive]}>
                {t('profile.langEs')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.accent }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.accent} />
          <Text style={[styles.logoutText, { color: theme.accent }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', padding: 24 },
  avatarContainer: { marginTop: 30, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold' },
  role: { fontSize: 16, marginBottom: 24 },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
  },
  infoLabel: { fontSize: 14, opacity: 0.8, marginTop: 8 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  langSection: { marginBottom: 30, width: '100%', alignItems: 'center' },
  langTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  langButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }, // 👈 Adicionei wrap e center
  langButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#444',
  },
  langButtonActive: { backgroundColor: '#00c853' },
  langText: { color: '#fff', fontWeight: '700' },
  langTextActive: { color: '#000' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
});