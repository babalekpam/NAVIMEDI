/**
 * API Documentation Generator
 * 
 * Automatically generates OpenAPI 3.0 compliant API documentation
 * with code examples for the NaviMED Healthcare Platform
 */

export interface EndpointDocumentation {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  security?: Array<Record<string, string[]>>;
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description: string;
    required: boolean;
    schema: any;
  }>;
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: any; examples?: any }>;
  };
  responses: Record<string, {
    description: string;
    content?: Record<string, { schema: any; examples?: any }>;
  }>;
  permissions?: string[];
  rateLimit?: string;
}

// Comprehensive API documentation for NaviMED platform
export const apiEndpoints: EndpointDocumentation[] = [
  // Authentication Endpoints
  {
    path: '/api/auth/login',
    method: 'POST',
    summary: 'User Login',
    description: 'Authenticate a user and receive a JWT token for API access',
    tags: ['Authentication'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password', 'tenantId'],
            properties: {
              username: { type: 'string', example: 'doctor@example.com' },
              password: { type: 'string', example: 'securePassword123' },
              tenantId: { type: 'string', format: 'uuid' }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Successfully authenticated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                user: { type: 'object' },
                token: { type: 'string' }
              }
            },
            examples: {
              success: {
                value: {
                  success: true,
                  user: { id: '123', username: 'doctor@example.com', role: 'physician' },
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        }
      },
      '401': {
        description: 'Invalid credentials'
      }
    }
  },
  
  // Patient Management
  {
    path: '/api/patients',
    method: 'GET',
    summary: 'List Patients',
    description: 'Retrieve a list of patients for the authenticated tenant',
    tags: ['Patients'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'limit',
        in: 'query',
        description: 'Number of patients to return',
        required: false,
        schema: { type: 'integer', default: 50 }
      },
      {
        name: 'offset',
        in: 'query',
        description: 'Pagination offset',
        required: false,
        schema: { type: 'integer', default: 0 }
      },
      {
        name: 'search',
        in: 'query',
        description: 'Search by name, MRN, or email',
        required: false,
        schema: { type: 'string' }
      }
    ],
    responses: {
      '200': {
        description: 'List of patients',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Patient' }
            }
          }
        }
      }
    },
    permissions: ['read_patients'],
    rateLimit: '1000 requests/hour'
  },
  
  {
    path: '/api/patients',
    method: 'POST',
    summary: 'Create Patient',
    description: 'Register a new patient in the system',
    tags: ['Patients'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewPatient' },
          examples: {
            newPatient: {
              value: {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-05-15',
                gender: 'male',
                phone: '+1234567890',
                email: 'john.doe@example.com'
              }
            }
          }
        }
      }
    },
    responses: {
      '201': {
        description: 'Patient created successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Patient' }
          }
        }
      }
    },
    permissions: ['write_patients'],
    rateLimit: '100 requests/hour'
  },
  
  {
    path: '/api/patients/{id}',
    method: 'GET',
    summary: 'Get Patient Details',
    description: 'Retrieve detailed information about a specific patient',
    tags: ['Patients'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: 'Patient UUID',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      '200': {
        description: 'Patient details',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Patient' }
          }
        }
      },
      '404': {
        description: 'Patient not found'
      }
    },
    permissions: ['read_patients']
  },
  
  // Appointments
  {
    path: '/api/appointments',
    method: 'GET',
    summary: 'List Appointments',
    description: 'Retrieve appointments for the authenticated tenant',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'date',
        in: 'query',
        description: 'Filter by date (YYYY-MM-DD)',
        required: false,
        schema: { type: 'string', format: 'date' }
      },
      {
        name: 'providerId',
        in: 'query',
        description: 'Filter by provider ID',
        required: false,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      '200': {
        description: 'List of appointments',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Appointment' }
            }
          }
        }
      }
    },
    permissions: ['read_appointments']
  },
  
  {
    path: '/api/appointments',
    method: 'POST',
    summary: 'Schedule Appointment',
    description: 'Create a new appointment for a patient',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewAppointment' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Appointment created',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Appointment' }
          }
        }
      }
    },
    permissions: ['write_appointments']
  },
  
  // Prescriptions
  {
    path: '/api/prescriptions',
    method: 'GET',
    summary: 'List Prescriptions',
    description: 'Retrieve prescriptions for the authenticated tenant',
    tags: ['Prescriptions'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'patientId',
        in: 'query',
        description: 'Filter by patient ID',
        required: false,
        schema: { type: 'string', format: 'uuid' }
      },
      {
        name: 'status',
        in: 'query',
        description: 'Filter by status',
        required: false,
        schema: { type: 'string', enum: ['prescribed', 'processing', 'ready', 'dispensed'] }
      }
    ],
    responses: {
      '200': {
        description: 'List of prescriptions',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Prescription' }
            }
          }
        }
      }
    },
    permissions: ['read_prescriptions']
  },
  
  {
    path: '/api/prescriptions',
    method: 'POST',
    summary: 'Create Prescription',
    description: 'Create a new prescription for a patient',
    tags: ['Prescriptions'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewPrescription' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Prescription created',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Prescription' }
          }
        }
      }
    },
    permissions: ['write_prescriptions']
  },
  
  // Lab Orders
  {
    path: '/api/lab-orders',
    method: 'GET',
    summary: 'List Lab Orders',
    description: 'Retrieve laboratory orders',
    tags: ['Lab Orders'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'patientId',
        in: 'query',
        description: 'Filter by patient ID',
        required: false,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      '200': {
        description: 'List of lab orders',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/LabOrder' }
            }
          }
        }
      }
    },
    permissions: ['read_lab_orders']
  },
  
  {
    path: '/api/lab-orders',
    method: 'POST',
    summary: 'Create Lab Order',
    description: 'Order laboratory tests for a patient',
    tags: ['Lab Orders'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewLabOrder' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Lab order created',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LabOrder' }
          }
        }
      }
    },
    permissions: ['write_lab_orders']
  },
  
  // Insurance Claims
  {
    path: '/api/insurance-claims',
    method: 'GET',
    summary: 'List Insurance Claims',
    description: 'Retrieve insurance claims',
    tags: ['Insurance'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'List of claims',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/InsuranceClaim' }
            }
          }
        }
      }
    },
    permissions: ['read_insurance_claims']
  },
  
  {
    path: '/api/insurance-claims',
    method: 'POST',
    summary: 'Submit Insurance Claim',
    description: 'Submit a new insurance claim',
    tags: ['Insurance'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewInsuranceClaim' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Claim submitted',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InsuranceClaim' }
          }
        }
      }
    },
    permissions: ['write_insurance_claims']
  },
  
  // Billing
  {
    path: '/api/billing/invoices',
    method: 'GET',
    summary: 'List Invoices',
    description: 'Retrieve billing invoices',
    tags: ['Billing'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'List of invoices'
      }
    },
    permissions: ['read_billing']
  },
  
  // Documents
  {
    path: '/api/documents',
    method: 'GET',
    summary: 'List Documents',
    description: 'Retrieve documents',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'List of documents',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Document' }
            }
          }
        }
      }
    },
    permissions: ['read_documents']
  },
  
  {
    path: '/api/documents/upload',
    method: 'POST',
    summary: 'Upload Document',
    description: 'Upload a new document',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary' },
              patientId: { type: 'string', format: 'uuid' },
              documentType: { type: 'string' }
            }
          }
        }
      }
    },
    responses: {
      '201': {
        description: 'Document uploaded'
      }
    },
    permissions: ['write_documents']
  },
  
  // Clinical Alerts
  {
    path: '/api/clinical-alerts',
    method: 'GET',
    summary: 'List Clinical Alerts',
    description: 'Retrieve clinical alerts (drug interactions, allergies, etc.)',
    tags: ['Clinical Decision Support'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'List of clinical alerts'
      }
    },
    permissions: ['read_clinical_alerts']
  },
  
  // Health Recommendations (NaviMED AI)
  {
    path: '/api/health-recommendations',
    method: 'GET',
    summary: 'Get Health Recommendations',
    description: 'AI-powered health recommendations for patients',
    tags: ['NaviMED AI'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'patientId',
        in: 'query',
        description: 'Patient ID',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      }
    ],
    responses: {
      '200': {
        description: 'Health recommendations'
      }
    },
    permissions: ['read_health_recommendations']
  }
];

/**
 * Generate complete OpenAPI 3.0 specification
 */
export function generateOpenAPISpec(): any {
  return {
    openapi: '3.0.3',
    info: {
      title: 'NaviMED Healthcare Platform API',
      description: `
# NaviMED Healthcare Platform API

Welcome to the NaviMED Healthcare Platform API documentation. This API provides comprehensive access to all platform features including patient management, appointment scheduling, prescriptions, lab orders, billing, and more.

## Authentication

All API requests require authentication using either:
1. **JWT Bearer Token** - Obtained from the login endpoint
2. **API Key** - Generated from the Developer Portal

Include the authentication token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

or

\`\`\`
X-API-Key: <your-api-key>
\`\`\`

## Rate Limiting

- Default: 1000 requests/hour per API key
- Custom limits available for enterprise plans
- Rate limit information is returned in response headers

## Versioning

All API endpoints are versioned. Current version: v1

## Support

- Email: api-support@navimed.com
- Developer Portal: https://navimed.com/developer-portal
- Documentation: https://docs.navimed.com
      `,
      version: '1.0.0',
      contact: {
        name: 'NaviMED API Support',
        email: 'api-support@navimed.com',
        url: 'https://navimed.com/support'
      },
      license: {
        name: 'Proprietary',
        url: 'https://navimed.com/terms'
      }
    },
    servers: [
      {
        url: 'https://api.navimed.com/v1',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.navimed.com/v1',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local development'
      }
    ],
    paths: generatePaths(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key generated from Developer Portal'
        }
      },
      schemas: generateSchemas()
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Patients', description: 'Patient management operations' },
      { name: 'Appointments', description: 'Appointment scheduling and management' },
      { name: 'Prescriptions', description: 'Prescription management' },
      { name: 'Lab Orders', description: 'Laboratory order management' },
      { name: 'Insurance', description: 'Insurance claims and coverage' },
      { name: 'Billing', description: 'Billing and payments' },
      { name: 'Documents', description: 'Document management and e-signatures' },
      { name: 'Clinical Decision Support', description: 'Clinical alerts and decision support' },
      { name: 'NaviMED AI', description: 'AI-powered health recommendations' }
    ]
  };
}

function generatePaths(): any {
  const paths: any = {};
  
  for (const endpoint of apiEndpoints) {
    if (!paths[endpoint.path]) {
      paths[endpoint.path] = {};
    }
    
    paths[endpoint.path][endpoint.method.toLowerCase()] = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      security: endpoint.security,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses
    };
  }
  
  return paths;
}

function generateSchemas(): any {
  return {
    Patient: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date' },
        gender: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        mrn: { type: 'string' }
      }
    },
    NewPatient: {
      type: 'object',
      required: ['firstName', 'lastName', 'dateOfBirth'],
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date' },
        gender: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    },
    Appointment: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        patientId: { type: 'string', format: 'uuid' },
        providerId: { type: 'string', format: 'uuid' },
        appointmentTime: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['scheduled', 'confirmed', 'completed', 'cancelled'] },
        reason: { type: 'string' }
      }
    },
    NewAppointment: {
      type: 'object',
      required: ['patientId', 'providerId', 'appointmentTime'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        providerId: { type: 'string', format: 'uuid' },
        appointmentTime: { type: 'string', format: 'date-time' },
        reason: { type: 'string' },
        duration: { type: 'integer', description: 'Duration in minutes' }
      }
    },
    Prescription: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        patientId: { type: 'string', format: 'uuid' },
        medication: { type: 'string' },
        dosage: { type: 'string' },
        frequency: { type: 'string' },
        status: { type: 'string' }
      }
    },
    NewPrescription: {
      type: 'object',
      required: ['patientId', 'medication', 'dosage'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        medication: { type: 'string' },
        dosage: { type: 'string' },
        frequency: { type: 'string' },
        instructions: { type: 'string' }
      }
    },
    LabOrder: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        patientId: { type: 'string', format: 'uuid' },
        testName: { type: 'string' },
        status: { type: 'string' }
      }
    },
    NewLabOrder: {
      type: 'object',
      required: ['patientId', 'testName'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        testName: { type: 'string' },
        instructions: { type: 'string' }
      }
    },
    InsuranceClaim: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        claimNumber: { type: 'string' },
        status: { type: 'string' },
        totalAmount: { type: 'number' }
      }
    },
    NewInsuranceClaim: {
      type: 'object',
      required: ['patientId', 'serviceCode'],
      properties: {
        patientId: { type: 'string', format: 'uuid' },
        serviceCode: { type: 'string' },
        diagnosisCode: { type: 'string' }
      }
    },
    Document: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        fileName: { type: 'string' },
        fileType: { type: 'string' },
        uploadedAt: { type: 'string', format: 'date-time' }
      }
    }
  };
}

/**
 * Generate code examples for a specific endpoint
 */
export function generateCodeExamples(endpoint: EndpointDocumentation, params: any = {}): {
  curl: string;
  javascript: string;
  python: string;
} {
  const examples = {
    curl: generateCurlExample(endpoint, params),
    javascript: generateJavaScriptExample(endpoint, params),
    python: generatePythonExample(endpoint, params)
  };
  
  return examples;
}

function generateCurlExample(endpoint: EndpointDocumentation, params: any): string {
  let curl = `curl -X ${endpoint.method} '${endpoint.path}'`;
  
  if (endpoint.security) {
    curl += ` \\\n  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`;
  }
  
  curl += ` \\\n  -H 'Content-Type: application/json'`;
  
  if (endpoint.requestBody && params.body) {
    curl += ` \\\n  -d '${JSON.stringify(params.body, null, 2)}'`;
  }
  
  return curl;
}

function generateJavaScriptExample(endpoint: EndpointDocumentation, params: any): string {
  const hasBody = endpoint.requestBody && params.body;
  
  return `// Using fetch API
const response = await fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }${hasBody ? `,\n  body: JSON.stringify(${JSON.stringify(params.body, null, 2)})` : ''}
});

const data = await response.json();
console.log(data);`;
}

function generatePythonExample(endpoint: EndpointDocumentation, params: any): string {
  const hasBody = endpoint.requestBody && params.body;
  
  return `import requests

url = '${endpoint.path}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
${hasBody ? `data = ${JSON.stringify(params.body, null, 2)}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)` : `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}
print(response.json())`;
}
