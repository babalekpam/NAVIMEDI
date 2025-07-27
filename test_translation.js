const translations = {
  en: { patients: 'Patients', appointments: 'Appointments' },
  fr: { patients: 'Patients', appointments: 'Rendez-vous' },
  es: { patients: 'Pacientes', appointments: 'Citas' }
};

function t(key, lang = 'en') {
  const languageDict = translations[lang] || translations.en;
  return languageDict[key] || key;
}

console.log('EN:', t('patients', 'en'), t('appointments', 'en'));
console.log('FR:', t('patients', 'fr'), t('appointments', 'fr'));
console.log('ES:', t('patients', 'es'), t('appointments', 'es'));
