// src/i18n/index.js
import DefaultI18n from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './en-US.json';
import pt from './pt-BR.json';

let i18n;

// 🧠 Inicialização defensiva
try {
  if (DefaultI18n?.t && typeof DefaultI18n.t === 'function') {
    // Já é uma instância válida
    i18n = DefaultI18n;
    console.log('[i18n] usando instância existente de i18n-js');
  } else if (typeof DefaultI18n === 'function') {
    // É um construtor
    i18n = new DefaultI18n();
    console.log('[i18n] instanciado via "new DefaultI18n()"');
  } else if (DefaultI18n?.default && typeof DefaultI18n.default === 'function') {
    i18n = new DefaultI18n.default();
    console.log('[i18n] instanciado via "new DefaultI18n.default()"');
  } else if (DefaultI18n?.default && typeof DefaultI18n.default.t === 'function') {
    i18n = DefaultI18n.default;
    console.log('[i18n] usando DefaultI18n.default (instância)');
  } else {
    console.warn('[i18n] import inesperado de i18n-js:', DefaultI18n);
    i18n = {
      fallbacks: true,
      locale: 'pt-BR',
      translations: {},
      t: (k) => k,
    };
  }
} catch (err) {
  console.warn('[i18n] erro ao inicializar:', err);
  i18n = {
    fallbacks: true,
    locale: 'pt-BR',
    translations: {},
    t: (k) => k,
  };
}

// ✅ Assegura que i18n tem estrutura mínima
if (!i18n.translations) i18n.translations = {};
if (!i18n.t) i18n.t = (key) => key;

// ✅ Define fallbacks e adiciona traduções
i18n.fallbacks = true;
i18n.translations = {
  en,
  'en-US': en,
  pt,
  'pt-BR': pt,
};

// ⚙️ Detecta idioma e aplica
export const initLocalization = async () => {
  try {
    const locales =
      (Localization.getLocales && Localization.getLocales()) || [
        { languageTag: 'pt-BR' },
      ];
    const locale = locales?.[0]?.languageTag || 'pt-BR';
    i18n.locale = locale;
    console.log(`[i18n] locale definido para: ${i18n.locale}`);

    i18n.locale = i18n.locale.includes('pt') ? 'pt-BR' :
               i18n.locale.includes('en') ? 'en-US' :
               i18n.locale;

    console.log(`[i18n] locale ajustado para: ${i18n.locale}`);
  } catch (error) {
    console.warn('[i18n] Erro ao detectar idioma:', error);
    i18n.locale = 'pt-BR';
  }
};

// ✅ Função segura de tradução
export const t = (key, options = {}) => {
  try {
    const result = i18n.t(key, options);
    if (!result || result === key) {
      console.warn('[i18n] chave não encontrada:', key);
    }
    return result || key;
  } catch (e) {
    console.warn('[i18n] erro em t():', e, 'key:', key);
    return key;
  }
};

// Debug opcional: mostra estrutura carregada
console.log('[i18n] estrutura final:', {
  locale: i18n.locale,
  temTranslacoes: Object.keys(i18n.translations || {}),
  exemplo: i18n.t ? i18n.t('profile.role') : '(sem t)',
});

export default i18n;
