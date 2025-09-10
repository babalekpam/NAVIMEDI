/**
 * NaviMED Patient Portal API - Mobile Integration
 * Standalone API service for connecting mobile apps to NaviMED platform
 */

class NaviMEDPatientAPI {
  constructor(baseURL = 'https://navimedi.org/api', apiKey = null) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.token = null;
    this.user = null;
    
    // Initialize from storage
    this.initializeFromStorage();
  }

  // Initialize from local storage
  initializeFromStorage() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('navimed_patient_token');
      const userData = localStorage.getItem('navimed_patient_user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  // Save auth data to storage
  saveAuthData(token, user) {
    this.token = token;
    this.user = user;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('navimed_patient_token', token);
      localStorage.setItem('navimed_patient_user', JSON.stringify(user));
    }
  }

  // Clear auth data
  clearAuthData() {
    this.token = null;
    this.user = null;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('navimed_patient_token');
      localStorage.removeItem('navimed_patient_user');
    }
  }

  // Base API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Mobile-App': 'NaviMED-Patient-Portal',
        'X-App-Version': '1.0.0',
        ...options.headers
      }
    };

    // Add API key if provided
    if (this.apiKey) {
      defaultOptions.headers['X-Mobile-API-Key'] = this.apiKey;
    }

    // Add authorization header if token exists
    if (this.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add body if provided
    if (options.body) {
      defaultOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options
      });

      // Handle authentication errors
      if (response.status === 401) {
        this.clearAuthData();
        throw new Error('Authentication required. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(email, password, tenantId = 'SAINT PAUL') {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          tenantId,
          userType: 'patient'
        }
      });

      if (response.token && response.user) {
        this.saveAuthData(response.token, response.user);
        return {
          success: true,
          user: response.user,
          token: response.token
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async logout() {
    this.clearAuthData();
    return { success: true };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Patient Profile Methods
  async getProfile() {
    return await this.request('/patient/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/patient/profile', {
      method: 'PATCH',
      body: profileData
    });
  }

  // Appointment Methods
  async getAppointments() {
    return await this.request('/patient/appointments');
  }

  async bookAppointment(appointmentData) {
    return await this.request('/appointments', {
      method: 'POST',
      body: {
        ...appointmentData,
        patientId: this.user?.id,
        status: 'requested'
      }
    });
  }

  async cancelAppointment(appointmentId) {
    return await this.request(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: { status: 'cancelled' }
    });
  }

  async rescheduleAppointment(appointmentId, newDateTime) {
    return await this.request(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: { 
        appointmentDate: newDateTime,
        status: 'rescheduled'
      }
    });
  }

  // Prescription Methods
  async getPrescriptions() {
    return await this.request('/patient/prescriptions');
  }

  async getPrescriptionHistory() {
    return await this.request('/patient/prescriptions/history');
  }

  async requestPrescriptionRefill(prescriptionId) {
    return await this.request(`/prescriptions/${prescriptionId}/refill`, {
      method: 'POST'
    });
  }

  // Lab Results Methods
  async getLabResults() {
    return await this.request('/patient/lab-results');
  }

  async getLabResult(resultId) {
    return await this.request(`/patient/lab-results/${resultId}`);
  }

  async downloadLabResultPDF(resultId) {
    const response = await this.request(`/patient/lab-results/${resultId}/pdf`);
    return response; // This will be a blob for download
  }

  // Medical Communications (Messages)
  async getMessages() {
    return await this.request('/medical-communications');
  }

  async sendMessage(messageData) {
    return await this.request('/medical-communications', {
      method: 'POST',
      body: {
        ...messageData,
        patientId: this.user?.id,
        senderType: 'patient'
      }
    });
  }

  async markMessageAsRead(messageId) {
    return await this.request(`/medical-communications/${messageId}/read`, {
      method: 'PATCH'
    });
  }

  async replyToMessage(messageId, replyContent) {
    return await this.request(`/medical-communications/${messageId}/reply`, {
      method: 'POST',
      body: {
        message: replyContent,
        patientId: this.user?.id
      }
    });
  }

  // Health Tracking Methods
  async getHealthData() {
    return await this.request('/patient/health-tracking');
  }

  async recordVitalSigns(vitalSigns) {
    return await this.request('/vital-signs', {
      method: 'POST',
      body: {
        ...vitalSigns,
        patientId: this.user?.id,
        recordedAt: new Date().toISOString()
      }
    });
  }

  async getVitalSigns() {
    return await this.request('/patient/vital-signs');
  }

  // Billing Methods
  async getBills() {
    return await this.request('/patient/bills');
  }

  async getBill(billId) {
    return await this.request(`/patient/bills/${billId}`);
  }

  async makePayment(billId, paymentData) {
    return await this.request(`/patient/bills/${billId}/payment`, {
      method: 'POST',
      body: paymentData
    });
  }

  // Provider Directory
  async getDoctors() {
    return await this.request('/patient/doctors-list');
  }

  async getDoctor(doctorId) {
    return await this.request(`/patient/doctors/${doctorId}`);
  }

  // Emergency Contact Methods
  async getEmergencyContacts() {
    return await this.request('/patient/emergency-contacts');
  }

  async addEmergencyContact(contactData) {
    return await this.request('/patient/emergency-contacts', {
      method: 'POST',
      body: contactData
    });
  }

  async updateEmergencyContact(contactId, contactData) {
    return await this.request(`/patient/emergency-contacts/${contactId}`, {
      method: 'PATCH',
      body: contactData
    });
  }

  // Insurance Information
  async getInsuranceInfo() {
    return await this.request('/patient/insurance');
  }

  async updateInsuranceInfo(insuranceData) {
    return await this.request('/patient/insurance', {
      method: 'PATCH',
      body: insuranceData
    });
  }

  // Notification Methods
  async getNotifications() {
    return await this.request('/patient/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return await this.request(`/patient/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async updateNotificationPreferences(preferences) {
    return await this.request('/patient/notification-preferences', {
      method: 'PATCH',
      body: preferences
    });
  }

  // Document Management
  async uploadDocument(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('patientId', this.user?.id);

    return await this.request('/patient/documents', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        'Authorization': `Bearer ${this.token}`,
        'X-Mobile-App': 'NaviMED-Patient-Portal'
      },
      body: formData
    });
  }

  async getDocuments() {
    return await this.request('/patient/documents');
  }

  async downloadDocument(documentId) {
    const response = await this.request(`/patient/documents/${documentId}/download`);
    return response; // This will be a blob for download
  }

  // Telemedicine
  async getTelemedicineHistory() {
    return await this.request('/patient/telemedicine/history');
  }

  async scheduleTelemedicineAppointment(appointmentData) {
    return await this.request('/patient/telemedicine/schedule', {
      method: 'POST',
      body: appointmentData
    });
  }

  async joinTelemedicineSession(sessionId) {
    return await this.request(`/patient/telemedicine/session/${sessionId}/join`);
  }

  // Health Goals and Tracking
  async getHealthGoals() {
    return await this.request('/patient/health-goals');
  }

  async setHealthGoal(goalData) {
    return await this.request('/patient/health-goals', {
      method: 'POST',
      body: goalData
    });
  }

  async updateHealthGoal(goalId, goalData) {
    return await this.request(`/patient/health-goals/${goalId}`, {
      method: 'PATCH',
      body: goalData
    });
  }

  async recordHealthMetric(metricData) {
    return await this.request('/patient/health-metrics', {
      method: 'POST',
      body: metricData
    });
  }

  // Medical History
  async getMedicalHistory() {
    return await this.request('/patient/medical-history');
  }

  async updateMedicalHistory(historyData) {
    return await this.request('/patient/medical-history', {
      method: 'PATCH',
      body: historyData
    });
  }

  // Allergies and Conditions
  async getAllergies() {
    return await this.request('/patient/allergies');
  }

  async addAllergy(allergyData) {
    return await this.request('/patient/allergies', {
      method: 'POST',
      body: allergyData
    });
  }

  async removeAllergy(allergyId) {
    return await this.request(`/patient/allergies/${allergyId}`, {
      method: 'DELETE'
    });
  }

  // Utility Methods
  async checkServerStatus() {
    try {
      const response = await this.request('/health');
      return { status: 'online', response };
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  }

  async syncOfflineData(offlineData) {
    return await this.request('/patient/sync', {
      method: 'POST',
      body: { offlineData }
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS
  module.exports = NaviMEDPatientAPI;
} else if (typeof window !== 'undefined') {
  // Browser
  window.NaviMEDPatientAPI = NaviMEDPatientAPI;
}

// Usage Examples:
/*
// Initialize the API
const patientAPI = new NaviMEDPatientAPI();

// Login
const loginResult = await patientAPI.login('patient@example.com', 'password123');
if (loginResult.success) {
  console.log('Logged in successfully:', loginResult.user);
}

// Get patient appointments
const appointments = await patientAPI.getAppointments();

// Send a message to doctor
await patientAPI.sendMessage({
  subject: 'Question about medication',
  message: 'I have a question about my prescription...',
  recipientType: 'doctor',
  priority: 'normal'
});

// Book an appointment
await patientAPI.bookAppointment({
  type: 'checkup',
  preferredDate: '2024-03-15',
  preferredTime: '14:00',
  reason: 'Annual physical exam'
});

// Download lab results
const labResultBlob = await patientAPI.downloadLabResultPDF('lab-result-123');
*/

export default NaviMEDPatientAPI;