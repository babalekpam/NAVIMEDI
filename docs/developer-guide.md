# NaviMED Healthcare Platform - Developer Guide

## Table of Contents
1. [Technology Stack Overview](#technology-stack-overview)
2. [System Architecture Overview](#system-architecture-overview)
3. [Development Guidelines](#development-guidelines)
4. [Database Management](#database-management)
5. [Security Implementation](#security-implementation)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Email System Integration](#email-system-integration)
9. [Multi-tenant Development](#multi-tenant-development)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Future Development](#future-development)

---

## 1. Technology Stack Overview

### Core Technologies & Versions

#### Backend Stack
```json
{
  "runtime": "Node.js 20+",
  "framework": "Express.js 4.x",
  "language": "TypeScript 5.x",
  "orm": "Drizzle ORM 0.30+",
  "database": "PostgreSQL 15+",
  "authentication": "JWT (jsonwebtoken 9.x)",
  "validation": "Zod 3.x",
  "email": "SendGrid Mail API 8.x",
  "payments": "Stripe 14.x",
  "security": "bcrypt 5.x, helmet 7.x"
}
```

#### Frontend Stack
```json
{
  "framework": "React 18.x",
  "bundler": "Vite 5.x",
  "language": "TypeScript 5.x",
  "routing": "Wouter 3.x",
  "state": "TanStack Query v5",
  "forms": "React Hook Form 7.x",
  "validation": "@hookform/resolvers with Zod",
  "ui": "shadcn/ui + Radix UI",
  "styling": "Tailwind CSS 3.x",
  "icons": "Lucide React + React Icons"
}
```

#### Development Tools
```json
{
  "package_manager": "npm",
  "type_checking": "TypeScript strict mode",
  "linting": "ESLint",
  "schema_management": "Drizzle Kit",
  "api_client": "Custom fetch wrapper",
  "testing": "data-testid attributes"
}
```

### Infrastructure & Deployment

#### Database Technology
- **Primary Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM with type-safe queries
- **Connection**: Native PostgreSQL driver
- **Schema Management**: Drizzle Kit migrations
- **Data Validation**: Drizzle-Zod integration

#### Email Services
- **Primary**: SendGrid API
- **Alternatives**: AWS SES, Postmark, Resend, Mailgun
- **Development**: Console logging fallback
- **Templates**: HTML + Text format support

#### Security Technologies
- **Authentication**: JWT with RS256/HS256 signing
- **Password Hashing**: bcrypt with 12+ salt rounds
- **Token Security**: SHA-256 hashing for reset tokens
- **Rate Limiting**: Express-rate-limit
- **CSRF Protection**: csurf middleware
- **Headers**: Helmet.js security headers

### Package Dependencies

#### Critical Backend Dependencies
```bash
# Core Framework
express                    # Web framework
typescript                 # Type safety
tsx                        # TypeScript execution

# Database & ORM
drizzle-orm               # Type-safe database ORM
drizzle-zod              # Schema validation integration
@neondatabase/serverless  # PostgreSQL driver

# Authentication & Security
jsonwebtoken             # JWT token management
bcrypt                   # Password hashing
helmet                   # Security headers
express-rate-limit       # Rate limiting
csurf                    # CSRF protection

# Validation & Types
zod                      # Runtime validation
zod-validation-error     # Enhanced error messages

# Email & Communications
@sendgrid/mail          # Email service
```

#### Critical Frontend Dependencies
```bash
# Core Framework
react                    # UI framework
react-dom               # DOM rendering
typescript              # Type safety
vite                    # Build tool

# Routing & Navigation
wouter                  # Client-side routing

# State Management & API
@tanstack/react-query   # Server state management
react-hook-form         # Form handling
@hookform/resolvers     # Form validation integration

# UI Components & Styling
tailwindcss            # Utility-first CSS
@radix-ui/*           # Headless UI components
lucide-react          # Icon library
react-icons           # Additional icons
tailwind-merge        # Conditional styling
class-variance-authority # Component variants

# Utilities
date-fns              # Date manipulation
nanoid                # ID generation
```

### Architecture Patterns

#### Backend Patterns
- **Layered Architecture**: Routes → Storage → Database
- **Dependency Injection**: Storage interface abstraction
- **Middleware Pipeline**: Authentication → Authorization → Business Logic
- **Error Handling**: Centralized error responses
- **Data Validation**: Zod schemas at API boundaries

#### Frontend Patterns
- **Component-Based**: Reusable React components
- **Hook-Based State**: Custom hooks for logic
- **Form Management**: React Hook Form with validation
- **API Layer**: TanStack Query for server state
- **Route-Based Code Splitting**: Dynamic imports

#### Security Patterns
- **Multi-Tenant Isolation**: Tenant ID in all queries
- **Role-Based Access Control**: Middleware-enforced permissions
- **Token-Based Authentication**: JWT with expiration
- **Secure Password Reset**: Cryptographic token generation
- **Rate Limiting**: Per-endpoint protection

### Development Environment

#### Required Tools
```bash
Node.js 20+             # JavaScript runtime
npm 10+                 # Package manager
PostgreSQL 15+          # Database server
Git                     # Version control
TypeScript 5+           # Language compiler
```

#### Optional Tools
```bash
Redis                   # Caching (future)
Docker                  # Containerization
Postman/Insomnia       # API testing
pgAdmin/TablePlus      # Database GUI
VSCode                 # Recommended IDE
```

### External Services Integration

#### Email Service Providers
- **SendGrid**: Primary email delivery
- **AWS SES**: Alternative email service
- **Postmark**: Transactional email alternative
- **Mailgun**: Email API alternative

#### Payment Processing
- **Stripe**: Payment processing and subscriptions
- **Webhook Handling**: Secure payment event processing

#### Authentication Services
- **JWT**: Self-managed token authentication
- **OAuth**: Future integration capability
- **Session Management**: Token-based stateless auth

### Performance Considerations

#### Database Optimization
- **Indexing Strategy**: Tenant ID + frequently queried fields
- **Connection Pooling**: PostgreSQL connection management
- **Query Optimization**: Drizzle ORM efficient queries
- **Data Pagination**: Large result set handling

#### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Vite build optimizations
- **Caching Strategy**: TanStack Query cache management
- **Asset Optimization**: Image and static file handling

#### API Performance
- **Rate Limiting**: Prevent abuse and ensure availability
- **Response Compression**: Gzip compression middleware
- **Efficient Serialization**: JSON response optimization
- **Caching Headers**: Browser cache optimization

### Scalability Architecture

#### Horizontal Scaling
- **Stateless Design**: JWT-based authentication
- **Database Scaling**: Read replicas capability
- **Load Balancing**: Multi-instance deployment ready
- **Microservices Ready**: Modular architecture

#### Monitoring & Observability
- **Health Checks**: Application health endpoints
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **Audit Logging**: Healthcare compliance tracking

---

## 2. System Architecture Overview

### Multi-Tenant Architecture
NaviMED uses a **strict multi-tenant architecture** with complete data isolation between organizations (hospitals, pharmacies, laboratories).

```typescript
// All database operations must include tenantId filtering
const prescriptions = await db.select()
  .from(prescriptions)
  .where(eq(prescriptions.tenantId, userTenantId));

// Super admin can bypass tenant restrictions (use carefully)
if (user.role === 'super_admin') {
  // Cross-tenant operations allowed
}
```

### Core Technologies
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Authentication**: JWT with role-based access control
- **Email**: SendGrid integration with fallbacks

### Key Files Structure
```
server/
├── routes.ts              # Main API routes
├── storage.ts             # Database abstraction layer
├── middleware/auth.ts     # Authentication & authorization
├── email-service.ts       # Email integration
└── analytics-routes.ts    # Analytics endpoints

shared/
└── schema.ts             # Database schema definitions

client/src/
├── App.tsx               # Main application & routing
├── pages/                # Page components
└── lib/queryClient.ts    # API client configuration
```

---

## 2. Development Guidelines

### Development Workflow
**Always follow this exact order when adding new features:**

1. **Define data model** in `shared/schema.ts`
2. **Update storage interface** in `server/storage.ts`
3. **Create API routes** in `server/routes.ts`
4. **Build frontend components** in `client/src/pages/`

### Code Standards

#### Database Schema Changes
```typescript
// shared/schema.ts - Always define complete schema first
export const newFeature = pgTable("new_feature", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id").notNull(), // Required for multi-tenant
  name: varchar("name", { length: 255 }).notNull(),
  status: newFeatureStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

// Create insert schema
export const insertNewFeatureSchema = createInsertSchema(newFeature)
  .omit({ id: true, createdAt: true });

// Create TypeScript types
export type NewFeature = typeof newFeature.$inferSelect;
export type InsertNewFeature = z.infer<typeof insertNewFeatureSchema>;
```

#### Storage Layer Updates
```typescript
// server/storage.ts - Add methods to IStorage interface
interface IStorage {
  // Existing methods...
  
  // New feature methods
  createNewFeature(data: InsertNewFeature): Promise<NewFeature>;
  getNewFeatures(tenantId: string): Promise<NewFeature[]>;
  updateNewFeature(id: number, data: Partial<InsertNewFeature>): Promise<NewFeature>;
  deleteNewFeature(id: number, tenantId: string): Promise<void>;
}
```

#### API Route Implementation
```typescript
// server/routes.ts - Keep routes thin, use storage layer
app.post('/api/new-feature', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Validate input
    const validatedData = insertNewFeatureSchema.parse(req.body);
    
    // Add tenant context
    const featureData = {
      ...validatedData,
      tenantId: req.user.tenantId
    };
    
    // Use storage layer
    const newFeature = await storage.createNewFeature(featureData);
    
    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Create feature error:', error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? 'Validation failed' : 'Failed to create feature' 
    });
  }
});
```

#### Frontend Implementation
```typescript
// client/src/pages/NewFeaturePage.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function NewFeaturePage() {
  // Fetch data with proper typing
  const { data: features, isLoading } = useQuery({
    queryKey: ['/api/new-feature'],
    // Uses default fetcher from queryClient
  });

  // Form with validation
  const form = useForm<InsertNewFeature>({
    resolver: zodResolver(insertNewFeatureSchema),
    defaultValues: {
      name: '',
      status: 'pending'
    }
  });

  // Mutation with cache invalidation
  const createMutation = useMutation({
    mutationFn: async (data: InsertNewFeature) => {
      return apiRequest('/api/new-feature', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/new-feature'] });
      form.reset();
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(createMutation.mutate)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Name</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-feature-name" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          data-testid="button-create-feature"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Feature'}
        </Button>
      </form>
    </Form>
  );
}
```

### Data-TestId Standards
Add `data-testid` attributes to all interactive elements:

```typescript
// Interactive elements pattern: {action}-{target}
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<Link data-testid="link-profile">Profile</Link>

// Display elements pattern: {type}-{content}
<div data-testid="text-username">{user.username}</div>
<img data-testid="img-avatar" src={avatar} />

// Dynamic elements: append unique identifier
<div data-testid={`card-patient-${patient.id}`}>
<button data-testid={`button-edit-${index}`}>
```

---

## 3. Database Management

### Schema Design Principles

#### Multi-Tenant Tables
```typescript
// Every tenant-specific table MUST include tenantId
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id").notNull(), // REQUIRED
  patientId: varchar("patient_id").notNull(),
  // ... other fields
});

// Platform-wide tables (no tenantId)
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code", { length: 2 }).notNull()
});
```

#### Foreign Key Relationships
```typescript
// Foreign keys must be scoped to same tenant
export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id").notNull(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id, {
    onDelete: "cascade"
  }),
  // Ensure both records have same tenantId in business logic
});
```

### Database Changes Process

1. **Modify Schema**: Update `shared/schema.ts`
2. **Update Storage Interface**: Add methods to `IStorage` in `server/storage.ts`
3. **Apply Changes**: Run `npm run db:push` or `npm run db:push --force`

```bash
# Apply schema changes
npm run db:push

# If data loss warning, force apply (development only)
npm run db:push --force
```

### Data Integrity Rules

```typescript
// Always validate tenant ownership before operations
async updatePrescription(id: number, tenantId: string, data: UpdatePrescription) {
  const [updatedPrescription] = await db.update(prescriptions)
    .set(data)
    .where(
      and(
        eq(prescriptions.id, id),
        eq(prescriptions.tenantId, tenantId) // Tenant isolation
      )
    )
    .returning();
    
  if (!updatedPrescription) {
    throw new Error('Prescription not found or access denied');
  }
  
  return updatedPrescription;
}
```

---

## 4. Security Implementation

### Authentication Flow

#### JWT Token Management
```typescript
// server/middleware/auth.ts
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ message: "Token expired" });
    }
    
    // Validate user still exists and check passwordChangedAt
    const user = await storage.getUser(decoded.userId, decoded.tenantId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Check if token was issued before password change
    if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ message: "Token invalidated by password change" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
```

#### Role-Based Access Control
```typescript
// Use requireRole middleware for protected endpoints
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role === 'super_admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: "Insufficient permissions" });
  };
};

// Usage in routes
app.get('/api/admin-only', authenticateToken, requireRole(['admin']), (req, res) => {
  // Admin-only logic
});
```

### Password Reset Security

#### Healthcare-Grade Implementation
```typescript
// Secure token generation (32-byte random)
const resetToken = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

// Store hashed token with expiration
await db.insert(passwordResetTokens).values({
  userId: user.id,
  tenantId: user.tenantId,
  tokenHash: tokenHash, // Never store plaintext
  expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  requestedIp: req.ip,
  userAgent: req.get('User-Agent')
});
```

#### Single-Use Token Enforcement
```typescript
// Validate and mark token as used
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

const [resetRecord] = await db.select()
  .from(passwordResetTokens)
  .where(
    and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      gt(passwordResetTokens.expiresAt, sql`CURRENT_TIMESTAMP`),
      isNull(passwordResetTokens.usedAt) // Single use check
    )
  );

if (!resetRecord) {
  return res.status(400).json({ message: "Invalid or expired reset token" });
}

// Mark as used immediately
await db.update(passwordResetTokens)
  .set({ usedAt: sql`CURRENT_TIMESTAMP` })
  .where(eq(passwordResetTokens.id, resetRecord.id));
```

### Security Checklist

#### Production Deployment
- [ ] Set strong JWT_SECRET (64+ characters)
- [ ] Configure HTTPS with proper certificates
- [ ] Set up CSP (Content Security Policy) headers
- [ ] Enable HSTS (HTTP Strict Transport Security)
- [ ] Configure rate limiting on all auth endpoints
- [ ] Set up proper CORS policies
- [ ] Enable audit logging for sensitive operations
- [ ] Validate all environment variables on startup

#### Code Security Standards
- [ ] Never log passwords, tokens, or PHI data
- [ ] Always hash passwords with bcrypt (12+ salt rounds)
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries (Drizzle handles this)
- [ ] Implement proper error handling without exposing internals
- [ ] Add tenant isolation checks to all data operations

---

## 5. API Development

### Standard API Patterns

#### Request/Response Structure
```typescript
// Standard success response
{
  "data": {...}, // or array
  "message": "Operation successful"
}

// Standard error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": {...} // Optional technical details
  }
}
```

#### Input Validation Pattern
```typescript
app.post('/api/resource', authenticateToken, async (req, res) => {
  try {
    // 1. Validate input with Zod
    const validatedData = resourceSchema.parse(req.body);
    
    // 2. Add tenant context
    const resourceData = {
      ...validatedData,
      tenantId: req.user.tenantId
    };
    
    // 3. Business logic via storage layer
    const result = await storage.createResource(resourceData);
    
    // 4. Return success response
    res.status(201).json({
      data: result,
      message: "Resource created successfully"
    });
    
  } catch (error) {
    // 5. Handle errors consistently
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors
        }
      });
    }
    
    console.error('Create resource error:', error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create resource"
      }
    });
  }
});
```

### Rate Limiting Configuration

```typescript
// Apply rate limiting to sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts"
    }
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  // Login logic
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  // Password reset logic
});
```

### Cross-Tenant Operations

```typescript
// Special handling for cross-tenant operations (rare)
app.get('/api/cross-tenant/patient-lookup', 
  authenticateToken, 
  requireRole(['physician', 'nurse']), 
  async (req, res) => {
    try {
      const { patientIdentifier } = req.query;
      
      // Only allowed for healthcare providers
      if (!['physician', 'nurse'].includes(req.user.role)) {
        return res.status(403).json({ 
          error: { message: "Insufficient permissions for cross-tenant lookup" }
        });
      }
      
      // Use special cross-tenant table
      const patient = await storage.findPatientAcrossTenants(
        patientIdentifier,
        req.user.tenantId // Requesting tenant
      );
      
      res.json({ data: patient });
    } catch (error) {
      console.error('Cross-tenant lookup error:', error);
      res.status(500).json({ 
        error: { message: "Patient lookup failed" }
      });
    }
  }
);
```

---

## 6. Frontend Development

### Routing with Wouter

```typescript
// client/src/App.tsx - Register all routes
import { Route, Switch } from 'wouter';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password/:token" component={ResetPasswordPage} />
          
          {/* Authenticated routes */}
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/patients" component={PatientsPage} />
          <Route path="/prescriptions" component={PrescriptionsPage} />
          
          {/* 404 fallback */}
          <Route component={NotFoundPage} />
        </Switch>
      </TenantProvider>
    </QueryClientProvider>
  );
}
```

### Data Fetching Patterns

#### Using TanStack Query v5
```typescript
// client/src/pages/PatientsPage.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function PatientsPage() {
  // Fetch data with proper cache key structure
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['/api/patients'], // Simple string for basic queries
    // Uses default fetcher from queryClient
  });
  
  // For parameterized queries, use array structure
  const { data: patient } = useQuery({
    queryKey: ['/api/patients', patientId], // Array for hierarchical cache
    enabled: !!patientId // Only run when patientId exists
  });

  // Mutations with optimistic updates
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: CreatePatient) => {
      return apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(patientData)
      });
    },
    onSuccess: () => {
      // Invalidate and refetch patient list
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive"
      });
    }
  });

  if (isLoading) return <PatientsSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {patients?.map(patient => (
        <PatientCard 
          key={patient.id} 
          patient={patient}
          data-testid={`card-patient-${patient.id}`}
        />
      ))}
    </div>
  );
}
```

### Form Handling with React Hook Form

```typescript
// client/src/components/PatientForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

interface PatientFormProps {
  onSubmit: (data: CreatePatient) => void;
  defaultValues?: Partial<CreatePatient>;
  isLoading?: boolean;
}

export function PatientForm({ onSubmit, defaultValues, isLoading }: PatientFormProps) {
  const form = useForm<CreatePatient>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  data-testid="input-first-name"
                  placeholder="Enter first name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email"
                  data-testid="input-email"
                  placeholder="patient@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          data-testid="button-submit-patient"
        >
          {isLoading ? 'Creating...' : 'Create Patient'}
        </Button>
      </form>
    </Form>
  );
}
```

### State Management Patterns

```typescript
// Use React Query for server state, React Context for UI state
// client/src/contexts/TenantContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  refetchTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenant = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/tenant/current');
      setTenant(response);
    } catch (error) {
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, refetchTenant: fetchTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

---

## 7. Email System Integration

### SendGrid Configuration

#### Environment Setup
```bash
# Required environment variable
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Email Service Implementation
```typescript
// server/email-service.ts
import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

// Initialize SendGrid with validation
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
} else {
  console.warn('⚠️  SendGrid API key invalid or missing. Email functionality disabled.');
}

// Email sending function with fallback
export async function sendPasswordResetEmail(params: {
  userEmail: string;
  resetToken: string;
  firstName: string;
  lastName: string;
}) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${params.resetToken}`;
  
  if (mailService) {
    // Send via SendGrid
    try {
      await mailService.send({
        to: params.userEmail,
        from: 'noreply@navimed-healthcare.com',
        subject: 'Password Reset - NaviMED Healthcare',
        html: generatePasswordResetHTML(params, resetLink),
        text: generatePasswordResetText(params, resetLink)
      });
      console.log(`✅ Password reset email sent to ${params.userEmail}`);
    } catch (error) {
      console.error('SendGrid email error:', error);
      throw new Error('Failed to send email');
    }
  } else {
    // Development fallback - log to console
    console.log('🔗 Password Reset Link (Email service disabled):');
    console.log(`User: ${params.firstName} ${params.lastName} (${params.userEmail})`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('Token expires in 30 minutes');
  }
}
```

### Alternative Email Services

#### AWS SES Configuration
```typescript
// Alternative: AWS SES setup
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function sendEmailViaSES(params: EmailParams) {
  const command = new SendEmailCommand({
    Source: 'noreply@navimed-healthcare.com',
    Destination: { ToAddresses: [params.userEmail] },
    Message: {
      Subject: { Data: params.subject },
      Body: {
        Html: { Data: params.html },
        Text: { Data: params.text }
      }
    }
  });
  
  await sesClient.send(command);
}
```

#### Development Console Logging
```typescript
// For development - enhanced console logging
export function logEmailToConsole(params: EmailParams) {
  console.log('\n📧 EMAIL NOTIFICATION');
  console.log('═'.repeat(50));
  console.log(`📧 To: ${params.userEmail}`);
  console.log(`📧 Subject: ${params.subject}`);
  console.log(`📧 Type: ${params.type}`);
  if (params.resetLink) {
    console.log(`🔗 Reset Link: ${params.resetLink}`);
    console.log(`⏰ Expires: 30 minutes`);
  }
  console.log('═'.repeat(50));
}
```

### Email Templates

#### HTML Template Structure
```typescript
function generatePasswordResetHTML(params: EmailParams, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - NaviMED</title>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .security-notice { background: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 NaviMED Healthcare Platform</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${params.firstName} ${params.lastName},</p>
          <p>We received a request to reset your password for your NaviMED Healthcare account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <div class="security-notice">
            <strong>🔒 Security Notice:</strong>
            <ul>
              <li>This link expires in <strong>30 minutes</strong></li>
              <li>The link can only be used <strong>once</strong></li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>
          
          <p>Best regards,<br>NaviMED Healthcare Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

---

## 8. Multi-tenant Development

### Tenant Isolation Principles

#### Data Access Patterns
```typescript
// ✅ CORRECT: Always include tenantId in queries
async getPatients(tenantId: string): Promise<Patient[]> {
  return await db.select()
    .from(patients)
    .where(eq(patients.tenantId, tenantId));
}

// ❌ INCORRECT: Missing tenant isolation
async getPatients(): Promise<Patient[]> {
  return await db.select().from(patients); // SECURITY RISK!
}

// ✅ CORRECT: Tenant-scoped updates
async updatePatient(id: number, tenantId: string, data: Partial<Patient>): Promise<Patient> {
  const [updated] = await db.update(patients)
    .set(data)
    .where(
      and(
        eq(patients.id, id),
        eq(patients.tenantId, tenantId) // Critical tenant check
      )
    )
    .returning();
    
  if (!updated) {
    throw new Error('Patient not found or access denied');
  }
  
  return updated;
}
```

#### Cross-Tenant Operations
```typescript
// Special cross-tenant tables for authorized sharing
export const crossTenantPatients = pgTable("cross_tenant_patients", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull(),
  sourceTenantId: varchar("source_tenant_id").notNull(), // Original hospital
  authorizedTenantId: varchar("authorized_tenant_id").notNull(), // Pharmacy/Lab
  accessType: varchar("access_type").notNull(), // 'prescription', 'lab_order'
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Usage in storage layer
async authorizePatientAccess(
  patientId: string, 
  sourceTenantId: string, 
  targetTenantId: string, 
  accessType: string
): Promise<void> {
  await db.insert(crossTenantPatients).values({
    patientId,
    sourceTenantId,
    authorizedTenantId: targetTenantId,
    accessType,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
}
```

### Tenant Context Middleware

```typescript
// server/middleware/tenant.ts
export const requireTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant context required" });
    }
    
    // Fetch and attach full tenant object
    const tenant = await storage.getTenant(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ message: "Failed to load tenant context" });
  }
};

// Usage in routes
app.get('/api/tenant-specific-data', 
  authenticateToken, 
  requireTenant, 
  async (req, res) => {
    // req.tenant is now available
    const data = await storage.getTenantSpecificData(req.tenant.id);
    res.json({ data });
  }
);
```

### Super Admin Operations

```typescript
// Special handling for super admin cross-tenant access
export const requireSuperAdminOrTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'super_admin') {
    // Super admin can access any tenant
    return next();
  }
  
  // Regular users need tenant context
  return requireTenant(req, res, next);
};

// Super admin can override tenant restrictions
app.get('/api/admin/all-tenants-data', 
  authenticateToken, 
  requireRole(['super_admin']), 
  async (req, res) => {
    const allData = await storage.getAllTenantsData(); // No tenant filter
    res.json({ data: allData });
  }
);
```

---

## 9. Common Issues & Solutions

### Database & Schema Issues

#### Issue: Primary Key Type Mismatches
```typescript
// ❌ PROBLEM: Changing existing ID types breaks data
// If database has serial IDs, don't change to varchar
id: varchar("id").primaryKey() // Breaks existing serial data

// ✅ SOLUTION: Match existing database structure
// Check current schema first, then match in code
id: serial("id").primaryKey() // Keep if DB uses serial
// OR
id: varchar("id").primaryKey().default(sql`gen_random_uuid()`) // Keep if DB uses varchar
```

#### Issue: Migration Failures
```bash
# When schema changes fail
npm run db:push --force  # Force apply changes (development only)

# Always backup production data before schema changes
```

### Authentication Issues

#### Issue: Token Expiration Errors
```typescript
// Check for specific token expiration vs general auth failure
if (error.message === "Token expired") {
  // Redirect to login with specific message
  redirect('/login?reason=expired');
} else if (error.message === "Token invalidated by password change") {
  // User changed password, inform them
  redirect('/login?reason=password-changed');
}
```

#### Issue: Password Reset Not Working
```typescript
// Debug checklist:
1. Check SENDGRID_API_KEY format (must start with 'SG.')
2. Verify email service initialization in logs
3. Check token expiration (30 minutes)
4. Ensure token hasn't been used already
5. Validate token hash matches database
```

### Frontend Issues

#### Issue: SelectItem Errors
```typescript
// ❌ PROBLEM: SelectItem without value prop
<SelectItem>Option 1</SelectItem>

// ✅ SOLUTION: Always provide value prop
<SelectItem value="option1">Option 1</SelectItem>
<SelectItem value="option2">Option 2</SelectItem>
```

#### Issue: React Query Cache Issues
```typescript
// ❌ PROBLEM: String interpolation in query keys
queryKey: [`/api/patients/${patientId}`] // Cache invalidation doesn't work

// ✅ SOLUTION: Use array structure for hierarchical keys
queryKey: ['/api/patients', patientId] // Proper cache invalidation

// Invalidate all patient queries
queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
```

#### Issue: Form Validation Errors
```typescript
// Debug form issues by logging form state
const form = useForm({...});

// Add this to see validation errors
console.log('Form errors:', form.formState.errors);

// Check if field names match schema
const schema = z.object({
  email: z.string().email(), // Must match FormField name="email"
});
```

### API & Server Issues

#### Issue: HEAD Request Flooding
```typescript
// ✅ SOLUTION: Add dedicated HEAD handler before other middleware
app.head('/api', (req, res) => {
  res.status(204).end(); // No content response
});

// Place this handler BEFORE rate limiting middleware
```

#### Issue: Rate Limiting Bypass
```typescript
// Ensure rate limiting is properly configured
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to specific routes, not globally
app.use('/api/auth', rateLimiter);
```

### Email Service Issues

#### Issue: SendGrid Key Validation
```typescript
// Validate SendGrid API key format
const isValidSendGridKey = (key: string): boolean => {
  return key && key.startsWith('SG.') && key.length > 20;
};

// Enhanced initialization
if (isValidSendGridKey(process.env.SENDGRID_API_KEY)) {
  // Initialize SendGrid
} else {
  console.warn('Invalid SendGrid API key format. Expected: SG.xxx...');
}
```

#### Issue: Email Sending Failures
```typescript
// Implement retry logic for email sending
async function sendEmailWithRetry(emailData: EmailData, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mailService.send(emailData);
      return; // Success
    } catch (error) {
      console.error(`Email attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
}
```

### Performance Issues

#### Issue: Slow Database Queries
```typescript
// Add indexes for frequently queried fields
export const prescriptions = pgTable("prescriptions", {
  // ... columns
}, (table) => ({
  tenantIdIdx: index("prescriptions_tenant_id_idx").on(table.tenantId),
  statusIdx: index("prescriptions_status_idx").on(table.status),
  createdAtIdx: index("prescriptions_created_at_idx").on(table.createdAt),
  // Composite index for common query patterns
  tenantStatusIdx: index("prescriptions_tenant_status_idx").on(table.tenantId, table.status)
}));
```

#### Issue: Large Result Sets
```typescript
// Implement pagination for large datasets
async getPaginatedPrescriptions(tenantId: string, page = 1, limit = 50): Promise<{
  data: Prescription[];
  total: number;
  hasMore: boolean;
}> {
  const offset = (page - 1) * limit;
  
  const [data, [{ count }]] = await Promise.all([
    db.select()
      .from(prescriptions)
      .where(eq(prescriptions.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(prescriptions.createdAt)),
    
    db.select({ count: count() })
      .from(prescriptions)
      .where(eq(prescriptions.tenantId, tenantId))
  ]);
  
  return {
    data,
    total: count,
    hasMore: offset + data.length < count
  };
}
```

---

## 10. Future Development

### Scalability Considerations

#### Database Optimization
```typescript
// Implement database connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use for high-volume operations
```

#### Caching Strategy
```typescript
// Implement Redis caching for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache tenant information
async function getCachedTenant(tenantId: string): Promise<Tenant | null> {
  const cacheKey = `tenant:${tenantId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const tenant = await storage.getTenant(tenantId);
  if (tenant) {
    await redis.setex(cacheKey, 300, JSON.stringify(tenant)); // 5 min cache
  }
  
  return tenant;
}
```

### Feature Extension Patterns

#### New Module Development
```typescript
// 1. Define schema in shared/schema.ts
export const newModule = pgTable("new_module", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id").notNull(),
  // ... other fields
});

// 2. Add to storage interface
interface IStorage {
  // New module methods
  createNewModuleItem(data: InsertNewModule): Promise<NewModule>;
  getNewModuleItems(tenantId: string): Promise<NewModule[]>;
}

// 3. Create dedicated route file
// server/new-module-routes.ts
export function registerNewModuleRoutes(app: Express) {
  app.get('/api/new-module', authenticateToken, requireTenant, async (req, res) => {
    // Implementation
  });
}

// 4. Register in main routes
import { registerNewModuleRoutes } from './new-module-routes';
registerNewModuleRoutes(app);
```

#### Background Job Implementation
```typescript
// Future: Add background job processing
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email processing');

// Add job to queue
await emailQueue.add('send-email', {
  type: 'password-reset',
  userEmail: 'user@example.com',
  // ... other data
});

// Process jobs
const worker = new Worker('email processing', async (job) => {
  const { type, userEmail, ...data } = job.data;
  
  switch (type) {
    case 'password-reset':
      await sendPasswordResetEmail(data);
      break;
    // Handle other email types
  }
});
```

### API Versioning Strategy

```typescript
// Future: API versioning for backward compatibility
// v1 routes (existing)
app.use('/api/v1', v1Routes);

// v2 routes (new features)
app.use('/api/v2', v2Routes);

// Default to latest version
app.use('/api', v2Routes);

// Version-specific middleware
const requireApiVersion = (version: string) => (req, res, next) => {
  req.apiVersion = version;
  next();
};
```

### Security Enhancements

#### Audit Logging
```typescript
// Future: Comprehensive audit logging
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id"),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  resource: varchar("resource").notNull(), // 'patient', 'prescription'
  resourceId: varchar("resource_id"),
  changes: json("changes"), // What changed
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Middleware to log all data modifications
const auditMiddleware = (action: string, resource: string) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) { // Only log successful operations
        await storage.createAuditLog({
          tenantId: req.user?.tenantId,
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.params.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
    });
    next();
  };
```

#### Enhanced Security Headers
```typescript
// Future: Comprehensive security headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Monitoring & Analytics

#### Health Checks
```typescript
// Comprehensive health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      email: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    // Check database
    await db.select().from(users).limit(1);
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check email service
  health.services.email = mailService ? 'ok' : 'disabled';

  res.status(health.status === 'ok' ? 200 : 503).json(health);
});
```

### Development Environment Setup

#### Local Development Script
```typescript
// scripts/dev-setup.ts
async function setupDevelopment() {
  console.log('🚀 Setting up NaviMED development environment...');
  
  // 1. Check environment variables
  const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredEnvs.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    process.exit(1);
  }
  
  // 2. Initialize database
  console.log('📊 Initializing database...');
  await initializeDatabase();
  
  // 3. Create default super admin
  console.log('👤 Creating super admin user...');
  await createSuperAdmin();
  
  // 4. Seed development data
  console.log('🌱 Seeding development data...');
  await seedDevelopmentData();
  
  console.log('✅ Development environment ready!');
  console.log('🔐 Super admin login: abel@argilette.com / Serrega1208@');
}
```

---

## Conclusion

This developer guide provides comprehensive coverage of the NaviMED healthcare platform architecture, development patterns, and best practices. Key takeaways:

### Critical Security Points
- **Always enforce tenant isolation** in all data operations
- **Never store plaintext passwords or tokens**
- **Validate all inputs** with Zod schemas
- **Use proper authentication** for all protected endpoints

### Development Best Practices
- **Follow the prescribed order**: Schema → Storage → Routes → Frontend
- **Use TypeScript strictly** for type safety
- **Implement proper error handling** with consistent responses
- **Add comprehensive testing** with data-testid attributes

### Production Readiness
- **Set strong JWT secrets** and environment variables
- **Configure proper rate limiting** and security headers
- **Implement audit logging** for compliance
- **Monitor health checks** and system performance

This guide should serve as the authoritative reference for all developers working on the NaviMED platform. Keep it updated as the system evolves and new patterns emerge.

---

**Version**: 1.0  
**Last Updated**: September 2025  
**Maintained By**: Development Team