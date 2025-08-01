# Healthcare Management Platform

## Overview
This project is a comprehensive multi-tenant healthcare management platform designed to optimize operations and workflows across various healthcare entities, including hospitals, clinics, pharmacies, and laboratories. Its core purpose is to streamline prescription management, facilitate insurance claims processing, manage patient records, and enhance communication between healthcare providers and patients. The platform aims to be a leading solution in digital health, improving efficiency, patient care, and data management in a secure and compliant manner.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

## System Architecture
The platform is built on a modern stack ensuring scalability, security, and maintainability.

-   **Frontend**: Developed with React and TypeScript, leveraging Tailwind CSS for a utility-first styling approach, ensuring a clean and responsive user interface.
-   **Backend**: Powered by Node.js and Express.js, written in TypeScript, providing a robust and efficient API layer.
-   **Database**: Utilizes PostgreSQL as the primary data store, managed through Drizzle ORM for type-safe and efficient database interactions.
-   **Authentication**: Implements JWT (JSON Web Token) for secure user authentication, coupled with a granular role-based access control (RBAC) system to manage user permissions across different modules and tenants.
-   **Multi-tenancy**: Designed with a strong multi-tenant architecture where data is strictly isolated per organization (hospital, pharmacy, laboratory), while allowing for controlled cross-tenant interactions where necessary (e.g., prescription routing, lab order routing). Super admin capabilities oversee the entire system.
-   **Role Separation**: Enforces strict role separation, ensuring users have access only to functionalities relevant to their role and tenant type.
-   **UI/UX Decisions**:
    -   Intuitive navigation with distinct dashboards for different user roles (admin, doctor, nurse, receptionist, pharmacy staff, lab staff).
    -   Color-coded alerts and visual indicators for statuses.
    -   Streamlined workflows for common tasks like patient registration, appointment booking, prescription dispensing, and lab order processing.
    -   Comprehensive patient portal with features like health tracking, medical records access, and secure messaging.
    -   Dynamic permission management UI for tenant administrators.
-   **Technical Implementations**:
    -   **Automated Insurance Verification & Copay Calculation**: System automatically fetches patient insurance details, identifies primary policies, and calculates copays based on coverage rules.
    -   **Cross-Tenant Patient & Data Synchronization**: Enables secure and compliant sharing of patient and insurance data across relevant tenants.
    -   **Pharmacy Workflow Management**: Features a complete workflow (New → Insurance Verification → Processing → Ready → Dispensed) with real-time status updates and archiving capabilities.
    -   **Bidirectional Medical Communications**: A unified messaging system allows secure and compliant communication between patients and doctors.
    -   **Lab Order & Results Management**: Supports creation and routing of lab orders and comprehensive management/viewing of lab results.
    -   **Patient Portal & Telemedicine**: Provides a secure patient portal with features like appointment booking, health tracking, and integrated telemedicine consultation setup.
    -   **Dynamic Role Permissions**: Allows tenant administrators to granularly define and manage permissions for each user role.
    -   **Automated Currency Detection**: Assigns currency based on the hospital's geographic location.
    -   **Multi-language Support**: Features a fully functional translation system for the user interface.
    -   **Enterprise Features**: Includes white-label branding capabilities, tiered pricing plans, and offline synchronization.
    -   **Gamified Achievement System**: For laboratory performance tracking with automatic tracking, real-time progress updates, and leaderboards.
    -   **Unified Billing Systems**: Comprehensive billing for hospital, pharmacy, and laboratory with analytics and reporting.
    -   **Notification System**: Real-time notifications for lab results, insurance claims, and appointments.
    -   **Multi-Doctor Patient Data Separation**: Strict data separation between doctors in the same hospital via patient access request system with approval workflow and audit logging.

## External Dependencies
The platform integrates with several external components and services to deliver its full functionality:

-   **PostgreSQL**: The primary relational database.
-   **JWT (JSON Web Tokens)**: Used for secure authentication and authorization.
-   **Drizzle ORM**: An object-relational mapper for interacting with PostgreSQL.
-   **YouTube, Vimeo Business, AWS Enterprise**: Options for video tutorial hosting and integration.
-   **Custom API Endpoints**: For fetching patient insurance details cross-tenant, cross-tenant patient synchronization for billing, unified patient-doctor messaging, hospital directory synchronization, and medical history updates.
-   **Payment Gateways**: Implicitly required for payment processing and receipt generation.
-   **Email Service**: For sending user credentials, welcome messages, and other notifications.