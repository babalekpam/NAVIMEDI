import { ArrowLeft, Clock, Users, Code, Key, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/support/documentation">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documentation
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>30 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Advanced</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>NAVIMED REST API</CardTitle>
                <CardDescription>Complete API reference for healthcare platform integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p>The NAVIMED API provides secure, RESTful endpoints for integrating with your healthcare management platform. Built with HIPAA compliance and enterprise security in mind.</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800"><strong>Base URL:</strong> https://api.navimed.com/v1</p>
                  <p className="text-blue-800"><strong>Authentication:</strong> Bearer Token (JWT)</p>
                  <p className="text-blue-800"><strong>Rate Limit:</strong> 1000 requests/hour</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">API Key Setup</h4>
                  <p className="text-gray-600 mb-3">Generate your API key from the Settings &gt; API Keys section in your NAVIMED dashboard.</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                    <pre>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.navimed.com/v1/patients`}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Authentication Response</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                    <pre>{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "role": "physician",
    "organization": "metro_general"
  }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Patient API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">GET /patients</h4>
                  <p className="text-gray-600 mb-3">Retrieve a list of patients for your organization.</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm mb-3">
                    <pre>{`GET /v1/patients?page=1&limit=50&search=john

Response:
{
  "data": [
    {
      "id": "pat_123",
      "mrn": "MRN-001234",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-05-15",
      "phone": "555-0123",
      "email": "john.doe@email.com",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 156,
    "totalPages": 4
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">POST /patients</h4>
                  <p className="text-gray-600 mb-3">Create a new patient record.</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                    <pre>{`POST /v1/patients
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1985-03-20",
  "phone": "555-0124",
  "email": "jane.smith@email.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  },
  "insuranceProvider": "Blue Cross",
  "medicalHistory": ["diabetes", "hypertension"]
}`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">GET /patients/:id</h4>
                  <p className="text-gray-600 mb-3">Get detailed information for a specific patient.</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                    <pre>{`GET /v1/patients/pat_123

Response:
{
  "id": "pat_123",
  "mrn": "MRN-001234",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-05-15",
  "medicalHistory": ["diabetes", "hypertension"],
  "allergies": ["penicillin"],
  "appointments": [...],
  "prescriptions": [...],
  "labResults": [...]
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">HIPAA Compliance</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• All API communications use TLS 1.3 encryption</li>
                    <li>• Patient data is encrypted at rest using AES-256</li>
                    <li>• Access logs maintained for all API requests</li>
                    <li>• Role-based access control enforced</li>
                    <li>• Business Associate Agreement (BAA) required</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Error Handling</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                    <pre>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid patient data provided",
    "details": [
      {
        "field": "dateOfBirth",
        "message": "Must be a valid date in YYYY-MM-DD format"
      }
    ]
  }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SDK & Libraries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Node.js SDK</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>npm install @navimed/node-sdk</pre>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Python SDK</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>pip install navimed-python</pre>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">PHP SDK</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>composer require navimed/php-sdk</pre>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">C# SDK</h4>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                      <pre>Install-Package NaviMed.SDK</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}