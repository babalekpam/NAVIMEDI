import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Clean translation dictionary without duplicates
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
    
    // Forms
    'first-name': 'First Name',
    'last-name': 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    
    // Organizations
    hospital: 'Hospital', 
    clinic: 'Clinic',
    pharmacy: 'Pharmacy',
    laboratory: 'Laboratory',
    'insurance-provider': 'Insurance Provider',
    'organization-name': 'Organization Name',
    'organization-type': 'Organization Type',
    'select-type': 'Select type',
    
    // Status
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
    'no-appointments-found': 'No appointments found',
    'no-prescriptions-found': 'No prescriptions found',
    'search-patients': 'Search patients...',
    'search-appointments': 'Search appointments...',
    'search-prescriptions': 'Search prescriptions...',
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
    reports: 'Reportes',
    
    // Common UI
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    
    // Forms
    'first-name': 'Nombre',
    'last-name': 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    
    // Status
    active: 'Activo',
    inactive: 'Inactivo', 
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    'in-progress': 'En Progreso',
  },
  
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    patients: 'Patients',
    appointments: 'Rendez-vous',
    prescriptions: 'Ordonnances',
    'pharmacy-dashboard': 'Tableau de Bord Pharmacie',
    billing: 'Facturation',
    'lab-orders': 'Commandes de Laboratoire',
    reports: 'Rapports',
    
    // Common UI
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    
    // Forms
    'first-name': 'Prénom',
    'last-name': 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    
    // Status
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En Attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    'in-progress': 'En Cours',
  }
};

type Language = 'en' | 'es' | 'fr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || 
           translations.en[key as keyof typeof translations.en] || 
           key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}