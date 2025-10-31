import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, Code } from 'lucide-react';
import { ApiEndpointCard } from '@/components/ApiEndpointCard';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  requiresAuth?: boolean;
  permissions?: string[];
  parameters?: Array<{
    name: string;
    in: string;
    description: string;
    required: boolean;
    type?: string;
  }>;
  requestBodyExample?: any;
  responseExample?: any;
  rateLimit?: string;
}

// Comprehensive API endpoints documentation
const apiEndpoints: ApiEndpoint[] = [
  // Authentication
  {
    path: '/api/auth/login',
    method: 'POST',
    summary: 'User Login',
    description: 'Authenticate a user and receive a JWT token for API access',
    tags: ['Authentication'],
    requiresAuth: false,
    requestBodyExample: {
      username: 'doctor@example.com',
      password: 'securePassword123',
      tenantId: 'uuid-tenant-id'
    },
    responseExample: {
      success: true,
      user: { id: '123', username: 'doctor@example.com', role: 'physician' },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    rateLimit: 'Unlimited'
  },
  
  // Patients
  {
    path: '/api/patients',
    method: 'GET',
    summary: 'List Patients',
    description: 'Retrieve a paginated list of patients for the authenticated tenant',
    tags: ['Patients'],
    requiresAuth: true,
    permissions: ['read_patients'],
    parameters: [
      { name: 'limit', in: 'query', description: 'Number of patients to return', required: false, type: 'integer' },
      { name: 'offset', in: 'query', description: 'Pagination offset', required: false, type: 'integer' },
      { name: 'search', in: 'query', description: 'Search by name, MRN, or email', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'patient-uuid',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        mrn: 'MRN-12345',
        phone: '+1234567890',
        email: 'john.doe@example.com'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/patients',
    method: 'POST',
    summary: 'Create Patient',
    description: 'Register a new patient in the system',
    tags: ['Patients'],
    requiresAuth: true,
    permissions: ['write_patients'],
    requestBodyExample: {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-03-20',
      gender: 'female',
      phone: '+1987654321',
      email: 'jane.smith@example.com'
    },
    responseExample: {
      id: 'patient-uuid',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-03-20',
      gender: 'female',
      mrn: 'MRN-67890',
      phone: '+1987654321',
      email: 'jane.smith@example.com',
      createdAt: '2025-10-31T12:00:00Z'
    },
    rateLimit: '100 requests/hour'
  },
  {
    path: '/api/patients/{id}',
    method: 'GET',
    summary: 'Get Patient Details',
    description: 'Retrieve detailed information about a specific patient',
    tags: ['Patients'],
    requiresAuth: true,
    permissions: ['read_patients'],
    parameters: [
      { name: 'id', in: 'path', description: 'Patient UUID', required: true, type: 'string' }
    ],
    responseExample: {
      id: 'patient-uuid',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      mrn: 'MRN-12345',
      allergies: ['Penicillin', 'Latex'],
      medicalHistory: 'Hypertension, Type 2 Diabetes'
    },
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/patients/{id}',
    method: 'PATCH',
    summary: 'Update Patient',
    description: 'Update patient information',
    tags: ['Patients'],
    requiresAuth: true,
    permissions: ['write_patients'],
    parameters: [
      { name: 'id', in: 'path', description: 'Patient UUID', required: true, type: 'string' }
    ],
    requestBodyExample: {
      phone: '+1234567899',
      email: 'newemail@example.com'
    },
    responseExample: {
      id: 'patient-uuid',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567899',
      email: 'newemail@example.com'
    },
    rateLimit: '500 requests/hour'
  },
  
  // Appointments
  {
    path: '/api/appointments',
    method: 'GET',
    summary: 'List Appointments',
    description: 'Retrieve appointments for the authenticated tenant',
    tags: ['Appointments'],
    requiresAuth: true,
    permissions: ['read_appointments'],
    parameters: [
      { name: 'date', in: 'query', description: 'Filter by date (YYYY-MM-DD)', required: false, type: 'string' },
      { name: 'providerId', in: 'query', description: 'Filter by provider ID', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'appt-uuid',
        patientId: 'patient-uuid',
        providerId: 'provider-uuid',
        appointmentTime: '2025-11-01T10:00:00Z',
        status: 'scheduled',
        reason: 'Annual checkup'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/appointments',
    method: 'POST',
    summary: 'Schedule Appointment',
    description: 'Create a new appointment for a patient',
    tags: ['Appointments'],
    requiresAuth: true,
    permissions: ['write_appointments'],
    requestBodyExample: {
      patientId: 'patient-uuid',
      providerId: 'provider-uuid',
      appointmentTime: '2025-11-05T14:30:00Z',
      reason: 'Follow-up visit',
      duration: 30
    },
    responseExample: {
      id: 'appt-uuid',
      patientId: 'patient-uuid',
      providerId: 'provider-uuid',
      appointmentTime: '2025-11-05T14:30:00Z',
      status: 'scheduled',
      reason: 'Follow-up visit'
    },
    rateLimit: '500 requests/hour'
  },
  
  // Prescriptions
  {
    path: '/api/prescriptions',
    method: 'GET',
    summary: 'List Prescriptions',
    description: 'Retrieve prescriptions for the authenticated tenant',
    tags: ['Prescriptions'],
    requiresAuth: true,
    permissions: ['read_prescriptions'],
    parameters: [
      { name: 'patientId', in: 'query', description: 'Filter by patient ID', required: false, type: 'string' },
      { name: 'status', in: 'query', description: 'Filter by status', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'rx-uuid',
        patientId: 'patient-uuid',
        medication: 'Lisinopril 10mg',
        dosage: '10mg',
        frequency: 'Once daily',
        status: 'active'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/prescriptions',
    method: 'POST',
    summary: 'Create Prescription',
    description: 'Create a new prescription for a patient',
    tags: ['Prescriptions'],
    requiresAuth: true,
    permissions: ['write_prescriptions'],
    requestBodyExample: {
      patientId: 'patient-uuid',
      medication: 'Metformin 500mg',
      dosage: '500mg',
      frequency: 'Twice daily',
      instructions: 'Take with meals',
      refills: 3
    },
    responseExample: {
      id: 'rx-uuid',
      patientId: 'patient-uuid',
      medication: 'Metformin 500mg',
      dosage: '500mg',
      frequency: 'Twice daily',
      status: 'prescribed',
      prescribedAt: '2025-10-31T12:00:00Z'
    },
    rateLimit: '200 requests/hour'
  },
  
  // Lab Orders
  {
    path: '/api/lab-orders',
    method: 'GET',
    summary: 'List Lab Orders',
    description: 'Retrieve laboratory orders',
    tags: ['Lab Orders'],
    requiresAuth: true,
    permissions: ['read_lab_orders'],
    parameters: [
      { name: 'patientId', in: 'query', description: 'Filter by patient ID', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'lab-uuid',
        patientId: 'patient-uuid',
        testName: 'Complete Blood Count (CBC)',
        status: 'pending',
        orderedAt: '2025-10-31T09:00:00Z'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/lab-orders',
    method: 'POST',
    summary: 'Create Lab Order',
    description: 'Order laboratory tests for a patient',
    tags: ['Lab Orders'],
    requiresAuth: true,
    permissions: ['write_lab_orders'],
    requestBodyExample: {
      patientId: 'patient-uuid',
      testName: 'Lipid Panel',
      instructions: 'Fasting required'
    },
    responseExample: {
      id: 'lab-uuid',
      patientId: 'patient-uuid',
      testName: 'Lipid Panel',
      status: 'ordered',
      orderedAt: '2025-10-31T12:00:00Z'
    },
    rateLimit: '200 requests/hour'
  },
  
  // Insurance Claims
  {
    path: '/api/insurance-claims',
    method: 'GET',
    summary: 'List Insurance Claims',
    description: 'Retrieve insurance claims',
    tags: ['Insurance'],
    requiresAuth: true,
    permissions: ['read_insurance_claims'],
    responseExample: [
      {
        id: 'claim-uuid',
        claimNumber: 'CLM-2025-001',
        patientId: 'patient-uuid',
        status: 'submitted',
        totalAmount: 250.00,
        submittedAt: '2025-10-30T14:00:00Z'
      }
    ],
    rateLimit: '500 requests/hour'
  },
  {
    path: '/api/insurance-claims',
    method: 'POST',
    summary: 'Submit Insurance Claim',
    description: 'Submit a new insurance claim',
    tags: ['Insurance'],
    requiresAuth: true,
    permissions: ['write_insurance_claims'],
    requestBodyExample: {
      patientId: 'patient-uuid',
      serviceCode: '99213',
      diagnosisCode: 'E11.9',
      totalAmount: 150.00
    },
    responseExample: {
      id: 'claim-uuid',
      claimNumber: 'CLM-2025-002',
      status: 'submitted',
      totalAmount: 150.00
    },
    rateLimit: '100 requests/hour'
  },
  
  // Billing
  {
    path: '/api/billing/invoices',
    method: 'GET',
    summary: 'List Invoices',
    description: 'Retrieve billing invoices',
    tags: ['Billing'],
    requiresAuth: true,
    permissions: ['read_billing'],
    responseExample: [
      {
        id: 'invoice-uuid',
        invoiceNumber: 'INV-2025-001',
        patientId: 'patient-uuid',
        totalAmount: 500.00,
        status: 'paid'
      }
    ],
    rateLimit: '500 requests/hour'
  },
  
  // Documents
  {
    path: '/api/documents',
    method: 'GET',
    summary: 'List Documents',
    description: 'Retrieve documents',
    tags: ['Documents'],
    requiresAuth: true,
    permissions: ['read_documents'],
    parameters: [
      { name: 'patientId', in: 'query', description: 'Filter by patient ID', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'doc-uuid',
        fileName: 'lab-results.pdf',
        fileType: 'application/pdf',
        uploadedAt: '2025-10-31T10:00:00Z'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  {
    path: '/api/documents/upload',
    method: 'POST',
    summary: 'Upload Document',
    description: 'Upload a new document',
    tags: ['Documents'],
    requiresAuth: true,
    permissions: ['write_documents'],
    rateLimit: '50 requests/hour'
  },
  
  // Clinical Alerts
  {
    path: '/api/clinical-alerts',
    method: 'GET',
    summary: 'List Clinical Alerts',
    description: 'Retrieve clinical alerts including drug interactions and allergy warnings',
    tags: ['Clinical Decision Support'],
    requiresAuth: true,
    permissions: ['read_clinical_alerts'],
    responseExample: [
      {
        id: 'alert-uuid',
        patientId: 'patient-uuid',
        alertType: 'drug_interaction',
        severity: 'high',
        message: 'Potential interaction between Warfarin and Aspirin'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  
  // Health Recommendations (NaviMED AI)
  {
    path: '/api/health-recommendations',
    method: 'GET',
    summary: 'Get Health Recommendations',
    description: 'AI-powered health recommendations for patients',
    tags: ['NaviMED AI'],
    requiresAuth: true,
    permissions: ['read_health_recommendations'],
    parameters: [
      { name: 'patientId', in: 'query', description: 'Patient ID', required: true, type: 'string' }
    ],
    responseExample: {
      patientId: 'patient-uuid',
      recommendations: [
        {
          category: 'preventive_care',
          title: 'Annual Flu Vaccination',
          priority: 'medium',
          description: 'Based on age and health history, annual flu vaccination is recommended'
        }
      ]
    },
    rateLimit: '100 requests/hour'
  },
  
  // Inventory
  {
    path: '/api/inventory/items',
    method: 'GET',
    summary: 'List Inventory Items',
    description: 'Retrieve inventory items',
    tags: ['Inventory Management'],
    requiresAuth: true,
    permissions: ['read_inventory'],
    responseExample: [
      {
        id: 'item-uuid',
        itemName: 'Surgical Gloves',
        quantity: 500,
        unitPrice: 0.50,
        status: 'in_stock'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  
  // Patient Education
  {
    path: '/api/patient-education',
    method: 'GET',
    summary: 'List Education Content',
    description: 'Retrieve patient education materials',
    tags: ['Patient Education'],
    requiresAuth: true,
    permissions: ['read_education'],
    responseExample: [
      {
        id: 'edu-uuid',
        title: 'Managing Diabetes',
        category: 'chronic_conditions',
        contentUrl: 'https://example.com/diabetes-guide.pdf'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  
  // Reminders
  {
    path: '/api/reminders',
    method: 'GET',
    summary: 'List Patient Reminders',
    description: 'Retrieve patient reminders',
    tags: ['Reminders'],
    requiresAuth: true,
    permissions: ['read_reminders'],
    parameters: [
      { name: 'patientId', in: 'query', description: 'Filter by patient ID', required: false, type: 'string' }
    ],
    responseExample: [
      {
        id: 'reminder-uuid',
        patientId: 'patient-uuid',
        reminderType: 'medication',
        message: 'Take your morning medication',
        dueAt: '2025-11-01T08:00:00Z'
      }
    ],
    rateLimit: '1000 requests/hour'
  },
  
  // Surveys
  {
    path: '/api/surveys',
    method: 'GET',
    summary: 'List Health Surveys',
    description: 'Retrieve health surveys',
    tags: ['Surveys'],
    requiresAuth: true,
    permissions: ['read_surveys'],
    responseExample: [
      {
        id: 'survey-uuid',
        title: 'Patient Satisfaction Survey',
        isActive: true,
        questions: [
          {
            questionText: 'How would you rate your visit?',
            questionType: 'rating'
          }
        ]
      }
    ],
    rateLimit: '1000 requests/hour'
  }
];

export default function ApiDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(apiEndpoints.flatMap(e => e.tags));
    return ['all', ...Array.from(cats)];
  }, []);

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return apiEndpoints.filter(endpoint => {
      const matchesSearch = searchQuery === '' || 
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        endpoint.tags.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="container mx-auto py-8 px-4" data-testid="page-api-documentation">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Book className="h-8 w-8" />
          <h1 className="text-3xl font-bold" data-testid="text-page-title">API Documentation</h1>
        </div>
        <p className="text-muted-foreground text-lg" data-testid="text-page-description">
          Complete reference for the NaviMED Healthcare Platform API
        </p>
      </div>

      {/* Introduction Card */}
      <Card className="mb-8" data-testid="card-introduction">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Everything you need to integrate with NaviMED</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="bg-muted px-3 py-1 rounded text-sm" data-testid="text-base-url">
              https://api.navimed.com/v1
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              All API requests require authentication using either a JWT Bearer token or an API key:
            </p>
            <div className="mt-2 space-y-2">
              <code className="block bg-muted px-3 py-2 rounded text-sm">
                Authorization: Bearer YOUR_JWT_TOKEN
              </code>
              <code className="block bg-muted px-3 py-2 rounded text-sm">
                X-API-Key: YOUR_API_KEY
              </code>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">
              Default rate limit is 1000 requests per hour. Rate limit information is included in response headers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-endpoints"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
                data-testid={`badge-category-${category}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground" data-testid="text-results-count">
        Showing {filteredEndpoints.length} endpoint{filteredEndpoints.length !== 1 ? 's' : ''}
      </div>

      {/* Endpoints List */}
      <div className="space-y-4" data-testid="list-endpoints">
        {filteredEndpoints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No endpoints found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEndpoints.map((endpoint, idx) => (
            <ApiEndpointCard
              key={`${endpoint.method}-${endpoint.path}-${idx}`}
              {...endpoint}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 border-t pt-8">
        <Card data-testid="card-support">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Additional resources and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Developer Portal:</strong>{' '}
              <a href="/developer-portal" className="text-primary hover:underline">
                Manage API keys and webhooks
              </a>
            </p>
            <p className="text-sm">
              <strong>Support Email:</strong>{' '}
              <a href="mailto:api-support@navimed.com" className="text-primary hover:underline">
                api-support@navimed.com
              </a>
            </p>
            <p className="text-sm">
              <strong>Status Page:</strong>{' '}
              <a href="https://status.navimed.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                status.navimed.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
