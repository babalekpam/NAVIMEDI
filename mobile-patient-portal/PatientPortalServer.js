/**
 * NaviMED Patient Portal - Standalone Server API Endpoints
 * These are the server-side API routes needed for the mobile patient portal
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Initialize Express app for patient portal
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://navimedi.org'],
  credentials: true
}));
app.use(express.json());

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const DB_URL = process.env.DATABASE_URL || 'your-database-connection-string';

// Authentication middleware
const authenticatePatient = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Ensure user is a patient
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Patient access required' });
    }
    
    req.user = user;
    next();
  });
};

// ===== AUTHENTICATION ROUTES =====

// Patient Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Query database for patient
    // NOTE: Replace this with your actual database query
    const patient = await findPatientByEmail(email, tenantId);
    
    if (!patient) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, patient.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: patient.id, 
        email: patient.email, 
        role: 'patient',
        tenantId: patient.tenantId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      token,
      user: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        role: 'patient',
        tenantId: patient.tenantId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== PATIENT PROFILE ROUTES =====

// Get Patient Profile
app.get('/api/patient/profile', authenticatePatient, async (req, res) => {
  try {
    const patientProfile = await getPatientProfile(req.user.id);
    res.json(patientProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update Patient Profile
app.patch('/api/patient/profile', authenticatePatient, async (req, res) => {
  try {
    const updatedProfile = await updatePatientProfile(req.user.id, req.body);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ===== APPOINTMENT ROUTES =====

// Get Patient Appointments
app.get('/api/patient/appointments', authenticatePatient, async (req, res) => {
  try {
    const appointments = await getPatientAppointments(req.user.id);
    res.json(appointments);
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Book New Appointment
app.post('/api/appointments', authenticatePatient, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      patientId: req.user.id,
      tenantId: req.user.tenantId,
      status: 'requested'
    };
    
    const newAppointment = await createAppointment(appointmentData);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// Cancel Appointment
app.patch('/api/appointments/:id', authenticatePatient, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointment = await updateAppointment(id, req.body, req.user.id);
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// ===== PRESCRIPTION ROUTES =====

// Get Patient Prescriptions
app.get('/api/patient/prescriptions', authenticatePatient, async (req, res) => {
  try {
    const prescriptions = await getPatientPrescriptions(req.user.id);
    res.json(prescriptions);
  } catch (error) {
    console.error('Prescriptions fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

// Request Prescription Refill
app.post('/api/prescriptions/:id/refill', authenticatePatient, async (req, res) => {
  try {
    const { id } = req.params;
    const refillRequest = await requestPrescriptionRefill(id, req.user.id);
    res.json(refillRequest);
  } catch (error) {
    console.error('Refill request error:', error);
    res.status(500).json({ message: 'Failed to request refill' });
  }
});

// ===== LAB RESULTS ROUTES =====

// Get Patient Lab Results
app.get('/api/patient/lab-results', authenticatePatient, async (req, res) => {
  try {
    const labResults = await getPatientLabResults(req.user.id);
    res.json(labResults);
  } catch (error) {
    console.error('Lab results fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch lab results' });
  }
});

// Download Lab Result PDF
app.get('/api/patient/lab-results/:id/pdf', authenticatePatient, async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await generateLabResultPDF(id, req.user.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="lab-result-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// ===== MESSAGING ROUTES =====

// Get Patient Messages
app.get('/api/medical-communications', authenticatePatient, async (req, res) => {
  try {
    const messages = await getPatientMessages(req.user.id);
    res.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send Message
app.post('/api/medical-communications', authenticatePatient, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      senderId: req.user.id,
      senderType: 'patient',
      tenantId: req.user.tenantId
    };
    
    const newMessage = await createMessage(messageData);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark Message as Read
app.patch('/api/medical-communications/:id/read', authenticatePatient, async (req, res) => {
  try {
    const { id } = req.params;
    await markMessageAsRead(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

// ===== HEALTH TRACKING ROUTES =====

// Get Health Tracking Data
app.get('/api/patient/health-tracking', authenticatePatient, async (req, res) => {
  try {
    const healthData = await getPatientHealthData(req.user.id);
    res.json(healthData);
  } catch (error) {
    console.error('Health data fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch health data' });
  }
});

// Record Vital Signs
app.post('/api/vital-signs', authenticatePatient, async (req, res) => {
  try {
    const vitalSignsData = {
      ...req.body,
      patientId: req.user.id,
      recordedAt: new Date()
    };
    
    const newVitalSigns = await recordVitalSigns(vitalSignsData);
    res.status(201).json(newVitalSigns);
  } catch (error) {
    console.error('Vital signs recording error:', error);
    res.status(500).json({ message: 'Failed to record vital signs' });
  }
});

// ===== BILLING ROUTES =====

// Get Patient Bills
app.get('/api/patient/bills', authenticatePatient, async (req, res) => {
  try {
    const bills = await getPatientBills(req.user.id);
    res.json(bills);
  } catch (error) {
    console.error('Bills fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
});

// Make Payment
app.post('/api/patient/bills/:id/payment', authenticatePatient, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentResult = await processPayment(id, req.body, req.user.id);
    res.json(paymentResult);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// ===== DOCTOR DIRECTORY ROUTES =====

// Get Doctors List
app.get('/api/patient/doctors-list', authenticatePatient, async (req, res) => {
  try {
    const doctors = await getDoctorsForPatient(req.user.tenantId);
    res.json(doctors);
  } catch (error) {
    console.error('Doctors list fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch doctors list' });
  }
});

// ===== UTILITY ROUTES =====

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'NaviMED Patient Portal API'
  });
});

// Platform Status
app.get('/api/platform/stats', (req, res) => {
  res.json({
    platform: 'NaviMED Healthcare Platform',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===== DATABASE FUNCTIONS =====
// NOTE: Implement these functions based on your database setup

async function findPatientByEmail(email, tenantId) {
  // Implement database query to find patient by email and tenant
  // Return patient object or null
}

async function getPatientProfile(patientId) {
  // Implement database query to get patient profile
}

async function updatePatientProfile(patientId, profileData) {
  // Implement database update for patient profile
}

async function getPatientAppointments(patientId) {
  // Implement database query to get patient appointments
}

async function createAppointment(appointmentData) {
  // Implement database insert for new appointment
}

async function updateAppointment(appointmentId, updateData, patientId) {
  // Implement database update for appointment
}

async function getPatientPrescriptions(patientId) {
  // Implement database query to get patient prescriptions
}

async function requestPrescriptionRefill(prescriptionId, patientId) {
  // Implement prescription refill request logic
}

async function getPatientLabResults(patientId) {
  // Implement database query to get patient lab results
}

async function generateLabResultPDF(labResultId, patientId) {
  // Implement PDF generation for lab results
}

async function getPatientMessages(patientId) {
  // Implement database query to get patient messages
}

async function createMessage(messageData) {
  // Implement database insert for new message
}

async function markMessageAsRead(messageId, patientId) {
  // Implement database update to mark message as read
}

async function getPatientHealthData(patientId) {
  // Implement database query to get patient health tracking data
}

async function recordVitalSigns(vitalSignsData) {
  // Implement database insert for vital signs
}

async function getPatientBills(patientId) {
  // Implement database query to get patient bills
}

async function processPayment(billId, paymentData, patientId) {
  // Implement payment processing logic
}

async function getDoctorsForPatient(tenantId) {
  // Implement database query to get doctors list for patient's tenant
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏥 NaviMED Patient Portal API running on port ${PORT}`);
  console.log(`📱 Mobile API endpoints ready for connection`);
  console.log(`🔗 Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;