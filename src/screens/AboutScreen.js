// src/screens/AboutScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../style/Colors';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { t } from '../i18n';

export default function AboutScreen() {
  const [commitHash, setCommitHash] = useState('—');
  const [appVersion, setAppVersion] = useState('—');

  useEffect(() => {
    // 🔹 Puxa commitHash diretamente do app.json → expo.extra.commitHash
    const hash = Constants.expoConfig?.extra?.commitHash || '—';
    setCommitHash(hash);

    // 🔹 Versão do app (vem do app.json / package.json)
    const version = Application.nativeApplicationVersion || '1.0.0';
    setAppVersion(version);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="information-circle-outline"
            size={42}
            color={Colors.mottuGreen}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.title}>{t('about.title')}</Text>
          <Text style={styles.subtitle}>{t('about.subtitle')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.appInfo')}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>{t('about.appName')}</Text>
            <Text style={styles.value}>Mottu Digital</Text>

            <Text style={styles.label}>{t('about.version')}</Text>
            <Text style={styles.value}>{appVersion}</Text>

            <Text style={styles.label}>{t('about.commit')}</Text>
            <Text style={styles.value}>{commitHash}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.descriptionTitle')}</Text>
          <Text style={styles.text}>{t('about.descriptionText')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.developedBy')}</Text>
          <Text style={styles.text}>Pedro Henrique Jorge de Paula</Text>
          <Text style={styles.text}>2TDS · FIAP 2025</Text>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://github.com/seu-repo-aqui')}
          >
            <Ionicons name="logo-github" size={22} color={Colors.mottuDark} />
            <Text style={styles.linkText}>GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('mailto:seuemail@fiap.com')}
          >
            <Ionicons name="mail-outline" size={22} color={Colors.mottuDark} />
            <Text style={styles.linkText}>{t('about.contact')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('about.footer')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.mottuDark,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    color: Colors.mottuGreen,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mottuLightGray,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    backgroundColor: Colors.mottuGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.mottuGreen,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: Colors.mottuDark,
    borderRadius: 10,
    padding: 12,
  },
  label: {
    color: Colors.mottuLightGray,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    color: Colors.mottuWhite,
    fontSize: 14,
  },
  text: {
    color: Colors.mottuWhite,
    fontSize: 14,
    lineHeight: 20,
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mottuGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkText: {
    marginLeft: 6,
    fontWeight: '700',
    color: Colors.mottuDark,
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.mottuLightGray,
    fontSize: 12,
    textAlign: 'center',
  },
});
