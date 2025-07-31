# Healthcare Management Platform

## Overview
This project is a comprehensive multi-tenant healthcare management platform designed to optimize operations and workflows across various healthcare entities, including hospitals, clinics, pharmacies, and laboratories. Its core purpose is to streamline prescription management, facilitate insurance claims processing, manage patient records, and enhance communication between healthcare providers and patients. The platform aims to be a leading solution in digital health, improving efficiency, patient care, and data management in a secure and compliant manner.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

## Recent Changes
- **Insurance Auto-Population Fixed (July 31, 2025)**: Resolved complex issue with insurance provider field not populating in pharmacy dashboard. Root cause was React controlled component state conflicts. Final solution implemented using React refs with focus/blur triggers for reliable field population.
- **Pharmacy Receipt Validation Fixed (July 31, 2025)**: Resolved date validation errors in pharmacy receipt creation. Backend now properly converts prescribedDate strings to Date objects during API processing, eliminating JSON serialization issues.

## System Architecture
The platform is built on a modern stack ensuring scalability, security, and maintainability.

-   **Frontend**: Developed with React and TypeScript, leveraging Tailwind CSS for a utility-first styling approach, ensuring a clean and responsive user interface.
-   **Backend**: Powered by Node.js and Express.js, written in TypeScript, providing a robust and efficient API layer.
-   **Database**: Utilizes PostgreSQL as the primary data store, managed through Drizzle ORM for type-safe and efficient database interactions.
-   **Authentication**: Implements JWT (JSON Web Token) for secure user authentication, coupled with a granular role-based access control (RBAC) system to manage user permissions across different modules and tenants.
-   **Multi-tenancy**: Designed with a strong multi-tenant architecture where data is strictly isolated per organization (hospital, pharmacy, laboratory), while allowing for controlled cross-tenant interactions where necessary (e.g., prescription routing, lab order routing). Super admin capabilities oversee the entire system.
-   **Role Separation**: Enforces strict role separation, ensuring users have access only to functionalities relevant to their role and tenant type. For instance, receptionists are exclusive to hospitals/clinics and do not exist in pharmacy operations.
-   **UI/UX Decisions**:
    -   Intuitive navigation with distinct dashboards for different user roles (admin, doctor, nurse, receptionist, pharmacy staff, lab staff).
    -   Color-coded alerts and visual indicators for statuses (e.g., abnormal lab results, consultation drafts).
    -   Streamlined workflows for common tasks like patient registration, appointment booking, prescription dispensing, and lab order processing.
    -   Comprehensive patient portal with features like health tracking, medical records access, and secure messaging.
    -   Dynamic permission management UI for tenant administrators to customize role capabilities.
-   **Technical Implementations**:
    -   **Automated Insurance Verification & Copay Calculation**: System automatically fetches patient insurance details, identifies primary policies, and calculates copays based on coverage rules, eliminating manual entry.
    -   **Cross-Tenant Patient & Data Synchronization**: Enables secure and compliant sharing of patient and insurance data across relevant tenants (e.g., a pharmacy accessing a hospital's patient insurance data for billing).
    -   **Pharmacy Workflow Management**: Features a complete workflow (New → Insurance Verification → Processing → Ready → Dispensed) with real-time status updates and archiving capabilities.
    -   **Bidirectional Medical Communications**: A unified messaging system allows secure and compliant communication between patients and doctors, and vice-versa.
    -   **Lab Order & Results Management**: Supports creation and routing of lab orders from hospitals to specific laboratories, along with comprehensive management and viewing of lab results in patient and doctor portals.
    -   **Patient Portal & Telemedicine**: Provides a secure patient portal with features like appointment booking, health tracking, and integrated telemedicine consultation setup.
    -   **Dynamic Role Permissions**: Allows tenant administrators to granularly define and manage permissions for each user role within their organization.
    -   **Automated Currency Detection**: Assigns currency based on the hospital's geographic location during registration.
    -   **Multi-language Support**: Features a fully functional translation system for the user interface.
    -   **Enterprise Features**: Includes white-label branding capabilities, tiered pricing plans, and offline synchronization for robust enterprise deployments.

## External Dependencies
The platform integrates with several external components and services to deliver its full functionality:

-   **PostgreSQL**: The primary relational database.
-   **JWT (JSON Web Tokens)**: Used for secure authentication and authorization.
-   **Drizzle ORM**: An object-relational mapper for interacting with PostgreSQL.
-   **YouTube, Vimeo Business, AWS Enterprise**: Options for video tutorial hosting and integration.
-   **Custom API Endpoints**:
    -   `/api/patient-insurance/:patientId`: For fetching patient insurance details cross-tenant.
    -   `/api/billing/patients`: For cross-tenant patient synchronization for billing.
    -   `/api/medical-communications`: Unified endpoint for patient-doctor messaging.
    -   `/api/patient/patients-list` and `/api/patient/doctors-list`: For hospital directory synchronization in the patient portal.
    -   `/api/patients/:id` (PATCH): For medical history updates by physicians.
-   **Payment Gateways**: Implicitly required for payment processing and receipt generation (specific providers not explicitly named but supported by the architecture).
-   **Email Service**: For sending user credentials, welcome messages, and other notifications.