import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Auth');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle-outline" size={100} color={theme.accent} />
      </View>

      {/* Nome e Cargo */}
      <Text style={[styles.name, { color: theme.text }]}>
        {user?.username || 'Funcionário'}
      </Text>
      <Text style={[styles.role, { color: theme.accent }]}>
        Encarregado de Pátio
      </Text>

      {/* Informações adicionais */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoLabel, { color: theme.text }]}>ID Funcionário</Text>
        <Text style={[styles.infoValue, { color: theme.accent }]}>#MOT-1029</Text>

        <Text style={[styles.infoLabel, { color: theme.text }]}>Pátio Responsável</Text>
        <Text style={[styles.infoValue, { color: theme.accent }]}>Pátio Central - SP</Text>

        <Text style={[styles.infoLabel, { color: theme.text }]}>Motos sob supervisão</Text>
        <Text style={[styles.infoValue, { color: theme.accent }]}>128</Text>
      </View>

      {/* Botão Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.accent }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.accent} />
        <Text style={[styles.logoutText, { color: theme.accent }]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginTop: 30,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    marginBottom: 24,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#555',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
