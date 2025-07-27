// Debug component to test translation system
import { useTranslation } from "@/contexts/translation-context";

export const TranslationDebug = () => {
  const { t, currentLanguage, setLanguage } = useTranslation();
  
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
      <h3 className="font-bold">Translation Debug</h3>
      <p>Current Language: {currentLanguage}</p>
      <p>Dashboard: {t('dashboard')}</p>
      <p>Patients: {t('patients')}</p>
      <p>Appointments: {t('appointments')}</p>
      <p>Prescriptions: {t('prescriptions')}</p>
      <div className="mt-2">
        <button onClick={() => setLanguage('en')} className="mr-2 px-2 py-1 bg-blue-200">EN</button>
        <button onClick={() => setLanguage('fr')} className="mr-2 px-2 py-1 bg-blue-200">FR</button>
        <button onClick={() => setLanguage('es')} className="mr-2 px-2 py-1 bg-blue-200">ES</button>
      </div>
    </div>
  );
};