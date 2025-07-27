import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Basic translation dictionary for instant translation
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    prescriptions: 'Prescriptions',
    billing: 'Billing',
    'lab-orders': 'Lab Orders',
    reports: 'Reports',
    // Common UI
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    // Healthcare specific
    'patient-name': 'Patient Name',
    'date-of-birth': 'Date of Birth',
    'medical-record': 'Medical Record',
    'insurance-info': 'Insurance Information',
    'vital-signs': 'Vital Signs',
    // Dashboard
    'total-patients': 'Total Patients',
    'pending-appointments': 'Pending Appointments',
    'active-prescriptions': 'Active Prescriptions',
    'recent-activity': 'Recent Activity',
    // Profile & Settings
    'profile-settings': 'Profile Settings',
    'account-preferences': 'Account Preferences',
    'notification-settings': 'Notification Settings',
    'display-language': 'Display & Language',
    'security-privacy': 'Security & Privacy',
    'save-preferences': 'Save Preferences',
    'language': 'Language',
    'timezone': 'Timezone',
    'theme': 'Theme',
  },
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    patients: 'Pacientes',
    appointments: 'Citas',
    prescriptions: 'Recetas',
    billing: 'Facturación',
    'lab-orders': 'Órdenes de Laboratorio',
    reports: 'Informes',
    // Common UI
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    // Healthcare specific
    'patient-name': 'Nombre del Paciente',
    'date-of-birth': 'Fecha de Nacimiento',
    'medical-record': 'Historial Médico',
    'insurance-info': 'Información del Seguro',
    'vital-signs': 'Signos Vitales',
    // Dashboard
    'total-patients': 'Total de Pacientes',
    'pending-appointments': 'Citas Pendientes',
    'active-prescriptions': 'Recetas Activas',
    'recent-activity': 'Actividad Reciente',
    // Profile & Settings
    'profile-settings': 'Configuración de Perfil',
    'account-preferences': 'Preferencias de Cuenta',
    'notification-settings': 'Configuración de Notificaciones',
    'display-language': 'Pantalla e Idioma',
    'security-privacy': 'Seguridad y Privacidad',
    'save-preferences': 'Guardar Preferencias',
    'language': 'Idioma',
    'timezone': 'Zona Horaria',
    'theme': 'Tema',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    patients: 'Patients',
    appointments: 'Rendez-vous',
    prescriptions: 'Ordonnances',
    billing: 'Facturation',
    'lab-orders': 'Analyses de Laboratoire',
    reports: 'Rapports',
    // Common UI
    save: 'Sauvegarder',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    // Healthcare specific
    'patient-name': 'Nom du Patient',
    'date-of-birth': 'Date de Naissance',
    'medical-record': 'Dossier Médical',
    'insurance-info': 'Informations d\'Assurance',
    'vital-signs': 'Signes Vitaux',
    // Dashboard
    'total-patients': 'Total des Patients',
    'pending-appointments': 'Rendez-vous en Attente',
    'active-prescriptions': 'Ordonnances Actives',
    'recent-activity': 'Activité Récente',
    // Profile & Settings
    'profile-settings': 'Paramètres de Profil',
    'account-preferences': 'Préférences de Compte',
    'notification-settings': 'Paramètres de Notification',
    'display-language': 'Affichage et Langue',
    'security-privacy': 'Sécurité et Confidentialité',
    'save-preferences': 'Enregistrer les Préférences',
    'language': 'Langue',
    'timezone': 'Fuseau Horaire',
    'theme': 'Thème',
  },
  de: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patienten',
    appointments: 'Termine',
    prescriptions: 'Verschreibungen',
    billing: 'Abrechnung',
    'lab-orders': 'Laboraufträge',
    reports: 'Berichte',
    // Common UI
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    add: 'Hinzufügen',
    search: 'Suchen',
    filter: 'Filtern',
    // Healthcare specific
    'patient-name': 'Patientenname',
    'date-of-birth': 'Geburtsdatum',
    'medical-record': 'Krankenakte',
    'insurance-info': 'Versicherungsinformationen',
    'vital-signs': 'Vitalzeichen',
    // Dashboard
    'total-patients': 'Gesamte Patienten',
    'pending-appointments': 'Ausstehende Termine',
    'active-prescriptions': 'Aktive Verschreibungen',
    'recent-activity': 'Letzte Aktivität',
    // Profile & Settings
    'profile-settings': 'Profileinstellungen',
    'account-preferences': 'Kontoeinstellungen',
    'notification-settings': 'Benachrichtigungseinstellungen',
    'display-language': 'Anzeige und Sprache',
    'security-privacy': 'Sicherheit und Datenschutz',
    'save-preferences': 'Einstellungen Speichern',
    'language': 'Sprache',
    'timezone': 'Zeitzone',
    'theme': 'Design',
  }
};

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Initialize with saved language if available
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Remove conflicting language change event listener that might be causing resets

  const setLanguage = (language: string) => {
    if (language === currentLanguage) {
      return;
    }
    
    setIsTranslating(true);
    localStorage.setItem('selectedLanguage', language);
    
    // Immediate update without timeout to prevent reversion
    setCurrentLanguage(language);
    
    setTimeout(() => {
      setIsTranslating(false);
    }, 300);
  };

  const t = (key: string): string => {
    try {
      const languageDict = translations[currentLanguage as keyof typeof translations] || translations.en;
      const translation = languageDict[key as keyof typeof languageDict];
      return translation || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      isTranslating
    }}>
      {children}
    </TranslationContext.Provider>
  );
};