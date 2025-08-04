import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Clean translation dictionary with complete coverage for all languages
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    prescriptions: 'Prescriptions',
    'pharmacy-dashboard': 'Pharmacy Dashboard',
    billing: 'Billing',
    'lab-orders': 'Lab Orders',
    'health-recommendations': 'AI Health Insights',
    'medical-communications': 'Medical Communications',
    'user-roles': 'User Roles',
    'tenant-management': 'Tenant Management',
    'audit-logs': 'Audit Logs',
    'white-label-settings': 'White Label Settings',
    'offline-mode': 'Offline Mode',
    'trial-status': 'Trial Status',
    reports: 'Reports',
    
    // Common UI
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    'no-data': 'No data available',
    'view-all': 'View All',
    'view-details': 'View Details',
    close: 'Close',
    submit: 'Submit',
    'try-again': 'Try Again',
    refresh: 'Refresh',
    
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
    'platform-overview': 'Platform Overview',
    'system-health': 'System Health',
    'active-tenants': 'Active Tenants',
    'total-tenants': 'Total Tenants',
    'monthly-revenue': 'Monthly Revenue',
    'growth-rate': 'Growth Rate',
    'welcome-back': 'Welcome back',
    'quick-stats': 'Quick Stats',
    
    // Profile & Settings
    'profile-settings': 'Profile Settings',
    'account-preferences': 'Account Preferences',
    'notification-settings': 'Notification Settings',
    'display-language': 'Display & Language',
    'security-privacy': 'Security & Privacy',
    'save-preferences': 'Save Preferences',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    
    // Forms and Actions
    'first-name': 'First Name',
    'last-name': 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    create: 'Create',
    update: 'Update',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    'my-account': 'My Account',
    'sign-out': 'Sign Out',
    
    // Status and States
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'in-progress': 'In Progress',
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    'checked-in': 'Checked In',
    'no-show': 'No Show',
    prescribed: 'Prescribed',
    'sent-to-pharmacy': 'Sent to Pharmacy',
    filled: 'Filled',
    'picked-up': 'Picked Up',
    
    // Common messages
    'no-patients-found': 'No patients found',
    'no-patients-match-search': 'No patients match your search criteria',
    'get-started-add-first-patient': 'Get started by adding your first patient',
    'no-appointments-found': 'No appointments found',
    'no-prescriptions-found': 'No prescriptions found',
    
    // Search and filters
    'search-appointments': 'Search appointments...',
    'search-prescriptions': 'Search prescriptions...',
    'filter-by-status': 'Filter by Status',
    'filter-by-date': 'Filter by Date',
    today: 'Today',
    tomorrow: 'Tomorrow',
    'this-week': 'This Week',
    all: 'All'
  },
  
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    patients: 'Pacientes',
    appointments: 'Citas',
    prescriptions: 'Recetas',
    'pharmacy-dashboard': 'Panel de Farmacia',
    billing: 'Facturación',
    'lab-orders': 'Órdenes de Laboratorio',
    'health-recommendations': 'Recomendaciones de Salud IA',
    'medical-communications': 'Comunicaciones Médicas',
    'user-roles': 'Roles de Usuario',
    'tenant-management': 'Gestión de Inquilinos',
    'audit-logs': 'Registros de Auditoría',
    'white-label-settings': 'Configuración de Marca Blanca',
    'offline-mode': 'Modo Sin Conexión',
    'trial-status': 'Estado de Prueba',
    reports: 'Informes',
    
    // Common UI
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    'no-data': 'No hay datos disponibles',
    'view-all': 'Ver Todo',
    'view-details': 'Ver Detalles',
    close: 'Cerrar',
    submit: 'Enviar',
    'try-again': 'Intentar de Nuevo',
    refresh: 'Actualizar',
    
    // Healthcare specific
    'patient-name': 'Nombre del Paciente',
    'date-of-birth': 'Fecha de Nacimiento',
    'medical-record': 'Registro Médico',
    'insurance-info': 'Información de Seguro',
    'vital-signs': 'Signos Vitales',
    
    // Dashboard
    'total-patients': 'Total de Pacientes',
    'pending-appointments': 'Citas Pendientes',
    'active-prescriptions': 'Recetas Activas',
    'recent-activity': 'Actividad Reciente',
    'platform-overview': 'Resumen de la Plataforma',
    'system-health': 'Salud del Sistema',
    'active-tenants': 'Inquilinos Activos',
    'total-tenants': 'Total de Inquilinos',
    'monthly-revenue': 'Ingresos Mensuales',
    'growth-rate': 'Tasa de Crecimiento',
    'welcome-back': 'Bienvenido de vuelta',
    'quick-stats': 'Estadísticas Rápidas',
    
    // Profile & Settings
    'profile-settings': 'Configuración del Perfil',
    'account-preferences': 'Preferencias de Cuenta',
    'notification-settings': 'Configuración de Notificaciones',
    'display-language': 'Pantalla e Idioma',
    'security-privacy': 'Seguridad y Privacidad',
    'save-preferences': 'Guardar Preferencias',
    language: 'Idioma',
    timezone: 'Zona Horaria',
    theme: 'Tema',
    
    // Forms and Actions
    'first-name': 'Nombre',
    'last-name': 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    create: 'Crear',
    update: 'Actualizar',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    'my-account': 'Mi Cuenta',
    'sign-out': 'Cerrar Sesión',
    
    // Status and States
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    'in-progress': 'En Progreso',
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    'checked-in': 'Registrado',
    'no-show': 'No Asistió',
    prescribed: 'Prescrita',
    'sent-to-pharmacy': 'Enviada a Farmacia',
    filled: 'Surtida',
    'picked-up': 'Recogida',
    
    // Common messages
    'no-patients-found': 'No se encontraron pacientes',
    'no-patients-match-search': 'Ningún paciente coincide con su búsqueda',
    'get-started-add-first-patient': 'Comience agregando su primer paciente',
    'no-appointments-found': 'No se encontraron citas',
    'no-prescriptions-found': 'No se encontraron recetas',
    
    // Search and filters
    'search-appointments': 'Buscar citas...',
    'search-prescriptions': 'Buscar recetas...',
    'filter-by-status': 'Filtrar por Estado',
    'filter-by-date': 'Filtrar por Fecha',
    today: 'Hoy',
    tomorrow: 'Mañana',
    'this-week': 'Esta Semana',
    all: 'Todos'
  },
  
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    patients: 'Patients',
    appointments: 'Rendez-vous',
    prescriptions: 'Ordonnances',
    'pharmacy-dashboard': 'Tableau de Bord de la Pharmacie',
    billing: 'Facturation',
    'lab-orders': 'Analyses de Laboratoire',
    'health-recommendations': 'Insights Santé IA',
    'medical-communications': 'Communications Médicales',
    'user-roles': 'Rôles Utilisateur',
    'tenant-management': 'Gestion des Abonnés',
    'audit-logs': 'Journaux d\'Audit',
    'white-label-settings': 'Paramètres de Marque Blanche',
    'offline-mode': 'Mode Hors Ligne',
    'trial-status': 'Statut d\'Essai',
    reports: 'Rapports',
    
    // Common UI
    save: 'Sauvegarder',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    'no-data': 'Aucune donnée disponible',
    'view-all': 'Voir Tout',
    'view-details': 'Voir les Détails',
    close: 'Fermer',
    submit: 'Soumettre',
    'try-again': 'Réessayer',
    refresh: 'Actualiser',
    
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
    'platform-overview': 'Aperçu de la Plateforme',
    'system-health': 'Performance du Système',
    'active-tenants': 'Abonnés Actifs',
    'total-tenants': 'Total des Abonnés',
    'monthly-revenue': 'Revenus Mensuels',
    'growth-rate': 'Taux de Croissance',
    'welcome-back': 'Bon retour',
    'quick-stats': 'Statistiques Rapides',
    
    // Profile & Settings
    'profile-settings': 'Paramètres de Profil',
    'account-preferences': 'Préférences de Compte',
    'notification-settings': 'Paramètres de Notification',
    'display-language': 'Affichage et Langue',
    'security-privacy': 'Sécurité et Confidentialité',
    'save-preferences': 'Enregistrer les Préférences',
    language: 'Langue',
    timezone: 'Fuseau Horaire',
    theme: 'Thème',
    
    // Forms and Actions
    'first-name': 'Prénom',
    'last-name': 'Nom de Famille',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    create: 'Créer',
    update: 'Mettre à Jour',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    'my-account': 'Mon Compte',
    'sign-out': 'Se Déconnecter',
    
    // Status and States
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En Attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    'in-progress': 'En Cours',
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    'checked-in': 'Enregistré',
    'no-show': 'Absent',
    prescribed: 'Prescrite',
    'sent-to-pharmacy': 'Envoyée à la Pharmacie',
    filled: 'Délivrée',
    'picked-up': 'Récupérée',
    
    // Common messages
    'no-patients-found': 'Aucun patient trouvé',
    'no-patients-match-search': 'Aucun patient ne correspond à vos critères de recherche',
    'get-started-add-first-patient': 'Commencez par ajouter votre premier patient',
    'no-appointments-found': 'Aucun rendez-vous trouvé',
    'no-prescriptions-found': 'Aucune ordonnance trouvée',
    
    // Search and filters
    'search-appointments': 'Rechercher rendez-vous...',
    'search-prescriptions': 'Rechercher ordonnances...',
    'filter-by-status': 'Filtrer par Statut',
    'filter-by-date': 'Filtrer par Date',
    today: 'Aujourd\'hui',
    tomorrow: 'Demain',
    'this-week': 'Cette Semaine',
    all: 'Tous'
  },
  
  de: {
    // Navigation
    dashboard: 'Dashboard',
    patients: 'Patienten',
    appointments: 'Termine',
    prescriptions: 'Verschreibungen',
    'pharmacy-dashboard': 'Apotheken-Dashboard',
    billing: 'Abrechnung',
    'lab-orders': 'Laboraufträge',
    'health-recommendations': 'KI-Gesundheitserkenntnisse',
    'medical-communications': 'Medizinische Kommunikation',
    'user-roles': 'Benutzerrollen',
    'tenant-management': 'Mandantenverwaltung',
    'audit-logs': 'Audit-Protokolle',
    'white-label-settings': 'White-Label-Einstellungen',
    'offline-mode': 'Offline-Modus',
    'trial-status': 'Teststatus',
    reports: 'Berichte',
    
    // Common UI
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    add: 'Hinzufügen',
    search: 'Suchen',
    filter: 'Filtern',
    loading: 'Lädt...',
    'no-data': 'Keine Daten verfügbar',
    'view-all': 'Alle Anzeigen',
    'view-details': 'Details Anzeigen',
    close: 'Schließen',
    submit: 'Senden',
    'try-again': 'Erneut Versuchen',
    refresh: 'Aktualisieren',
    
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
    'platform-overview': 'Plattformübersicht',
    'system-health': 'Systemzustand',
    'active-tenants': 'Aktive Mandanten',
    'total-tenants': 'Gesamte Mandanten',
    'monthly-revenue': 'Monatlicher Umsatz',
    'growth-rate': 'Wachstumsrate',
    'welcome-back': 'Willkommen zurück',
    'quick-stats': 'Schnelle Statistiken',
    
    // Profile & Settings
    'profile-settings': 'Profileinstellungen',
    'account-preferences': 'Kontoeinstellungen',
    'notification-settings': 'Benachrichtigungseinstellungen',
    'display-language': 'Anzeige & Sprache',
    'security-privacy': 'Sicherheit & Datenschutz',
    'save-preferences': 'Einstellungen Speichern',
    language: 'Sprache',
    timezone: 'Zeitzone',
    theme: 'Design',
    
    // Forms and Actions
    'first-name': 'Vorname',
    'last-name': 'Nachname',
    email: 'E-Mail',
    phone: 'Telefon',
    address: 'Adresse',
    create: 'Erstellen',
    update: 'Aktualisieren',
    confirm: 'Bestätigen',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Vorherige',
    'my-account': 'Mein Konto',
    'sign-out': 'Abmelden',
    
    // Status and States
    active: 'Aktiv',
    inactive: 'Inaktiv',
    pending: 'Wartend',
    completed: 'Abgeschlossen',
    cancelled: 'Abgebrochen',
    'in-progress': 'In Bearbeitung',
    scheduled: 'Geplant',
    confirmed: 'Bestätigt',
    'checked-in': 'Eingecheckt',
    'no-show': 'Nicht Erschienen',
    prescribed: 'Verschrieben',
    'sent-to-pharmacy': 'An Apotheke Gesendet',
    filled: 'Ausgegeben',
    'picked-up': 'Abgeholt',
    
    // Common messages
    'no-patients-found': 'Keine Patienten gefunden',
    'no-patients-match-search': 'Keine Patienten entsprechen Ihrer Suche',
    'get-started-add-first-patient': 'Beginnen Sie mit dem Hinzufügen Ihres ersten Patienten',
    'no-appointments-found': 'Keine Termine gefunden',
    'no-prescriptions-found': 'Keine Verschreibungen gefunden',
    
    // Search and filters
    'search-appointments': 'Termine suchen...',
    'search-prescriptions': 'Verschreibungen suchen...',
    'filter-by-status': 'Nach Status Filtern',
    'filter-by-date': 'Nach Datum Filtern',
    today: 'Heute',
    tomorrow: 'Morgen',
    'this-week': 'Diese Woche',
    all: 'Alle'
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
  if (!context) {
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