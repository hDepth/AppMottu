// src/i18n/index.js
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Importe os 3 idiomas
import en from './en-US.json';
import pt from './pt-BR.json';
import es from './es-ES.json'; // 👈 NOVO

const i18n = new I18n();

// ✅ Define fallbacks e adiciona traduções
i18n.fallbacks = true;
i18n.translations = {
  en,
  'en-US': en,
  pt,
  'pt-BR': pt,
  es,         // 👈 NOVO
  'es-ES': es, // 👈 NOVO
};

// ⚙️ Detecta idioma e aplica
export const initLocalization = () => {
  try {
    const locales = Localization.getLocales() || [{ languageTag: 'pt-BR' }];
    const locale = locales[0]?.languageTag || 'pt-BR';
    i18n.locale = locale;
    
    // Normaliza o locale
    if (i18n.locale.includes('pt')) {
      i18n.locale = 'pt-BR';
    } else if (i18n.locale.includes('en')) {
      i18n.locale = 'en-US';
    } else if (i18n.locale.includes('es')) { // 👈 NOVO
      i18n.locale = 'es';
    }
    
    console.log(`[i18n] Locale definido para: ${i18n.locale}`);
  } catch (error) {
    console.warn('[i18n] Erro ao detectar idioma, usando pt-BR:', error);
    i18n.locale = 'pt-BR';
  }
};

initLocalization();

// ✅ Função segura de tradução
export const t = (key, options = {}) => {
  try {
    const result = i18n.t(key, options);
    return result;
  } catch (e) {
    console.warn('[i18n] erro em t():', e, 'key:', key);
    return key;
  }
};

console.log(`[i18n] estrutura final carregada. Locale: ${i18n.locale}`);
console.log(`[i18n] Exemplo (profile.role): ${i18n.t('profile.role')}`);

export default i18n;