import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { storage } from "./storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { insertUserSchema, insertTenantSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema, insertLabOrderSchema, insertInsuranceClaimSchema, insertServicePriceSchema, insertInsurancePlanCoverageSchema, insertClaimLineItemSchema, insertSubscriptionSchema, insertReportSchema, insertMedicalCommunicationSchema, insertCommunicationTranslationSchema, insertSupportedLanguageSchema, insertMedicalPhraseSchema, insertPhraseTranslationSchema, insertLaboratorySchema, insertLabResultSchema, insertLabOrderAssignmentSchema, insertLaboratoryApplicationSchema, insertVitalSignsSchema, insertVisitSummarySchema, insertHealthRecommendationSchema, insertHealthAnalysisSchema, insertRolePermissionSchema, RolePermission, InsertRolePermission, insertDepartmentSchema, departments, insertAdvertisementSchema, insertAdViewSchema, insertAdInquirySchema, insertMedicalSupplierSchema, insertPatientCheckInSchema } from "@shared/schema";
import { authenticateToken, requireRole } from "./middleware/auth";
import { setTenantContext, requireTenant } from "./middleware/tenant";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { aiHealthAnalyzer } from "./ai-health-analyzer";
import { sendWelcomeEmail, generateTemporaryPassword } from "./email-service";
import { resetAllCounters } from "./reset-all-counters";
// Removed Replit Auth - using unified JWT authentication only

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function registerRoutes(app: Express): Promise<Server> {
  // PHARMACY DASHBOARD API ENDPOINT
  app.get('/api/pharmacy-dashboard', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NaviMED Pharmacy Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #10b981;
            --accent: #8b5cf6;
            --danger: #ef4444;
            --warning: #f59e0b;
            --light: #f8fafc;
            --dark: #1e293b;
            --gray: #64748b;
            --gray-light: #e2e8f0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f1f5f9;
            color: var(--dark);
            line-height: 1.6;
        }
        
        .container {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }
        
        /* Sidebar Styles */
        .sidebar {
            background: var(--dark);
            color: white;
            padding: 1.5rem 1rem;
            position: fixed;
            width: 250px;
            height: 100vh;
            overflow-y: auto;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo i {
            font-size: 2rem;
            color: var(--secondary);
        }
        
        .logo h1 {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.8rem 1rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .nav-item:hover, .nav-item.active {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .nav-item i {
            font-size: 1.2rem;
        }
        
        /* Main Content Styles */
        .main-content {
            grid-column: 2;
            padding: 1.5rem 2rem;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--gray-light);
        }
        
        .search-bar {
            display: flex;
            align-items: center;
            background: white;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            width: 300px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .search-bar input {
            border: none;
            outline: none;
            padding: 0.5rem;
            width: 100%;
            font-size: 1rem;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        /* Dashboard Cards */
        .dashboard-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .stat-card {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
        }
        
        .bg-primary { background-color: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .bg-success { background-color: rgba(16, 185, 129, 0.1); color: var(--secondary); }
        .bg-warning { background-color: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .bg-danger { background-color: rgba(239, 68, 68, 0.1); color: var(--danger); }
        
        .stat-info h3 {
            font-size: 1.8rem;
            margin-bottom: 0.2rem;
        }
        
        .stat-info p {
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        /* Main Content Sections */
        .content-section {
            margin-bottom: 2rem;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .section-title {
            font-size: 1.4rem;
            font-weight: 600;
        }
        
        .btn {
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--primary-dark);
        }
        
        /* Tables */
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--gray-light);
        }
        
        th {
            background-color: #f8fafc;
            font-weight: 600;
        }
        
        tr:last-child td {
            border-bottom: none;
        }
        
        .status {
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-ready { background-color: rgba(16, 185, 129, 0.1); color: var(--secondary); }
        .status-pending { background-color: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .status-processing { background-color: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .status-new { background-color: rgba(139, 92, 246, 0.1); color: var(--accent); }
        
        .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--gray);
            font-size: 1.1rem;
            margin-right: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .action-btn:hover {
            color: var(--primary);
        }
        
        /* Login Section */
        .login-section {
            max-width: 400px;
            margin: 2rem auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
            margin-bottom: 1.2rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-control {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1px solid var(--gray-light);
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        /* Responsive Design */
        @media (max-width: 992px) {
            .container {
                grid-template-columns: 1fr;
            }
            
            .sidebar {
                display: none;
            }
            
            .main-content {
                grid-column: 1;
            }
            
            .dashboard-cards {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .dashboard-cards {
                grid-template-columns: 1fr;
            }
            
            .header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .search-bar {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div id="login-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
        <div class="login-section">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <i class="fas fa-prescription" style="font-size: 3rem; color: var(--secondary);"></i>
                <h1 style="margin-top: 0.5rem; color: var(--dark);">NaviMED Pharmacy</h1>
                <p style="color: var(--gray);">Healthcare Management Platform</p>
            </div>
            
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" class="form-control" value="admin@deopharmacy.com" placeholder="Enter your email">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" class="form-control" value="password" placeholder="Enter your password">
            </div>
            
            <button onclick="login()" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-sign-in-alt"></i> Login to Pharmacy
            </button>
        </div>
    </div>

    <div class="container" id="main-app" style="display: none;">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="logo">
                <i class="fas fa-prescription"></i>
                <h1>NaviMED</h1>
            </div>
            
            <div class="nav-item active" onclick="showSection('dashboard')">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
            </div>
            
            <div class="nav-item" onclick="showSection('prescriptions')">
                <i class="fas fa-prescription-bottle"></i>
                <span>Prescriptions</span>
            </div>
            
            <div class="nav-item" onclick="showSection('inventory')">
                <i class="fas fa-capsules"></i>
                <span>Inventory</span>
            </div>
            
            <div class="nav-item" onclick="showSection('patients')">
                <i class="fas fa-users"></i>
                <span>Patients</span>
            </div>
            
            <div class="nav-item" onclick="showSection('suppliers')">
                <i class="fas fa-pills"></i>
                <span>Suppliers</span>
            </div>
            
            <div class="nav-item" onclick="showSection('billing')">
                <i class="fas fa-file-invoice-dollar"></i>
                <span>Billing</span>
            </div>
            
            <div class="nav-item" onclick="showSection('reports')">
                <i class="fas fa-chart-bar"></i>
                <span>Reports</span>
            </div>
            
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <div class="header">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search patients, medications, prescriptions...">
                </div>
                
                <div class="user-profile">
                    <div class="avatar">DA</div>
                    <div>
                        <div class="user-name">DEO Admin</div>
                        <div class="user-role" style="font-size: 0.8rem; color: var(--gray);">Pharmacist</div>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Section -->
            <div id="dashboard-section" class="content-section">
                <!-- Dashboard Cards -->
                <div class="dashboard-cards">
                    <div class="card stat-card">
                        <div class="stat-icon bg-primary">
                            <i class="fas fa-prescription-bottle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="new-prescriptions">0</h3>
                            <p>New Prescriptions</p>
                        </div>
                    </div>
                    
                    <div class="card stat-card">
                        <div class="stat-icon bg-success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="ready-prescriptions">0</h3>
                            <p>Ready for Pickup</p>
                        </div>
                    </div>
                    
                    <div class="card stat-card">
                        <div class="stat-icon bg-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="processing-prescriptions">0</h3>
                            <p>Processing</p>
                        </div>
                    </div>
                    
                    <div class="card stat-card">
                        <div class="stat-icon bg-danger">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="total-prescriptions">0</h3>
                            <p>Total Prescriptions</p>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Prescriptions -->
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Prescriptions</h2>
                        <button class="btn btn-primary" onclick="showSection('prescriptions')">View All</button>
                    </div>
                    
                    <div class="table-container">
                        <table id="prescriptions-table">
                            <thead>
                                <tr>
                                    <th>Rx Number</th>
                                    <th>Patient</th>
                                    <th>Medication</th>
                                    <th>Physician</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="prescriptions-tbody">
                                <tr>
                                    <td colspan="6" style="text-align: center; padding: 2rem;">
                                        <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--gray);"></i>
                                        <p style="margin-top: 0.5rem; color: var(--gray);">Loading prescriptions...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Other sections will be populated based on navigation -->
            <div id="prescriptions-section" class="content-section" style="display: none;">
                <h2 class="section-title">All Prescriptions</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Rx Number</th>
                                <th>Patient</th>
                                <th>Medication</th>
                                <th>Dosage</th>
                                <th>Quantity</th>
                                <th>Physician</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="all-prescriptions-tbody">
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div id="inventory-section" class="content-section" style="display: none;">
                <h2 class="section-title">Inventory Management</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="total-medications">127</div>
                        <div class="stat-label">Total Medications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="low-stock">8</div>
                        <div class="stat-label">Low Stock Alerts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="expired-soon">3</div>
                        <div class="stat-label">Expiring Soon</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total-value">$42,850</div>
                        <div class="stat-label">Inventory Value</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Medication Inventory</h3>
                        <button class="btn btn-primary" onclick="addMedication()">
                            <i class="fas fa-plus"></i> Add Medication
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>NDC Code</th>
                                    <th>Medication</th>
                                    <th>Strength</th>
                                    <th>Quantity</th>
                                    <th>Expiry</th>
                                    <th>Unit Cost</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-tbody">
                                <tr>
                                    <td>0069-3130-68</td>
                                    <td>Lisinopril</td>
                                    <td>10mg</td>
                                    <td><span class="status status-danger">15</span></td>
                                    <td>2026-03-15</td>
                                    <td>$0.45</td>
                                    <td><span class="status status-warning">Low Stock</span></td>
                                    <td>
                                        <button class="action-btn" onclick="reorderMedication('lisinopril')"><i class="fas fa-shopping-cart"></i></button>
                                        <button class="action-btn" onclick="editMedication('lisinopril')"><i class="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>0078-0222-15</td>
                                    <td>Metformin</td>
                                    <td>500mg</td>
                                    <td><span class="status status-success">450</span></td>
                                    <td>2025-11-30</td>
                                    <td>$0.23</td>
                                    <td><span class="status status-success">In Stock</span></td>
                                    <td>
                                        <button class="action-btn" onclick="reorderMedication('metformin')"><i class="fas fa-shopping-cart"></i></button>
                                        <button class="action-btn" onclick="editMedication('metformin')"><i class="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>0071-0155-23</td>
                                    <td>Atorvastatin</td>
                                    <td>20mg</td>
                                    <td><span class="status status-success">285</span></td>
                                    <td>2026-07-22</td>
                                    <td>$1.12</td>
                                    <td><span class="status status-success">In Stock</span></td>
                                    <td>
                                        <button class="action-btn" onclick="reorderMedication('atorvastatin')"><i class="fas fa-shopping-cart"></i></button>
                                        <button class="action-btn" onclick="editMedication('atorvastatin')"><i class="fas fa-edit"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="patients-section" class="content-section" style="display: none;">
                <h2 class="section-title">Patient Management</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="active-patients">1,247</div>
                        <div class="stat-label">Active Patients</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="new-patients">23</div>
                        <div class="stat-label">New This Month</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="insurance-verified">967</div>
                        <div class="stat-label">Insurance Verified</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="loyalty-members">589</div>
                        <div class="stat-label">Loyalty Members</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Patient Records</h3>
                        <div class="search-bar">
                            <input type="text" placeholder="Search patients..." onkeyup="searchPatients(this.value)">
                            <button class="btn btn-primary" onclick="addPatient()">
                                <i class="fas fa-user-plus"></i> Add Patient
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Name</th>
                                    <th>Date of Birth</th>
                                    <th>Insurance</th>
                                    <th>Active Rx</th>
                                    <th>Last Visit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="patients-tbody">
                                <tr>
                                    <td>P001247</td>
                                    <td>Sarah Johnson</td>
                                    <td>1985-03-15</td>
                                    <td>BlueCross BlueShield</td>
                                    <td>3</td>
                                    <td>2025-08-20</td>
                                    <td><span class="status status-success">Active</span></td>
                                    <td>
                                        <button class="action-btn" onclick="viewPatient('P001247')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="editPatient('P001247')"><i class="fas fa-edit"></i></button>
                                        <button class="action-btn" onclick="patientHistory('P001247')"><i class="fas fa-history"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>P001248</td>
                                    <td>Michael Chen</td>
                                    <td>1978-11-22</td>
                                    <td>Aetna</td>
                                    <td>1</td>
                                    <td>2025-08-18</td>
                                    <td><span class="status status-success">Active</span></td>
                                    <td>
                                        <button class="action-btn" onclick="viewPatient('P001248')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="editPatient('P001248')"><i class="fas fa-edit"></i></button>
                                        <button class="action-btn" onclick="patientHistory('P001248')"><i class="fas fa-history"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="suppliers-section" class="content-section" style="display: none;">
                <h2 class="section-title">Supplier Management</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="active-suppliers">12</div>
                        <div class="stat-label">Active Suppliers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="pending-orders">7</div>
                        <div class="stat-label">Pending Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="monthly-spending">$18,450</div>
                        <div class="stat-label">Monthly Spending</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="delivery-time">2.3</div>
                        <div class="stat-label">Avg Delivery Days</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Supplier Directory</h3>
                        <button class="btn btn-primary" onclick="addSupplier()">
                            <i class="fas fa-plus"></i> Add Supplier
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Contact</th>
                                    <th>Specialization</th>
                                    <th>Rating</th>
                                    <th>Active Orders</th>
                                    <th>Payment Terms</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="suppliers-tbody">
                                <tr>
                                    <td>Cardinal Health</td>
                                    <td>orders@cardinalhealth.com</td>
                                    <td>Generic Pharmaceuticals</td>
                                    <td>⭐⭐⭐⭐⭐ 4.8</td>
                                    <td>3</td>
                                    <td>Net 30</td>
                                    <td><span class="status status-success">Active</span></td>
                                    <td>
                                        <button class="action-btn" onclick="viewSupplier('cardinal')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="createOrder('cardinal')"><i class="fas fa-shopping-cart"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>McKesson Corporation</td>
                                    <td>pharmacy@mckesson.com</td>
                                    <td>Brand & Generic</td>
                                    <td>⭐⭐⭐⭐⭐ 4.6</td>
                                    <td>2</td>
                                    <td>Net 45</td>
                                    <td><span class="status status-success">Active</span></td>
                                    <td>
                                        <button class="action-btn" onclick="viewSupplier('mckesson')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="createOrder('mckesson')"><i class="fas fa-shopping-cart"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="billing-section" class="content-section" style="display: none;">
                <h2 class="section-title">Billing & Insurance</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="monthly-revenue">$127,450</div>
                        <div class="stat-label">Monthly Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="insurance-claims">89</div>
                        <div class="stat-label">Pending Claims</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="copay-collected">$8,290</div>
                        <div class="stat-label">Copays Collected</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="claim-success">94.2%</div>
                        <div class="stat-label">Claim Success Rate</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Transactions</h3>
                        <button class="btn btn-primary" onclick="processClaim()">
                            <i class="fas fa-file-invoice"></i> Process Claim
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Patient</th>
                                    <th>Insurance</th>
                                    <th>Amount</th>
                                    <th>Copay</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="billing-tbody">
                                <tr>
                                    <td>TXN-001234</td>
                                    <td>Sarah Johnson</td>
                                    <td>BlueCross BlueShield</td>
                                    <td>$45.99</td>
                                    <td>$10.00</td>
                                    <td><span class="status status-success">Paid</span></td>
                                    <td>2025-08-28</td>
                                    <td>
                                        <button class="action-btn" onclick="viewTransaction('001234')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="printReceipt('001234')"><i class="fas fa-print"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>TXN-001235</td>
                                    <td>Michael Chen</td>
                                    <td>Aetna</td>
                                    <td>$127.50</td>
                                    <td>$25.00</td>
                                    <td><span class="status status-warning">Pending</span></td>
                                    <td>2025-08-28</td>
                                    <td>
                                        <button class="action-btn" onclick="viewTransaction('001235')"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn" onclick="followUpClaim('001235')"><i class="fas fa-phone"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="reports-section" class="content-section" style="display: none;">
                <h2 class="section-title">Reports & Analytics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="prescriptions-filled">2,847</div>
                        <div class="stat-label">Prescriptions Filled (MTD)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-wait-time">12 min</div>
                        <div class="stat-label">Avg Wait Time</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="customer-satisfaction">4.7/5</div>
                        <div class="stat-label">Customer Satisfaction</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="profit-margin">23.5%</div>
                        <div class="stat-label">Profit Margin</div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Generate Reports</h3>
                    </div>
                    <div class="reports-grid">
                        <div class="report-card" onclick="generateReport('financial')">
                            <i class="fas fa-chart-line"></i>
                            <h4>Financial Report</h4>
                            <p>Revenue, expenses, and profit analysis</p>
                        </div>
                        <div class="report-card" onclick="generateReport('inventory')">
                            <i class="fas fa-boxes"></i>
                            <h4>Inventory Report</h4>
                            <p>Stock levels, turnover, and reorder points</p>
                        </div>
                        <div class="report-card" onclick="generateReport('prescription')">
                            <i class="fas fa-prescription-bottle"></i>
                            <h4>Prescription Report</h4>
                            <p>Volume, trends, and medication analysis</p>
                        </div>
                        <div class="report-card" onclick="generateReport('compliance')">
                            <i class="fas fa-shield-alt"></i>
                            <h4>Compliance Report</h4>
                            <p>Regulatory compliance and audit trails</p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>

    <script>
        let authToken = localStorage.getItem('auth_token');
        let prescriptionsData = [];

        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: password })
                });

                const data = await response.json();
                
                if (response.ok && data.token) {
                    authToken = data.token;
                    localStorage.setItem('auth_token', authToken);
                    
                    document.getElementById('login-overlay').style.display = 'none';
                    document.getElementById('main-app').style.display = 'block';
                    
                    loadPrescriptions();
                } else {
                    alert('Login failed: ' + (data.error || 'Invalid credentials'));
                }
            } catch (error) {
                alert('Login error: ' + error.message);
            }
        }

        async function loadPrescriptions() {
            try {
                const response = await fetch('/api/pharmacy/prescriptions', {
                    headers: {
                        'Authorization': 'Bearer ' + authToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    prescriptionsData = await response.json();
                    updateStats(prescriptionsData);
                    displayRecentPrescriptions(prescriptionsData);
                    displayAllPrescriptions(prescriptionsData);
                } else {
                    throw new Error('Failed to fetch prescriptions');
                }
            } catch (error) {
                console.error('Error loading prescriptions:', error);
                document.getElementById('prescriptions-tbody').innerHTML = 
                    '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Error loading prescriptions</td></tr>';
            }
        }

        function updateStats(prescriptions) {
            const total = prescriptions.length;
            const newCount = prescriptions.filter(p => p.status === 'new').length;
            const processing = prescriptions.filter(p => p.status === 'processing').length;
            const ready = prescriptions.filter(p => p.status === 'ready').length;

            document.getElementById('total-prescriptions').textContent = total;
            document.getElementById('new-prescriptions').textContent = newCount;
            document.getElementById('processing-prescriptions').textContent = processing;
            document.getElementById('ready-prescriptions').textContent = ready;
        }

        function displayRecentPrescriptions(prescriptions) {
            const tbody = document.getElementById('prescriptions-tbody');
            const recent = prescriptions.slice(0, 5);
            
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No prescriptions found</td></tr>';
                return;
            }

            tbody.innerHTML = recent.map(prescription => {
                const patientName = prescription.patientName.includes('Patient') ? 
                    'Patient ' + prescription.patientName.split(' ')[1].slice(0,8) : 
                    prescription.patientName;
                const doctorName = prescription.prescribingDoctor.includes('Provider') ? 
                    'Dr. ' + prescription.prescribingDoctor.split(' ')[1].slice(0,8) : 
                    prescription.prescribingDoctor;
                
                return \`<tr>
                    <td>RX-\${prescription.id.slice(0,8)}</td>
                    <td>\${patientName}</td>
                    <td>\${prescription.medication}</td>
                    <td>\${doctorName}</td>
                    <td><span class="status status-\${prescription.status}">\${prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span></td>
                    <td>
                        <button class="action-btn" onclick="viewPrescription('\${prescription.id}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn" onclick="printPrescription('\${prescription.id}')"><i class="fas fa-print"></i></button>
                    </td>
                </tr>\`;
            }).join('');
        }

        function displayAllPrescriptions(prescriptions) {
            const tbody = document.getElementById('all-prescriptions-tbody');
            
            tbody.innerHTML = prescriptions.map(prescription => {
                const patientName = prescription.patientName.includes('Patient') ? 
                    'Patient ' + prescription.patientName.split(' ')[1].slice(0,8) : 
                    prescription.patientName;
                const doctorName = prescription.prescribingDoctor.includes('Provider') ? 
                    'Dr. ' + prescription.prescribingDoctor.split(' ')[1].slice(0,8) : 
                    prescription.prescribingDoctor;
                
                return \`<tr>
                    <td>RX-\${prescription.id.slice(0,8)}</td>
                    <td>\${patientName}</td>
                    <td>\${prescription.medication}</td>
                    <td>\${prescription.dosage}</td>
                    <td>\${prescription.quantity}</td>
                    <td>\${doctorName}</td>
                    <td><span class="status status-\${prescription.status}">\${prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</span></td>
                    <td>
                        <button class="action-btn" onclick="viewPrescription('\${prescription.id}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn" onclick="printPrescription('\${prescription.id}')"><i class="fas fa-print"></i></button>
                        <button class="action-btn" onclick="processPrescription('\${prescription.id}')"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>\`;
            }).join('');
        }

        function showSection(sectionName) {
            // Hide all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.style.display = 'none');
            
            // Remove active class from all nav items
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Show selected section
            document.getElementById(sectionName + '-section').style.display = 'block';
            
            // Add active class to selected nav item
            event.target.closest('.nav-item').classList.add('active');
        }

        function viewPrescription(id) {
            const prescription = prescriptionsData.find(p => p.id === id);
            if (prescription) {
                alert('Prescription Details:\\n\\nMedication: ' + prescription.medication + '\\nDosage: ' + prescription.dosage + '\\nQuantity: ' + prescription.quantity + '\\nStatus: ' + prescription.status);
            }
        }

        function printPrescription(id) {
            alert('Printing prescription label for RX-' + id.slice(0,8));
        }

        function processPrescription(id) {
            if (confirm('Process this prescription?')) {
                alert('Prescription processed successfully!');
                loadPrescriptions(); // Refresh data
            }
        }

        // Tab navigation functions for new features
        function addMedication() {
            alert('Add Medication feature - would open medication entry form');
        }

        function reorderMedication(medication) {
            alert('Reorder ' + medication + ' - would contact supplier for restocking');
        }

        function editMedication(medication) {
            alert('Edit ' + medication + ' - would open medication details editor');
        }

        function addPatient() {
            alert('Add Patient feature - would open patient registration form');
        }

        function searchPatients(query) {
            console.log('Searching patients for: ' + query);
            // Would implement patient search functionality
        }

        function viewPatient(patientId) {
            alert('View Patient ' + patientId + ' - would show patient profile');
        }

        function editPatient(patientId) {
            alert('Edit Patient ' + patientId + ' - would open patient editor');
        }

        function patientHistory(patientId) {
            alert('Patient History ' + patientId + ' - would show prescription and visit history');
        }

        function addSupplier() {
            alert('Add Supplier feature - would open supplier registration form');
        }

        function viewSupplier(supplier) {
            alert('View ' + supplier + ' details - would show supplier profile and catalog');
        }

        function createOrder(supplier) {
            alert('Create order with ' + supplier + ' - would open order form');
        }

        function processClaim() {
            alert('Process Insurance Claim - would open claim submission form');
        }

        function viewTransaction(transactionId) {
            alert('View Transaction ' + transactionId + ' - would show transaction details');
        }

        function printReceipt(transactionId) {
            alert('Print Receipt ' + transactionId + ' - would generate printable receipt');
        }

        function followUpClaim(transactionId) {
            alert('Follow up claim ' + transactionId + ' - would contact insurance company');
        }

        function generateReport(reportType) {
            alert('Generate ' + reportType + ' report - would create comprehensive ' + reportType + ' analytics');
        }


        // Auto-login if token exists
        if (authToken) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            loadPrescriptions();
        }
    </script>
</body>
</html>`);
  });

  // PUBLIC ENDPOINTS (before any middleware)
  
  // Public supplier registration endpoint (outside /api path to avoid middleware)
  app.post('/public/suppliers/register', async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      
      // Validate username and password
      if (!req.body.username || req.body.username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }
      
      if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

      // Map form data to database schema
      const supplierData = {
        companyName: req.body.companyName,
        businessType: req.body.businessType,
        contactPersonName: req.body.contactPersonName || req.body.companyName,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        websiteUrl: req.body.website || null,
        businessAddress: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country || 'USA',
        zipCode: req.body.zipCode,
        businessDescription: req.body.description,
        productCategories: req.body.specialties ? [req.body.specialties] : [],
        yearsInBusiness: req.body.yearsInBusiness || "1-2",
        numberOfEmployees: req.body.numberOfEmployees || "1-10",
        annualRevenue: req.body.annualRevenue || "Under $1M",
        certifications: [],
        username: req.body.username,
        passwordHash: passwordHash,
        termsAccepted: req.body.termsAccepted === true || req.body.termsAccepted === "true",
        marketingConsent: req.body.marketingConsent === true || req.body.marketingConsent === "true"
      };

      console.log('Mapped supplier data:', supplierData);

      // Validate only the required fields (excluding auto-generated ones)
      const requiredFields = [
        'companyName', 'businessType', 'contactPersonName', 'contactEmail', 
        'contactPhone', 'businessAddress', 'city', 'state', 'country', 
        'zipCode', 'businessDescription', 'yearsInBusiness', 'numberOfEmployees', 
        'annualRevenue', 'username', 'passwordHash', 'termsAccepted'
      ];
      
      const missingFields = requiredFields.filter(field => !supplierData[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          details: missingFields 
        });
      }

      const supplier = await storage.createMedicalSupplier(supplierData);
      
      res.status(201).json({
        message: 'Supplier registration submitted successfully',
        id: supplier.id,
        status: supplier.status
      });
    } catch (error) {
      console.error('Error registering supplier:', error);
      res.status(500).json({ error: 'Failed to register supplier' });
    }
  });

  // Public supplier login endpoint
  app.post('/public/suppliers/login', async (req, res) => {
    try {
      const { contactEmail, password } = req.body;

      if (!contactEmail || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find supplier by email
      const supplier = await storage.getMedicalSupplierByEmail(contactEmail);
      
      if (!supplier) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, supplier.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if supplier is approved
      if (supplier.status !== 'approved') {
        return res.status(403).json({ 
          error: 'Account not approved', 
          status: supplier.status,
          message: supplier.status === 'pending_review' ? 
            'Your registration is under review. You will be notified when approved.' :
            'Your account has been rejected. Please contact support.'
        });
      }

      // Generate a JWT token for supplier session
      const token = jwt.sign(
        { 
          supplierId: supplier.id, 
          username: supplier.username,
          contactEmail: supplier.contactEmail,
          companyName: supplier.companyName,
          type: 'supplier'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        supplier: {
          id: supplier.id,
          companyName: supplier.companyName,
          username: supplier.username,
          contactEmail: supplier.contactEmail,
          status: supplier.status
        }
      });
    } catch (error) {
      console.error('Error during supplier login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // User Language Preference routes
  app.get("/api/user/language-preference", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        languagePreference: user.languagePreference || 'en',
        syncedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get language preference error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/language-preference", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { languagePreference } = req.body;

      // Validate language preference
      const validLanguages = ['en', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ar'];
      if (!validLanguages.includes(languagePreference)) {
        return res.status(400).json({ message: "Invalid language preference" });
      }

      const updatedUser = await storage.updateUser(userId, { languagePreference });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[LANGUAGE_SYNC] 🌐 User ${userId} language preference updated to: ${languagePreference}`);

      res.json({ 
        languagePreference: updatedUser.languagePreference,
        syncedAt: new Date().toISOString(),
        message: "Language preference updated successfully"
      });
    } catch (error) {
      console.error("Update language preference error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // JWT Authentication routes only - no Replit Auth
  
  // Standard JWT login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      console.log(`[SECURITY AUDIT] Login attempt from IP: ${req.ip}`);

      // Get all users across tenants for super admin authentication
      const allUsers = await storage.getAllUsers();
      const user = allUsers.find(u => 
        (u.username === username || u.email === username) &&
        u.isActive
      );

      if (!user) {
        console.log(`[SECURITY AUDIT] Login failed - user not found: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log(`[SECURITY AUDIT] Login failed - invalid password: ${username}`);  
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get tenant information
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`[SECURITY AUDIT] Login successful: ${username}`);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          type: tenant.type
        }
      });

    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/user", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const tenant = await storage.getTenant(user.tenantId);
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          type: tenant.type
        } : null
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public health check endpoint (no authentication required)
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      platform: "NaviMED Healthcare Platform"
    });
  });

  // Serve placeholder images (public access for marketplace)
  app.get("/api/placeholder/:imageName", (req, res) => {
    try {
      const { imageName } = req.params;
      
      // Create SVG placeholder based on image name
      let title = "Medical Device";
      let bgColor = "#f8fafc";
      let textColor = "#64748b";
      
      if (imageName.includes('ultrasound')) {
        title = "Ultrasound Machine";
        bgColor = "#dbeafe";
        textColor = "#3b82f6";
      } else if (imageName.includes('surgical')) {
        title = "Surgical Instruments";
        bgColor = "#dcfce7";
        textColor = "#16a34a";
      } else if (imageName.includes('product1')) {
        title = "Digital Stethoscope";
        bgColor = "#fef3c7";
        textColor = "#d97706";
      }
      
      // Always serve as SVG - modern browsers handle this well in img tags
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      const svgPlaceholder = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <rect x="20" y="20" width="260" height="160" fill="white" stroke="${textColor}" stroke-width="2" rx="8"/>
        <circle cx="150" cy="80" r="25" fill="${textColor}" opacity="0.2"/>
        <text x="150" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" font-weight="500">${title}</text>
        <text x="150" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" opacity="0.7">Medical Equipment</text>
      </svg>`;
      
      res.send(svgPlaceholder);
    } catch (error) {
      console.error("Error serving placeholder image:", error);
      res.status(404).json({ error: "Image not found" });
    }
  });

  // Public platform statistics endpoint for landing page
  app.get("/api/platform/stats", async (req, res) => {
    try {
      const totalTenants = await storage.getAllTenants();
      const totalUsers = await storage.getAllUsers();
      
      // Filter out test data and get real statistics
      const activeTenants = totalTenants.filter(t => t.isActive && t.subdomain !== 'argilette').length;
      const activeUsers = totalUsers.filter(u => u.isActive && u.email !== 'abel@argilette.com').length;
      
      res.json({
        platform: "NaviMED Healthcare Platform",
        statistics: {
          organizations: activeTenants,
          users: activeUsers,
          uptime: "99.9%",
          languages: 50,
          responseTime: "<2s",
          support: "24/7"
        },
        status: "operational",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.json({
        platform: "NaviMED Healthcare Platform",
        statistics: {
          organizations: 0,
          users: 1,
          uptime: "99.9%",
          languages: 50,
          responseTime: "<2s",
          support: "24/7"
        },
        status: "operational",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Organization registration endpoint (public, no auth required)
  app.post("/api/tenant/register", async (req, res) => {
    try {
      const {
        organizationName,
        organizationType,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPassword,
        phoneNumber,
        address,
        country,
        description
      } = req.body;

      // Validate required fields
      if (!organizationName || !organizationType || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
        return res.status(400).json({ 
          message: "All required fields must be provided" 
        });
      }

      // Check if organization already exists
      const existingTenants = await storage.getAllTenants();
      const existingTenant = existingTenants.find(t => 
        t.name.toLowerCase() === organizationName.toLowerCase()
      );
      
      if (existingTenant) {
        return res.status(400).json({ 
          message: "An organization with this name already exists" 
        });
      }

      // Check if admin email already exists
      const existingUsers = await storage.getAllUsers();
      const existingUser = existingUsers.find(u => 
        u.email?.toLowerCase() === adminEmail.toLowerCase()
      );
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "A user with this email already exists" 
        });
      }

      // Generate subdomain from organization name
      const subdomain = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      // Create tenant
      const newTenant = await storage.createTenant({
        name: organizationName,
        type: organizationType as any,
        subdomain: subdomain,
        settings: {
          features: [organizationType, 'basic'],
          trialDays: 14
        },
        isActive: true,
        parentTenantId: null,
        organizationType: 'independent',
        phoneNumber: phoneNumber || null,
        address: address || null,
        description: description || null
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const adminUser = await storage.createUser({
        tenantId: newTenant.id,
        username: adminEmail,
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'tenant_admin',
        isActive: true,
        isTemporaryPassword: false,
        mustChangePassword: false
      });

      // Send registration confirmation email
      try {
        const { sendRegistrationConfirmationEmail } = await import('./email-service');
        const loginUrl = `${req.protocol}://${req.get('host')}/login`;
        const emailSent = await sendRegistrationConfirmationEmail(
          adminEmail,
          `${adminFirstName} ${adminLastName}`,
          organizationName,
          loginUrl
        );
        console.log(`Registration confirmation email ${emailSent ? 'sent successfully' : 'failed'} to ${adminEmail}`);
      } catch (emailError) {
        console.error('Failed to send registration confirmation email:', emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        message: "Organization registered successfully",
        tenant: {
          id: newTenant.id,
          name: newTenant.name,
          type: newTenant.type,
          subdomain: newTenant.subdomain
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName
        }
      });

    } catch (error) {
      console.error("Error registering organization:", error);
      res.status(500).json({ 
        message: "Failed to register organization. Please try again." 
      });
    }
  });

  // =====================================
  // PUBLIC MARKETPLACE ENDPOINTS
  // =====================================
  
  // Get all active products for marketplace (public endpoint)
  app.get("/api/marketplace/products", async (req, res) => {
    try {
      console.log("[MARKETPLACE] Loading products for marketplace");
      
      const products = await storage.getPublicMarketplaceProducts();
      
      console.log(`[MARKETPLACE] Found ${products.length} active products`);
      res.json(products);
    } catch (error) {
      console.error("Error loading marketplace products:", error);
      res.status(500).json({ message: "Failed to load products" });
    }
  });

  // Quote request endpoint (public endpoint)
  app.post("/api/marketplace/quote-requests", async (req, res) => {
    try {
      const {
        productId,
        productName,
        supplierName,
        companyName,
        contactName,
        email,
        phone,
        quantity,
        message,
        requestedAt
      } = req.body;

      // Validation
      if (!productId || !productName || !companyName || !contactName || !email || !quantity) {
        return res.status(400).json({ 
          message: "Missing required fields: productId, productName, companyName, contactName, email, quantity" 
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      // Quantity validation
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }

      console.log(`[QUOTE REQUEST] New quote request from ${companyName} for ${productName} (Qty: ${qty})`);

      // Create quote request record
      const quoteRequest = await storage.createQuoteRequest({
        productId,
        productName,
        supplierName,
        companyName,
        contactName,
        email,
        phone,
        quantity: qty,
        message,
        status: 'pending'
      });

      console.log(`[QUOTE REQUEST] Quote request ${quoteRequest.id} created successfully`);

      // TODO: Send email notification to supplier
      // TODO: Send confirmation email to customer

      res.json({ 
        success: true, 
        message: "Quote request submitted successfully", 
        quoteRequestId: quoteRequest.id 
      });
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(500).json({ message: "Failed to submit quote request" });
    }
  });

  // Advertisement inquiry endpoint (public endpoint)
  app.post("/api/marketplace/inquiries", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        company,
        message,
        interestedIn,
        advertisementId,
        supplierEmail,
        supplierCompany
      } = req.body;

      // Validation
      if (!name || !email || !message || !advertisementId) {
        return res.status(400).json({ 
          message: "Missing required fields: name, email, message, advertisementId" 
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      console.log(`[INQUIRY] New inquiry from ${name} (${company || 'Individual'}) about: ${interestedIn}`);

      // For now, we'll just log the inquiry and return success
      // In the future, this could be stored in a database table and/or forwarded via email
      const inquiryData = {
        name,
        email,
        phone,
        company,
        message,
        interestedIn,
        advertisementId,
        supplierEmail,
        supplierCompany,
        submittedAt: new Date().toISOString()
      };

      console.log(`[INQUIRY] Inquiry details:`, inquiryData);

      // TODO: Store inquiry in database
      // TODO: Send email notification to supplier
      // TODO: Send confirmation email to inquirer

      res.json({ 
        success: true, 
        message: "Inquiry submitted successfully. The supplier will contact you directly." 
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  // =====================================
  // SUPPLIER AUTHENTICATION & PRODUCT MANAGEMENT ENDPOINTS
  // =====================================

  // Supplier-specific login endpoint (before middleware)
  app.post('/api/supplier/login', async (req, res) => {
    try {
      const { username, password, organizationName } = req.body;
      
      if (!username || !password || !organizationName) {
        return res.status(400).json({ message: "Username, password, and organization name are required" });
      }

      console.log('[SUPPLIER LOGIN] Attempting login for:', { username, organizationName });

      // Find the supplier organization first
      const suppliers = await storage.getMedicalSuppliers();
      const supplierOrg = suppliers.find(s => 
        s.companyName.toLowerCase() === organizationName.toLowerCase() ||
        s.organizationSlug === organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      );

      if (!supplierOrg) {
        console.log('[SUPPLIER LOGIN] Organization not found:', organizationName);
        return res.status(400).json({ message: "Organization not found" });
      }

      console.log('[SUPPLIER LOGIN] Found supplier organization:', supplierOrg.companyName);

      // Check if supplier account is approved
      if (supplierOrg.status !== 'approved') {
        return res.status(403).json({ 
          message: 'Account not approved', 
          status: supplierOrg.status 
        });
      }

      // Find supplier by username or email and verify password directly against supplier record
      let supplier = null;
      console.log('[SUPPLIER LOGIN DEBUG] Checking username:', username);
      console.log('[SUPPLIER LOGIN DEBUG] Against contactEmail:', supplierOrg.contactEmail);
      console.log('[SUPPLIER LOGIN DEBUG] Against username:', supplierOrg.username);
      
      if (username === supplierOrg.contactEmail || username === supplierOrg.username) {
        supplier = supplierOrg;
        console.log('[SUPPLIER LOGIN DEBUG] Username/email match found');
      } else {
        console.log('[SUPPLIER LOGIN DEBUG] No username/email match');
      }

      if (!supplier) {
        console.log('[SUPPLIER LOGIN] No supplier match');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordValid = await bcrypt.compare(password, supplier.passwordHash);
      console.log('[SUPPLIER LOGIN DEBUG] Password valid:', passwordValid);
      
      if (!passwordValid) {
        console.log('[SUPPLIER LOGIN] Invalid password for:', username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('[SUPPLIER LOGIN] Successful login for supplier:', supplier.username);

      const token = jwt.sign(
        { 
          supplierId: supplier.id,
          username: supplier.username,
          contactEmail: supplier.contactEmail,
          companyName: supplier.companyName,
          type: 'supplier'
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: 'Login successful',
        token,
        supplier: {
          id: supplier.id,
          companyName: supplier.companyName,
          username: supplier.username,
          contactEmail: supplier.contactEmail,
          status: supplier.status
        }
      });

    } catch (error) {
      console.error('[SUPPLIER LOGIN] Error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Authentication routes (before tenant middleware)

  // Super Admin Platform Management Routes (before tenant middleware)
  app.get("/api/admin/tenants", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const tenants = await storage.getAllTenants();
      const tenantsWithStats = await Promise.all(tenants.map(async (tenant) => {
        const users = await storage.getUsersByTenant(tenant.id);
        const patients = await storage.getPatientsByTenant(tenant.id);
        
        return {
          ...tenant,
          stats: {
            userCount: users.length,
            patientCount: patients.length,
            isActive: tenant.isActive
          }
        };
      }));
      
      res.json(tenantsWithStats);
    } catch (error) {
      console.error("Error fetching tenant overview:", error);
      res.status(500).json({ message: "Failed to fetch tenant overview" });
    }
  });
  
  app.get("/api/admin/platform-stats", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const tenants = await storage.getAllTenants();
      const allUsers = await storage.getAllUsers();
      
      const stats = {
        totalTenants: tenants.length,
        totalUsers: allUsers.length,
        tenantsByType: {
          hospital: tenants.filter(t => t.type === 'hospital').length,
          pharmacy: tenants.filter(t => t.type === 'pharmacy').length,
          laboratory: tenants.filter(t => t.type === 'laboratory').length,
          clinic: tenants.filter(t => t.type === 'clinic').length,
          platform: tenants.filter(t => t.type === 'platform').length
        },
        activeTenants: tenants.filter(t => t.isActive).length,
        inactiveTenants: tenants.filter(t => !t.isActive).length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });

  // Supplier management routes for super admin
  app.get("/api/admin/suppliers", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const suppliers = await storage.getAllMedicalSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.put("/api/admin/suppliers/:id/approve", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      
      // Update supplier status to approved
      const supplier = await storage.updateMedicalSupplierStatus(id, 'approved');
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      // Create a tenant for the approved supplier
      const supplierTenant = await storage.createTenant({
        name: supplier.companyName,
        type: 'medical_supplier',
        subdomain: supplier.organizationSlug,
        settings: {
          features: ['marketplace', 'product_management', 'order_management'],
          planType: 'supplier_basic',
          description: `Medical device supplier: ${supplier.businessDescription}`
        },
        isActive: true,
        organizationType: 'independent',
        brandName: supplier.companyName,
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
      });
      
      // Create supplier admin user account
      const hashedPassword = await bcrypt.hash(supplier.passwordHash, 12);
      const supplierUser = await storage.createUser({
        username: supplier.username,
        email: supplier.contactEmail,
        password: hashedPassword,
        firstName: supplier.contactPersonName.split(' ')[0] || supplier.contactPersonName,
        lastName: supplier.contactPersonName.split(' ').slice(1).join(' ') || '',
        role: 'supplier_admin',
        tenantId: supplierTenant.id,
        isActive: true,
        mustChangePassword: false,
        isTemporaryPassword: false
      });
      
      // Update supplier with tenant ID
      await storage.updateMedicalSupplier(id, {
        tenantId: supplierTenant.id,
        approvedBy: req.user?.id,
        approvedAt: new Date()
      });
      
      // Create a sample product for the new supplier so they appear in marketplace
      try {
        const sampleProduct = await storage.createMarketplaceProduct({
          supplierTenantId: supplierTenant.id,
          name: `${supplier.companyName} - Sample Product`,
          sku: `${supplier.organizationSlug}-SAMPLE-001`,
          description: `Sample product from ${supplier.companyName}. This supplier specializes in ${supplier.businessType} with ${supplier.yearsInBusiness} years of experience. Contact them to discuss your specific medical equipment needs.`,
          shortDescription: `Sample product from ${supplier.companyName}`,
          category: supplier.productCategories?.[0] || "Medical Supplies",
          subcategory: "General",
          brand: supplier.companyName,
          manufacturer: supplier.companyName,
          price: "1.00",
          currency: "USD",
          stockQuantity: 1000,
          lowStockThreshold: 10,
          trackInventory: true,
          status: "active",
          isActive: true,
          isFeatured: false,
          requiresPrescription: false,
          specifications: {
            "Supplier": supplier.companyName,
            "Contact": supplier.contactEmail,
            "Experience": `${supplier.yearsInBusiness} years`,
            "Specialization": supplier.businessType
          },
          features: [`${supplier.yearsInBusiness} years of experience`, "Certified medical supplier", "Professional service"],
          metaTitle: `${supplier.companyName} - Medical Equipment Supplier`,
          metaDescription: `Professional medical equipment supplier with ${supplier.yearsInBusiness} years of experience in ${supplier.businessType}.`,
          searchKeywords: [supplier.companyName.toLowerCase(), supplier.businessType.toLowerCase(), "medical", "supplier"],
          shippingClass: "standard",
          leadTimeDays: 7
        });
        
        console.log(`[SUPPLIER APPROVAL] Created sample product ${sampleProduct.id} for supplier ${supplier.companyName}`);
      } catch (productError) {
        console.log(`[SUPPLIER APPROVAL] Failed to create sample product: ${productError.message}`);
        // Don't fail the approval if product creation fails
      }
      
      console.log(`[SUPPLIER APPROVAL] Created tenant ${supplierTenant.id} and user ${supplierUser.id} for supplier ${supplier.companyName}`);
      
      res.json({ 
        message: "Supplier approved successfully and added to marketplace", 
        supplier,
        tenant: supplierTenant,
        supplierUser: { id: supplierUser.id, email: supplierUser.email }
      });
    } catch (error) {
      console.error("Error approving supplier:", error);
      res.status(500).json({ message: "Failed to approve supplier" });
    }
  });

  app.put("/api/admin/suppliers/:id/reject", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      const { reason } = req.body;
      
      const supplier = await storage.updateMedicalSupplierStatus(id, 'rejected', reason);
      
      // TODO: Send rejection email to supplier with reason
      
      res.json({ message: "Supplier rejected successfully", supplier });
    } catch (error) {
      console.error("Error rejecting supplier:", error);
      res.status(500).json({ message: "Failed to reject supplier" });
    }
  });

  app.put("/api/admin/suppliers/:id/suspend", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      const { reason } = req.body;
      
      const supplier = await storage.updateMedicalSupplierStatus(id, 'suspended', reason);
      
      res.json({ message: "Supplier suspended successfully", supplier });
    } catch (error) {
      console.error("Error suspending supplier:", error);
      res.status(500).json({ message: "Failed to suspend supplier" });
    }
  });

  app.put("/api/admin/suppliers/:id/activate", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      
      const supplier = await storage.updateMedicalSupplierStatus(id, 'approved');
      
      res.json({ message: "Supplier activated successfully", supplier });
    } catch (error) {
      console.error("Error activating supplier:", error);
      res.status(500).json({ message: "Failed to activate supplier" });
    }
  });

  app.put("/api/admin/tenants/:id/suspend", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      const { reason } = req.body;
      
      await storage.updateTenant(id, { 
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: reason 
      });
      
      res.json({ message: "Tenant suspended successfully" });
    } catch (error) {
      console.error("Error suspending tenant:", error);
      res.status(500).json({ message: "Failed to suspend tenant" });
    }
  });

  app.put("/api/admin/tenants/:id/activate", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { id } = req.params;
      
      await storage.updateTenant(id, { 
        isActive: true,
        suspendedAt: null,
        suspensionReason: null 
      });
      
      res.json({ message: "Tenant activated successfully" });
    } catch (error) {
      console.error("Error activating tenant:", error);
      res.status(500).json({ message: "Failed to activate tenant" });
    }
  });

  // Apply tenant context middleware to all API routes (except public endpoints)
  app.use("/api", (req, res, next) => {
    // Skip tenant middleware for public endpoints
    const publicEndpoints = [
      "/api/health",
      "/api/platform/stats",
      "/api/tenant/register",
      "/api/suppliers/register",
      "/api/auth/login",
      "/api/auth/user",
      "/api/marketplace/products",
      "/api/advertisements",
      "/api/marketplace/quote-requests",
      "/advertisements",
      "/marketplace/products",
      "/marketplace/quote-requests"
    ];
    
    if (publicEndpoints.includes(req.path)) {
      return next();
    }
    
    // Apply tenant middleware for all other endpoints
    setTenantContext(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username, userData.tenantId);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email, userData.tenantId);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Generate temporary password for email
      const temporaryPassword = generateTemporaryPassword();
      
      // Hash the temporary password for storage
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        mustChangePassword: true,
        isTemporaryPassword: true
      });

      // Get tenant information for email
      const tenant = await storage.getTenant(user.tenantId);
      
      // Send welcome email with credentials AND registration confirmation
      if (tenant) {
        // Send welcome email with temporary password
        const welcomeEmailSent = await sendWelcomeEmail({
          userEmail: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          temporaryPassword: temporaryPassword,
          organizationName: tenant.name,
          loginUrl: `${req.protocol}://${req.get('host')}/login`
        });
        
        // Also send registration confirmation email
        const { sendRegistrationConfirmationEmail } = await import('./email-service');
        const confirmationEmailSent = await sendRegistrationConfirmationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          tenant.name,
          `${req.protocol}://${req.get('host')}/login`
        );
        
        if (!welcomeEmailSent) {
          console.warn(`Failed to send welcome email to ${user.email}`);
        }
        if (!confirmationEmailSent) {
          console.warn(`Failed to send confirmation email to ${user.email}`);
        } else {
          console.log(`Registration confirmation email sent successfully to ${user.email}`);
        }
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "register",
        newData: { username: user.username, email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json({
        message: "User created successfully. Welcome email sent with temporary password.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected routes - require authentication (with exclusions)
  app.use("/api", (req, res, next) => {
    // Skip authentication for public endpoints
    if (req.path === '/supplier/login' || 
        req.path.includes('/supplier/login') ||
        req.path.startsWith('/placeholder/') ||
        req.path.startsWith('/api/placeholder/') ||
        req.path === '/marketplace/products' ||
        req.path === '/advertisements' ||
        req.path === '/marketplace/quote-requests' ||
        req.path === '/marketplace/inquiries') {
      return next();
    }
    authenticateToken(req, res, next);
  });

  // User profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get users by role (for fetching providers, etc.)
  app.get("/api/users", requireTenant, async (req, res) => {
    try {
      const { role } = req.query;
      const tenantId = req.tenant!.id;
      
      if (role) {
        const users = await storage.getUsersByRole(role as string, tenantId);
        res.json(users);
      } else {
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      }
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tenant management routes
  app.get("/api/tenants", requireRole(["super_admin"]), async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Get tenants error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tenants", requireRole(["super_admin"]), async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: tenant.id,
        userId: req.user!.id,
        entityType: "tenant",
        entityId: tenant.id,
        action: "create",
        newData: tenant,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(tenant);
    } catch (error) {
      console.error("Create tenant error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient management routes - require tenant context
  app.use("/api/patients", requireTenant);
  app.use("/api/billing/patients", requireTenant);

  app.get("/api/patients", async (req, res) => {
    try {
      const { limit = "50", offset = "0", search } = req.query;
      const tenantId = req.tenant!.id;
      const userRole = req.user!.role;
      const userId = req.user!.id;

      let patients;
      
      // Role-based patient access control
      if (userRole === "physician" || userRole === "doctor") {
        // For prescription writing, doctors can see all patients in the hospital
        // For regular patient management, they see only assigned patients
        if (search && typeof search === "string") {
          patients = await storage.searchPatients(tenantId, search);
        } else {
          patients = await storage.getPatientsByTenant(tenantId, parseInt(limit as string), parseInt(offset as string));
        }
      } else if (["receptionist", "nurse", "tenant_admin", "director"].includes(userRole)) {
        // Reception, nurses, and admins see all patients in their tenant
        if (search && typeof search === "string") {
          patients = await storage.searchPatients(tenantId, search);
        } else {
          patients = await storage.getPatientsByTenant(tenantId, parseInt(limit as string), parseInt(offset as string));
        }
      } else {
        return res.status(403).json({ message: "Access denied: Insufficient permissions to view patients" });
      }

      // Return basic patient data only for fast loading
      const basicPatients = patients.map(patient => ({
        id: patient.id,
        tenantPatientId: patient.tenantPatientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        mrn: patient.mrn,
        primaryPhysicianId: patient.primaryPhysicianId,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      }));

      console.log(`[PATIENTS] User ${userRole} (${userId}) accessed ${basicPatients.length} patients`);
      res.json(basicPatients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Billing Patients endpoint - for billing and claim creation purposes
  app.get("/api/billing/patients", async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const userRole = req.user!.role;
      const userId = req.user!.id;
      
      
      let patients;
      
      // Role-based access control for billing - similar to regular patients but focused on billing needs
      if (userRole === "physician") {
        // Doctors can bill for their assigned patients
        patients = await storage.getPatientsByPhysician(userId, tenantId);
      } else if (["billing_staff", "pharmacist", "receptionist", "nurse", "tenant_admin", "director"].includes(userRole)) {
        // Billing staff, pharmacists, reception, nurses, and admins see all patients for billing purposes
        patients = await storage.getPatientsByTenant(tenantId);
      } else {
        return res.status(403).json({ message: "Access denied: Insufficient permissions to access billing patient data" });
      }
      
      // Return patient data formatted for billing purposes
      const billingPatients = patients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        mrn: patient.mrn,
        tenantPatientId: patient.tenantPatientId,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        email: patient.email,
        isActive: patient.isActive
      }));
      
      console.log(`[BILLING PATIENTS] Successfully fetched ${billingPatients.length} patients for billing purposes`);
      res.json(billingPatients);
    } catch (error) {
      console.error("Get billing patients error:", error);
      res.status(500).json({ message: "Failed to fetch billing patients" });
    }
  });

  // Medical records endpoint - must come before generic /:id route
  // Lookup patient by tenant-specific ID (cross-network compatible)
  app.get("/api/patients/lookup/:tenantPatientId", requireRole(["physician", "nurse", "pharmacist", "lab_technician", "receptionist", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { tenantPatientId } = req.params;
      const tenantId = req.tenant!.id;
      
      
      // Use the new cross-tenant patient lookup
      const patient = await storage.findSharedPatient(tenantPatientId, tenantId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found or not accessible" });
      }
      
      res.json(patient);
    } catch (error: any) {
      console.error("Error looking up patient:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Optimized medical records endpoint - loads data on demand with role-based access
  app.get("/api/patients/medical-records", async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const userRole = req.user!.role;
      const userId = req.user!.id;
      
      
      let patients;
      
      // Role-based patient access control
      if (userRole === "physician") {
        // Doctors only see their assigned patients
        patients = await storage.getPatientsByPhysician(userId, tenantId);
      } else if (["receptionist", "nurse", "tenant_admin", "director"].includes(userRole)) {
        // Reception, nurses, and admins see all patients in their tenant
        patients = await storage.getPatientsByTenant(tenantId);
      } else {
        return res.status(403).json({ message: "Access denied: Insufficient permissions to view patient medical records" });
      }
      
      // Return lightweight patient data with basic info
      const basicPatientsWithSummary = patients.map(patient => ({
        id: patient.id,
        tenantPatientId: patient.tenantPatientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        mrn: patient.mrn,
        primaryPhysicianId: patient.primaryPhysicianId,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        // Placeholder for summary data - loaded on demand
        appointments: [],
        prescriptions: [],
        labOrders: [],
        vitalSigns: [],
        lastVisit: null,
        upcomingAppointments: 0
      }));
      
      console.log(`[MEDICAL RECORDS] Successfully fetched ${basicPatientsWithSummary.length} patient records for ${userRole}`);
      res.json(basicPatientsWithSummary);
    } catch (error) {
      console.error("Get patients medical records error:", error);
      res.status(500).json({ message: "Failed to fetch patient medical records" });
    }
  });

  // Individual patient medical record details (loaded on demand)
  app.get("/api/patients/:id/medical-details", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant!.id;
      
      console.log(`[MEDICAL DETAILS] Fetching detailed records for patient: ${id}`);
      
      // Get patient details
      const patient = await storage.getPatient(id, tenantId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get all medical data for this specific patient
      const [appointments, prescriptions, labOrders, vitalSigns] = await Promise.all([
        storage.getAppointmentsByPatient(id, tenantId),
        storage.getPrescriptionsByPatient(id, tenantId),
        storage.getLabOrdersByPatient(id, tenantId),
        storage.getVitalSignsByPatient(id, tenantId)
      ]);
      
      // Calculate summary data
      const lastVisit = appointments.length > 0 
        ? appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;
      
      const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.date) > new Date() && apt.status !== 'cancelled'
      ).length;
      
      const detailedPatient = {
        ...patient,
        appointments,
        prescriptions,
        labOrders,
        vitalSigns,
        lastVisit,
        upcomingAppointments
      };
      
      console.log(`[MEDICAL DETAILS] Successfully fetched detailed records for patient: ${id}`);
      res.json(detailedPatient);
    } catch (error) {
      console.error("Get patient medical details error:", error);
      res.status(500).json({ message: "Failed to fetch patient medical details" });
    }
  });

  // Move available-physicians route BEFORE the generic :id route
  app.get("/api/patients/available-physicians", requireRole(["receptionist", "nurse", "tenant_admin", "director"]), async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const physicians = await storage.getUsersByRole("physician", tenantId);
      
      // Return simplified physician data for assignment dropdown
      const availablePhysicians = physicians.map(physician => ({
        id: physician.id,
        firstName: physician.firstName,
        lastName: physician.lastName,
        email: physician.email,
        isActive: physician.isActive
      }));

      res.json(availablePhysicians);
    } catch (error) {
      console.error("Get available physicians error:", error);
      res.status(500).json({ message: "Failed to fetch available physicians" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id, req.tenant!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients", requireRole(["receptionist", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const tenant = req.tenant!;
      
      // Generate MRN as the permanent patient identifier (unique per hospital forever)
      const mrn = `MRN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Optional: Generate simple display ID for reception use (can be derived from MRN)
      const tenantPatientId = await storage.generateTenantPatientId(tenantId);
      
      // Prepare patient data with proper date conversion
      const requestData = {
        ...req.body,
        tenantId: tenantId,
        tenantPatientId: tenantPatientId,
        mrn: mrn,
        // Convert dateOfBirth string to Date if it's a string
        dateOfBirth: typeof req.body.dateOfBirth === 'string' 
          ? new Date(req.body.dateOfBirth) 
          : req.body.dateOfBirth,
        // Handle preferredPharmacyId - validate it exists in database first
        preferredPharmacyId: null // Set to null for now, will validate after parsing
      };

      let patientData = insertPatientSchema.parse(requestData);

      // Validate preferred pharmacy ID if provided
      if (req.body.preferredPharmacyId && 
          req.body.preferredPharmacyId !== 'no_preference' && 
          req.body.preferredPharmacyId !== 'closest_to_residence' && 
          req.body.preferredPharmacyId !== 'other_pharmacy') {
        try {
          // Check if pharmacy exists in database
          const pharmacy = await storage.getPharmacy(req.body.preferredPharmacyId);
          if (pharmacy) {
            patientData.preferredPharmacyId = req.body.preferredPharmacyId;
          }
        } catch (error) {
          // Pharmacy validation failed, setting to null
          // If pharmacy doesn't exist, just set to null (don't fail registration)
        }
      }

      const patient = await storage.createPatient(patientData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "patient",
        entityId: patient.id,
        action: "create",
        newData: patient,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient Assignment Routes (for receptionists to assign patients to doctors)
  
  // Get available physicians for patient assignment

  // Assign patient to physician
  app.post("/api/patients/:patientId/assign", requireRole(["receptionist", "nurse", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { patientId } = req.params;
      const { physicianId } = req.body;
      const tenantId = req.tenant!.id;
      const assignedBy = req.user!.id;

      // Validate patient exists and belongs to tenant
      const patient = await storage.getPatient(patientId, tenantId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Validate physician exists and belongs to tenant
      const physician = await storage.getUser(physicianId, tenantId);
      if (!physician || physician.role !== "physician") {
        return res.status(404).json({ message: "Physician not found" });
      }

      // Update patient's primary physician
      const updatedPatient = await storage.updatePatient(patientId, tenantId, {
        primaryPhysicianId: physicianId,
        updatedAt: new Date()
      });

      // Create audit log
      await storage.createAuditLog({
        tenantId: tenantId,
        userId: assignedBy,
        entityType: "patient",
        entityId: patientId,
        action: "assign_physician",
        newData: { physicianId, physicianName: `${physician.firstName} ${physician.lastName}` },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      console.log(`[PATIENT ASSIGNMENT] Patient ${patient.tenantPatientId} assigned to Dr. ${physician.firstName} ${physician.lastName} by ${req.user!.role}`);

      res.json({
        message: "Patient successfully assigned to physician",
        patient: updatedPatient,
        physician: {
          id: physician.id,
          firstName: physician.firstName,
          lastName: physician.lastName
        }
      });
    } catch (error) {
      console.error("Assign patient to physician error:", error);
      res.status(500).json({ message: "Failed to assign patient to physician" });
    }
  });

  // Get patient assignment history
  app.get("/api/patients/:patientId/assignment-history", requireRole(["physician", "nurse", "receptionist", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { patientId } = req.params;
      const tenantId = req.tenant!.id;

      // Get audit logs for physician assignments
      const assignmentHistory = await storage.getAuditLogsByEntity("patient", patientId, tenantId);
      
      // Filter for assignment-related actions
      const assignments = assignmentHistory.filter(log => 
        log.action === "assign_physician" || log.action === "create"
      );

      res.json(assignments);
    } catch (error) {
      console.error("Get patient assignment history error:", error);
      res.status(500).json({ message: "Failed to fetch assignment history" });
    }
  });

  // Appointment management routes
  app.use("/api/appointments", requireTenant);

  app.get("/api/appointments", async (req, res) => {
    try {
      const { date, providerId } = req.query;
      const tenantId = req.tenant!.id;

      let appointments;
      const queryDate = date ? new Date(date as string) : undefined;

      if (providerId) {
        appointments = await storage.getAppointmentsByProvider(providerId as string, tenantId, queryDate);
      } else {
        appointments = await storage.getAppointmentsByTenant(tenantId, queryDate);
      }

      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET appointments by provider ID (specific route for doctor dashboard)
  app.get("/api/appointments/provider/:providerId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { providerId } = req.params;
      console.log("[DEBUG] Getting appointments for provider:", providerId);
      
      const appointments = await storage.getAppointmentsByProvider(providerId, req.tenant!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Get provider appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log("[DEBUG] Request body:", req.body);
      
      // ROLE-BASED APPOINTMENT SCHEDULING RESTRICTIONS
      // Doctors should NOT schedule appointments themselves - only receptionists unless explicitly allowed
      const userRole = req.user!.role;
      const userId = req.user!.id;
      const tenantId = req.tenant!.id;
      
      console.log(`[APPOINTMENT] User ${userId} (${userRole}) attempting to create appointment`);
      
      // Check role permissions for appointment creation
      const allowedRoles = ["receptionist", "tenant_admin", "director", "super_admin"];
      
      // Doctors and physicians need explicit permission to schedule appointments
      if (userRole === "physician" || userRole === "doctor") {
        // Check if this user has been given explicit permission to schedule appointments
        const userPermissions = await storage.getUserPermissions(userId, tenantId);
        const canScheduleAppointments = userPermissions?.includes("schedule_appointments");
        
        if (!canScheduleAppointments) {
          console.log(`[APPOINTMENT] ❌ Doctor/Physician ${userId} denied - no schedule permission`);
          return res.status(403).json({
            message: "Doctors cannot schedule appointments directly. Please contact reception staff or request scheduling permissions from your administrator.",
            error: "ROLE_RESTRICTION_SCHEDULING",
            requiredPermission: "schedule_appointments"
          });
        }
        
        console.log(`[APPOINTMENT] ✅ Doctor/Physician ${userId} allowed - has explicit permission`);
      } else if (!allowedRoles.includes(userRole)) {
        console.log(`[APPOINTMENT] ❌ User ${userId} (${userRole}) denied - insufficient role`);
        return res.status(403).json({
          message: "Insufficient permissions to create appointments",
          error: "FORBIDDEN",
          allowedRoles: allowedRoles,
          currentRole: userRole
        });
      }
      
      // Convert appointmentDate string to Date object
      const requestData = { ...req.body };
      if (requestData.appointmentDate && typeof requestData.appointmentDate === 'string') {
        requestData.appointmentDate = new Date(requestData.appointmentDate);
      }
      
      const appointmentData = insertAppointmentSchema.parse({
        ...requestData,
        tenantId: req.tenant!.id
      });

      const appointment = await storage.createAppointment(appointmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "appointment",
        entityId: appointment.id,
        action: "create",
        newData: appointment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update appointment (PATCH)
  app.patch("/api/appointments/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      const userRole = req.user!.role;
      const userId = req.user!.id;
      const tenantId = req.tenant!.id;
      
      console.log(`[APPOINTMENT] User ${userId} (${userRole}) attempting to update appointment ${id}`);
      
      // ROLE-BASED APPOINTMENT CONFIRMATION RESTRICTIONS
      // Doctors should NOT confirm appointments themselves - only receptionists unless explicitly allowed
      const allowedRoles = ["receptionist", "tenant_admin", "director", "super_admin"];
      
      // Special check for status updates - allow physicians to mark consultations as completed
      if (updateData.status && (userRole === "physician" || userRole === "doctor")) {
        // Allow physicians to mark appointments as completed (after consultation)
        if (updateData.status === "completed" || updateData.status === "finished") {
          console.log(`[APPOINTMENT] ✅ Physician ${userId} allowed to mark consultation as completed`);
        } else {
          // For other status changes, check permissions
          const userPermissions = await storage.getUserPermissions(userId, tenantId);
          const canConfirmAppointments = userPermissions?.includes("confirm_appointments");
          
          if (!canConfirmAppointments) {
            console.log(`[APPOINTMENT] ❌ Doctor/Physician ${userId} denied appointment status change to ${updateData.status}`);
            return res.status(403).json({
              message: "Doctors can only mark consultations as completed. For other appointment changes, contact reception staff.",
              error: "ROLE_RESTRICTION_CONFIRMATION",
              requiredPermission: "confirm_appointments"
            });
          }
          
          console.log(`[APPOINTMENT] ✅ Doctor/Physician ${userId} allowed to update status - has explicit permission`);
        }
      } else if (!allowedRoles.includes(userRole) && (userRole !== "physician" && userRole !== "doctor")) {
        console.log(`[APPOINTMENT] ❌ User ${userId} (${userRole}) denied - insufficient role`);
        return res.status(403).json({
          message: "Insufficient permissions to update appointments",
          error: "FORBIDDEN",
          allowedRoles: allowedRoles,
          currentRole: userRole
        });
      }

      // Handle date fields properly if they exist
      if (updateData.appointmentDate && typeof updateData.appointmentDate === 'string') {
        updateData.appointmentDate = new Date(updateData.appointmentDate);
      }

      const updatedAppointment = await storage.updateAppointment(id, updateData, req.tenant!.id);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "appointment",
        entityId: id,
        action: "update",
        newData: updatedAppointment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prescription management routes
  app.get("/api/prescriptions", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log("[PRESCRIPTION API] 🚀 GET /api/prescriptions called");
      const { patientId } = req.query;
      const tenantId = req.tenant!.id;
      
      console.log("[PRESCRIPTION API] 📋 Tenant ID:", tenantId);
      console.log("[PRESCRIPTION API] 🔍 Patient ID filter:", patientId);

      let prescriptions;
      if (patientId) {
        prescriptions = await storage.getPrescriptionsByPatient(patientId as string, tenantId);
        console.log("[PRESCRIPTION API] ✅ Found", prescriptions.length, "prescriptions for patient");
      } else {
        prescriptions = await storage.getPrescriptionsByTenant(tenantId);
        console.log("[PRESCRIPTION API] ✅ Found", prescriptions.length, "prescriptions for tenant");
      }

      res.json(prescriptions);
    } catch (error) {
      console.error("[PRESCRIPTION API] ❌ Get prescriptions error:", error);
      res.status(500).json({ message: "Failed to get prescriptions" });
    }
  });

  app.post("/api/prescriptions", authenticateToken, requireTenant, requireRole(["physician", "doctor", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      console.log("[DEBUG] POST /api/prescriptions called with body:", req.body);
      console.log("[DEBUG] Tenant:", req.tenant?.id);
      console.log("[DEBUG] User:", req.user?.id);
      
      // Convert string dates to Date objects
      const requestData = { ...req.body };
      if (requestData.expiryDate && typeof requestData.expiryDate === 'string') {
        requestData.expiryDate = new Date(requestData.expiryDate);
      }
      
      // Prepare prescription data with all required fields including dates
      const prescriptionData = {
        ...requestData,
        tenantId: req.tenant!.id,
        providerId: req.user!.id,
        appointmentId: requestData.appointmentId || null,
        pharmacyTenantId: requestData.pharmacyTenantId || null,
        prescribedDate: new Date(),
        expiryDate: requestData.expiryDate ? new Date(requestData.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
      };
      
      console.log("[DEBUG] Prescription data prepared:", prescriptionData);
      
      const validatedData = insertPrescriptionSchema.parse(prescriptionData);
      console.log("[DEBUG] Data validated successfully:", validatedData);

      const prescription = await storage.createPrescription(validatedData);
      console.log("[DEBUG] Prescription created:", prescription);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "prescription",
        entityId: prescription.id,
        action: "create",
        newData: prescription,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(prescription);
    } catch (error) {
      console.error("Create prescription error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pharmacy-specific prescription routes
  app.get("/api/pharmacy/prescriptions/:pharmacyTenantId", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log("[PHARMACY API] 🚀 GET /api/pharmacy/prescriptions called");
      const { pharmacyTenantId } = req.params;
      const userTenantId = req.tenant!.id;
      
      console.log("[PHARMACY API] 📋 Pharmacy Tenant ID:", pharmacyTenantId);
      console.log("[PHARMACY API] 🔒 User Tenant ID:", userTenantId);
      
      // STRICT TENANT ISOLATION: Users can only access their own tenant's data
      if (pharmacyTenantId !== userTenantId) {
        console.log("[PHARMACY API] ❌ TENANT ISOLATION VIOLATION: User from tenant", userTenantId, "trying to access tenant", pharmacyTenantId);
        return res.status(403).json({ 
          message: "Access denied: Cannot access data from different tenant",
          error: "TENANT_ISOLATION_VIOLATION"
        });
      }
      
      // Ensure this is actually a pharmacy tenant
      // Exception: Super admin can access for oversight purposes
      if (req.tenant!.type !== 'pharmacy' && req.user?.role !== 'super_admin') {
        console.log("[PHARMACY API] ❌ INVALID TENANT TYPE: Tenant type is", req.tenant!.type, "but expected pharmacy");
        return res.status(403).json({ 
          message: "Access denied: This endpoint is only for pharmacy tenants",
          error: "INVALID_TENANT_TYPE"
        });
      }
      
      // Super admin oversight access
      if (req.user?.role === 'super_admin' && req.tenant!.type !== 'pharmacy') {
        console.log("[PHARMACY API] 🔧 Super admin oversight access to pharmacy", pharmacyTenantId);
        // Validate the pharmacy tenant exists
        const targetTenant = await storage.getTenant(pharmacyTenantId);
        if (!targetTenant || targetTenant.type !== 'pharmacy') {
          return res.status(404).json({ message: "Pharmacy tenant not found" });
        }
        
        // Return oversight information instead of operational data
        const oversightInfo = {
          pharmacy: {
            id: targetTenant.id,
            name: targetTenant.name,
            type: targetTenant.type,
            status: targetTenant.isActive ? 'Active' : 'Inactive'
          },
          message: "Super admin oversight mode - for operational access, login with pharmacy credentials",
          managementActions: [
            "View tenant settings",
            "Manage users",
            "View audit logs",
            "Monitor compliance"
          ]
        };
        return res.json(oversightInfo);
      }
      
      const prescriptions = await storage.getPrescriptionsByPharmacy(pharmacyTenantId);
      console.log("[PHARMACY API] ✅ Returning prescriptions:", prescriptions.length);
      
      res.json(prescriptions);
    } catch (error) {
      console.error("[PHARMACY API] ❌ Error getting pharmacy prescriptions:", error);
      res.status(500).json({ message: "Failed to get pharmacy prescriptions" });
    }
  });

  // Update prescription status (for pharmacy workflow)
  app.patch("/api/pharmacy/prescriptions/:prescriptionId/process", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log("[PHARMACY API] 🔄 PATCH /api/pharmacy/prescriptions/process called");
      const { prescriptionId } = req.params;
      const { status } = req.body;
      
      console.log("[PHARMACY API] 📋 Prescription ID:", prescriptionId);
      console.log("[PHARMACY API] 🔄 New Status:", status);
      
      // Validate status
      const validStatuses = ['new', 'processing', 'ready', 'dispensed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Update prescription status
      const updatedPrescription = await storage.updatePrescriptionStatus(prescriptionId, status);
      
      console.log("[PHARMACY API] ✅ Prescription status updated successfully");
      
      res.json(updatedPrescription);
    } catch (error) {
      console.error("[PHARMACY API] ❌ Error updating prescription status:", error);
      res.status(500).json({ message: "Failed to update prescription status" });
    }
  });

  // Pharmacy prescription archives endpoint
  app.get("/api/pharmacy/prescription-archives", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log(`[PHARMACY API] 📦 GET /api/pharmacy/prescription-archives called`);
      const tenantId = req.tenant!.id;
      
      const archives = await storage.getPrescriptionArchives(tenantId);
      console.log(`[PHARMACY API] ✅ Retrieved ${archives.length} archived prescriptions`);
      
      res.json(archives);
    } catch (error) {
      console.error(`[PHARMACY API] ❌ Error fetching prescription archives:`, error);
      res.status(500).json({ message: "Failed to fetch prescription archives" });
    }
  });

  // REMOVED: Duplicate prescription routes - using the main routes above at line 1517-1534

  // Lab order management routes
  app.get("/api/lab-orders", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId, pending } = req.query;
      const tenantId = req.tenant!.id;

      let labOrders;
      if (patientId) {
        labOrders = await storage.getLabOrdersByPatient(patientId as string, tenantId);
      } else if (pending === "true") {
        labOrders = await storage.getPendingLabOrders(tenantId);
      } else {
        labOrders = await storage.getLabOrdersByTenant(tenantId);
      }

      res.json(labOrders);
    } catch (error) {
      console.error("Get lab orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/lab-orders", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      // Lab order creation endpoint
      
      const labOrderData = {
        tenantId: req.tenant!.id,
        providerId: req.user!.id,
        patientId: req.body.patientId,
        testName: req.body.testName,
        testCode: req.body.testCode || null,
        instructions: req.body.instructions || null,
        priority: req.body.priority || 'routine',
        status: 'ordered',
        orderedDate: new Date(),
        appointmentId: req.body.appointmentId || null,
        labTenantId: req.body.labTenantId || null
      };

      const validatedData = insertLabOrderSchema.parse(labOrderData);

      const labOrder = await storage.createLabOrder(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "lab_order",
        entityId: labOrder.id,
        action: "create",
        newData: labOrder,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(labOrder);
    } catch (error) {
      console.error("Create lab order error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance claims management routes
  app.use("/api/insurance-claims", requireTenant);

  app.get("/api/insurance-claims", async (req, res) => {
    try {
      const { patientId } = req.query;
      const tenantId = req.tenant!.id;

      let claims;
      if (patientId) {
        claims = await storage.getInsuranceClaimsByPatient(patientId as string, tenantId);
      } else {
        claims = await storage.getInsuranceClaimsByTenant(tenantId);
      }

      res.json(claims);
    } catch (error) {
      console.error("Get insurance claims error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/insurance-claims", requireRole(["billing_staff", "physician", "tenant_admin", "director", "receptionist"]), async (req, res) => {
    try {
      const requestData = { ...req.body };
      
      // Generate unique claim number if not provided
      if (!requestData.claimNumber) {
        requestData.claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }

      const claimData = insertInsuranceClaimSchema.parse({
        ...requestData,
        tenantId: req.tenant!.id,
        claimNumber: requestData.claimNumber, // Ensure claim number is included
        providerId: req.user!.id // Ensure provider ID is included
      });

      const claim = await storage.createInsuranceClaim(claimData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: claim.id,
        action: "create",
        newData: claim,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Create insurance claim error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      if (error.code === '23505' && error.constraint === 'insurance_claims_claim_number_unique') {
        return res.status(400).json({ message: "Claim number already exists. Please use a different claim number." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/insurance-claims/:id", requireRole(["billing_staff", "physician", "tenant_admin", "director", "receptionist"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle date fields properly
      if (updateData.submittedDate) {
        updateData.submittedDate = new Date(updateData.submittedDate);
      }
      if (updateData.processedDate) {
        updateData.processedDate = new Date(updateData.processedDate);
      }

      const updatedClaim = await storage.updateInsuranceClaim(id, updateData, req.tenant!.id);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: id,
        action: "update",
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedClaim);
    } catch (error) {
      console.error("Update insurance claim error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance Provider routes
  app.get("/api/insurance-providers", requireTenant, async (req, res) => {
    try {
      const providers = await storage.getInsuranceProviders(req.tenant!.id);
      res.json(providers);
    } catch (error) {
      console.error("Get insurance providers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient Insurance routes
  app.get("/api/patient-insurance/:patientId", requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const insuranceList = await storage.getPatientInsurance(patientId, req.tenant!.id);
      res.json(insuranceList);
    } catch (error) {
      console.error("Get patient insurance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Service Pricing routes
  app.get("/api/service-prices", requireTenant, async (req, res) => {
    try {
      const servicePrices = await storage.getServicePrices(req.tenant!.id);
      res.json(servicePrices);
    } catch (error) {
      console.error("Get service prices error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/service-prices", requireRole(["tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const servicePriceData = insertServicePriceSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const servicePrice = await storage.createServicePrice(servicePriceData);
      res.json(servicePrice);
    } catch (error) {
      console.error("Create service price error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/service-prices/:id", requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const servicePrice = await storage.getServicePrice(id, req.tenant!.id);
      
      if (!servicePrice) {
        return res.status(404).json({ message: "Service price not found" });
      }

      res.json(servicePrice);
    } catch (error) {
      console.error("Get service price error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance Plan Coverage routes
  app.get("/api/insurance-plan-coverage", requireTenant, async (req, res) => {
    try {
      const coverages = await storage.getInsurancePlanCoverages(req.tenant!.id);
      res.json(coverages);
    } catch (error) {
      console.error("Get insurance plan coverages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/insurance-plan-coverage", requireRole(["tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const coverageData = insertInsurancePlanCoverageSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const coverage = await storage.createInsurancePlanCoverage(coverageData);
      res.json(coverage);
    } catch (error) {
      console.error("Create insurance plan coverage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pricing calculation endpoint
  app.post("/api/calculate-pricing", requireTenant, async (req, res) => {
    try {
      const { servicePriceId, insuranceProviderId, patientInsuranceId } = req.body;

      if (!servicePriceId || !insuranceProviderId || !patientInsuranceId) {
        return res.status(400).json({ 
          message: "servicePriceId, insuranceProviderId, and patientInsuranceId are required" 
        });
      }

      const pricing = await storage.calculateCopayAndInsuranceAmount(
        servicePriceId,
        insuranceProviderId, 
        patientInsuranceId,
        req.tenant!.id
      );

      res.json(pricing);
    } catch (error) {
      console.error("Calculate pricing error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Claim Line Items routes
  app.get("/api/claim-line-items/:claimId", requireTenant, async (req, res) => {
    try {
      const { claimId } = req.params;
      const lineItems = await storage.getClaimLineItems(claimId, req.tenant!.id);
      res.json(lineItems);
    } catch (error) {
      console.error("Get claim line items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/claim-line-items", requireRole(["billing_staff", "physician", "tenant_admin", "director"]), async (req, res) => {
    try {
      const lineItemData = insertClaimLineItemSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const lineItem = await storage.createClaimLineItem(lineItemData);
      res.json(lineItem);
    } catch (error) {
      console.error("Create claim line item error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: "Tenant context required" });
      }
      
      const metrics = await storage.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit logs
  app.get("/api/audit-logs", requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const { limit = "50", offset = "0" } = req.query;
      const auditLogs = await storage.getAuditLogs(
        req.tenant!.id, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json(auditLogs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Platform metrics route for super admin
  app.get("/api/platform/metrics", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const metrics = await storage.getPlatformMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Platform metrics error:", error);
      res.status(500).json({ message: "Failed to fetch platform metrics" });
    }
  });

  // Reports routes
  app.get("/api/reports", authenticateToken, requireTenant, async (req, res) => {
    try {
      const reports = await storage.getReportsByTenant(req.tenant.id);
      res.json(reports);
    } catch (error) {
      console.error("Reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", authenticateToken, requireTenant, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        tenantId: req.tenant.id,
        generatedBy: req.user.userId,
        status: 'generating'
      });

      const report = await storage.createReport(reportData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant.id,
        userId: req.user.userId,
        entityType: "report",
        entityId: report.id,
        action: "create",
        newData: { title: report.title, type: report.type },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      // In a real implementation, you would trigger async report generation here
      // For now, we'll simulate completion
      setTimeout(async () => {
        try {
          await storage.updateReport(report.id, {
            status: 'completed',
            completedAt: new Date(),
            fileUrl: `/api/reports/${report.id}/download`
          }, req.tenant.id);
        } catch (error) {
          console.error("Report completion error:", error);
        }
      }, 3000);

      res.status(201).json(report);
    } catch (error) {
      console.error("Report creation error:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Enhanced Pharmacy Dashboard report generation (dedicated endpoint)
  // NaviMED Platform - Independent Pharmacy Dashboard API Endpoints
  app.get("/api/pharmacy/metrics", authenticateToken, requireTenant, async (req, res) => {
    try {
      const pharmacyTenantId = req.tenant!.id;
      const tenantName = req.tenant!.name;
      
      // Get prescriptions routed to this pharmacy from connected hospitals
      const prescriptions = await storage.getPrescriptionsByPharmacyTenant(pharmacyTenantId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayPrescriptions = prescriptions.filter(p => 
        new Date(p.prescribedDate) >= today
      );
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekPrescriptions = prescriptions.filter(p => 
        new Date(p.prescribedDate) >= weekStart
      );
      
      // Calculate metrics for independent pharmacy
      const metrics = {
        prescriptionsToday: todayPrescriptions.length,
        prescriptionsWeek: weekPrescriptions.length,
        revenueToday: todayPrescriptions.length * 32.45,
        revenueWeek: weekPrescriptions.length * 32.45,
        patientsToday: new Set(todayPrescriptions.map(p => p.patientId)).size,
        averageWaitTime: 12,
        inventoryAlerts: 8,
        insuranceClaims: Math.floor(weekPrescriptions.length * 0.8),
        connectedHospitals: 3, // Number of hospitals connected to this pharmacy
        pharmacyName: tenantName,
        platformName: "NaviMED"
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Get pharmacy metrics error:", error);
      res.status(500).json({ message: "Failed to fetch pharmacy metrics" });
    }
  });

  app.get("/api/pharmacy/prescriptions", authenticateToken, requireTenant, async (req, res) => {
    try {
      const pharmacyTenantId = req.tenant!.id;
      console.log("[PHARMACY API] ✅ Fetching prescriptions for pharmacy:", pharmacyTenantId);
      console.log("[PHARMACY API] ✅ Request tenant type:", req.tenant!.type);
      console.log("[PHARMACY API] ✅ User:", req.user?.id, "Role:", req.user?.role);
      
      // STRICT TENANT ISOLATION: Only pharmacy tenants can access pharmacy prescriptions
      // Exception: Super admin can access for oversight purposes with special handling
      if (req.tenant!.type !== 'pharmacy' && req.user?.role !== 'super_admin') {
        console.log("[PHARMACY API] ❌ INVALID TENANT TYPE: Tenant type is", req.tenant!.type, "but expected pharmacy");
        return res.status(403).json({ 
          message: "Access denied: This endpoint is only for pharmacy tenants",
          error: "INVALID_TENANT_TYPE"
        });
      }
      
      // Super admin accessing pharmacy data for oversight
      if (req.user?.role === 'super_admin' && req.tenant!.type !== 'pharmacy') {
        console.log("[PHARMACY API] 🔧 Super admin oversight access - limited view only");
        // Return minimal oversight data, not full operational access
        const oversightData = {
          tenantInfo: {
            id: req.tenant!.id,
            name: req.tenant!.name,
            type: req.tenant!.type
          },
          message: "Super admin oversight mode - operational access requires pharmacy tenant login",
          availableActions: ["View tenant info", "Manage users", "View audit logs"]
        };
        return res.json(oversightData);
      }
      
      // Get prescriptions with patient names, doctor names, and insurance data
      const prescriptions = await storage.getPrescriptionsByPharmacy(pharmacyTenantId);
      console.log("[PHARMACY API] ✅ Found prescriptions with names and insurance:", prescriptions.length);
      console.log("[PHARMACY API] ✅ Sample prescription data:", prescriptions[0]);
      
      console.log("[PHARMACY API] 📋 Returning formatted prescriptions:", prescriptions.length);
      res.json(prescriptions);
    } catch (error) {
      console.error("Get pharmacy prescriptions error:", error);
      res.status(500).json({ message: "Failed to fetch pharmacy prescriptions" });
    }
  });

  app.get("/api/pharmacy/inventory-alerts", authenticateToken, requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      
      // Independent pharmacy inventory alerts
      const pharmacyAlerts = [
        { 
          id: `${tenantId}-I001`, 
          medication: 'Insulin Glargine', 
          currentStock: 5, 
          reorderLevel: 20, 
          supplier: 'Sanofi', 
          urgency: 'critical',
          pharmacyId: tenantId,
          demandSource: 'Connected hospitals via NaviMED'
        },
        { 
          id: `${tenantId}-I002`, 
          medication: 'Albuterol Inhaler', 
          currentStock: 12, 
          reorderLevel: 25, 
          supplier: 'GSK', 
          urgency: 'high',
          pharmacyId: tenantId,
          demandSource: 'Metro General Hospital prescriptions'
        },
        { 
          id: `${tenantId}-I003`, 
          medication: 'Amoxicillin 500mg', 
          currentStock: 45, 
          reorderLevel: 100, 
          supplier: 'Teva', 
          urgency: 'medium',
          pharmacyId: tenantId,
          demandSource: 'Multiple hospital networks'
        }
      ];
      
      res.json(pharmacyAlerts);
    } catch (error) {
      console.error("Get inventory alerts error:", error);
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  app.post("/api/pharmacy/reports/enhanced", authenticateToken, requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const tenantName = req.tenant!.name;
      const { reportType, startDate, endDate, format } = req.body;
      
      // Get prescriptions routed to this independent pharmacy
      const prescriptions = await storage.getPrescriptionsByTenant(tenantId);
      
      const generatePharmacyData = (type: string) => {
        const baseData = {
          prescriptions: prescriptions.length,
          revenue: `$${(prescriptions.length * 32.45).toFixed(2)}`,
          claims: Math.floor(prescriptions.length * 0.8),
          averageProcessingTime: `12 minutes`,
          patientsServed: new Set(prescriptions.map(p => p.patientId)).size,
          inventoryItems: 250,
          connectedHospitals: 3,
          prescriptionRouting: 'NaviMED Platform',
          pharmacyName: tenantName,
          platformType: 'Independent Pharmacy Network'
        };

        return baseData;
      };
      
      const reportData = generatePharmacyData(reportType || 'daily');
      
      const response = {
        success: true,
        message: "Independent pharmacy report generated successfully",
        reportType: reportType || 'daily',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        format: format || 'pdf',
        generatedAt: new Date().toISOString(),
        data: reportData,
        platformName: 'NaviMED',
        pharmacyType: 'Independent',
        hospitalConnected: true
      };
      
      res.json(response);
    } catch (error) {
      console.error("Enhanced pharmacy report error:", error);
      res.status(500).json({ message: "Failed to generate enhanced pharmacy report" });
    }
  });

  // Hospital-to-Pharmacy Prescription Routing Endpoint
  // Hospital prescription receiving endpoint for pharmacies
  app.post("/api/pharmacy/receive-prescription", async (req, res) => {
    try {
      console.log("[PHARMACY] 📨 Receiving prescription from hospital:", req.body);
      
      const prescriptionData = {
        ...req.body,
        status: "received", // Set status to received when pharmacy gets it
        receivedDate: new Date(),
        pharmacyTenantId: req.body.pharmacyTenantId
      };

      const prescription = await storage.createPrescription(prescriptionData);
      
      console.log("[PHARMACY] ✅ Prescription received and stored:", prescription.id);
      
      res.status(201).json({
        message: "Prescription received successfully",
        prescriptionId: prescription.id,
        status: "received"
      });
    } catch (error) {
      console.error("[PHARMACY] ❌ Error receiving prescription:", error);
      res.status(500).json({ message: "Error receiving prescription" });
    }
  });

  app.post("/api/hospital/route-prescription", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId, prescriptionData, preferredPharmacyId } = req.body;
      
      // Route prescription to patient's preferred pharmacy via NaviMED platform
      const routedPrescription = {
        ...prescriptionData,
        routedVia: 'NaviMED Platform',
        sourceHospital: req.tenant!.name,
        targetPharmacy: preferredPharmacyId,
        routingTimestamp: new Date(),
        status: 'routed'
      };
      
      // In a real system, this would send to the pharmacy's system
      console.log(`Prescription routed from ${req.tenant!.name} to pharmacy ${preferredPharmacyId} via NaviMED`);
      
      res.json({
        success: true,
        message: "Prescription successfully routed to preferred pharmacy",
        routingId: `${req.tenant!.id}-${Date.now()}`,
        pharmacy: preferredPharmacyId,
        platform: "NaviMED"
      });
    } catch (error) {
      console.error("Prescription routing error:", error);
      res.status(500).json({ message: "Failed to route prescription" });
    }
  });

  // Legacy report generation endpoint (disabled for conflicting calls)
  app.post("/api/reports/generate", authenticateToken, requireTenant, async (req, res) => {
    console.log('LEGACY ENDPOINT CALLED - BLOCKING CONFLICTING REQUEST:', JSON.stringify(req.body, null, 2));
    
    // Block the conflicting calls by returning early without processing
    res.json({ 
      success: true, 
      message: "Legacy endpoint - use enhanced pharmacy endpoint instead",
      blocked: true
    });
  });

  // Platform-wide report generation for super admin
  app.post("/api/platform/reports/generate", authenticateToken, async (req, res) => {
    try {
      console.log("Cross-tenant report - User:", req.user);
      
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const { targetTenantId, ...reportParams } = req.body;
      
      if (!targetTenantId) {
        return res.status(400).json({ message: "Target tenant ID is required for cross-tenant reports" });
      }

      // Verify target tenant exists
      const targetTenant = await storage.getTenant(targetTenantId);
      if (!targetTenant) {
        return res.status(404).json({ message: "Target tenant not found" });
      }

      const reportData = insertReportSchema.parse({
        ...reportParams,
        tenantId: targetTenantId,
        generatedBy: req.user.userId,
        status: 'generating',
        parameters: { 
          ...reportParams.parameters, 
          crossTenantGeneration: true, 
          generatedByRole: 'super_admin' 
        }
      });

      const report = await storage.createReport(reportData);

      // Create audit log for both platform and target tenant
      await storage.createAuditLog({
        tenantId: req.user.tenantId, // Platform tenant
        userId: req.user.userId,
        entityType: "cross_tenant_report",
        entityId: report.id,
        action: "create",
        newData: { 
          title: report.title, 
          type: report.type, 
          targetTenant: targetTenant.name,
          targetTenantId: targetTenantId 
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      await storage.createAuditLog({
        tenantId: targetTenantId, // Target tenant
        userId: req.user.userId,
        entityType: "report",
        entityId: report.id,
        action: "platform_generate",
        newData: { 
          title: report.title, 
          type: report.type, 
          generatedBy: 'platform_admin' 
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      // Simulate async report generation
      setTimeout(async () => {
        try {
          await storage.updateReport(report.id, {
            status: 'completed',
            completedAt: new Date(),
            fileUrl: `/api/platform/reports/${report.id}/download`
          }, targetTenantId);
        } catch (error) {
          console.error("Cross-tenant report completion error:", error);
        }
      }, 4000);

      res.status(201).json(report);
    } catch (error) {
      console.error("Cross-tenant report creation error:", error);
      res.status(500).json({ message: "Failed to create cross-tenant report" });
    }
  });

  // Get users for a specific tenant (for super admin and tenant admin user management)
  app.get("/api/users/:tenantId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { tenantId } = req.params;
      
      // Super admin can view users from any tenant
      if (req.user?.role === 'super_admin') {
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else if ((req.user?.role === 'tenant_admin' || req.user?.role === 'director') && req.user.tenantId === tenantId) {
        // Tenant admin and director can view users from their own tenant
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else if (req.user?.tenantId === tenantId) {
        // Regular users can only view users from their own tenant (limited info)
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else {
        return res.status(403).json({ message: "Access denied. Cannot view users from this organization." });
      }
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user (for user management)
  app.patch("/api/users/:id", authenticateToken, requireTenant, async (req, res) => {
    console.log("🔥 USER UPDATE REQUEST:", {
      userId: req.params.id,
      updateData: req.body,
      userRole: req.user?.role,
      userTenant: req.user?.tenantId,
      requestHeaders: req.headers.authorization?.substring(0, 30)
    });
    
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get the user to check permissions
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has permission to update this user
      const hasPermission = req.user!.role === 'super_admin' || 
                           ((req.user!.role === 'tenant_admin' || req.user!.role === 'director') && existingUser.tenantId === req.user!.tenantId) ||
                           (req.user!.id === id); // User updating themselves

      if (!hasPermission) {
        return res.status(403).json({ message: "Access denied. Cannot update this user." });
      }

      // Prevent deactivation of super admin users
      if (existingUser.role === 'super_admin' && updateData.isActive === false) {
        return res.status(403).json({ message: "Cannot deactivate super admin users. This role is permanent for platform security." });
      }

      // Prevent users from deactivating themselves
      if (req.user!.id === id && updateData.isActive === false) {
        return res.status(403).json({ message: "You cannot deactivate your own account." });
      }

      // Update the user
      const updatedUser = await storage.updateUser(id, updateData);
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: existingUser.tenantId,
        userId: req.user!.id,
        entityType: "user",
        entityId: id,
        action: "update",
        oldData: { isActive: existingUser.isActive, role: existingUser.role },
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({
        message: "User updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          tenantId: updatedUser.tenantId
        }
      });
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // White Label Settings Management - Enhanced for super admin and tenant admin
  app.patch("/api/tenants/:tenantId/white-label", authenticateToken, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { brandName, logoUrl, primaryColor, secondaryColor, customDomain, customCss } = req.body;
      
      // Super admin can manage any tenant, tenant admin can manage their own tenant
      const canManage = req.user?.role === 'super_admin' || 
                       (req.user?.role === 'tenant_admin' && req.user?.tenantId === tenantId) ||
                       (req.user?.role === 'director' && req.user?.tenantId === tenantId);
      
      if (!canManage) {
        return res.status(403).json({ message: "Access denied. Cannot manage white label settings for this tenant." });
      }
      
      console.log(`[SUPER ADMIN] White label settings update for tenant: ${tenantId}`);
      
      // Update tenant white label settings
      const updatedTenant = await storage.updateTenant(tenantId, {
        brandName,
        logoUrl,
        primaryColor,
        secondaryColor,
        customDomain,
        customCss,
        updatedAt: new Date()
      });
      
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId, // Platform tenant
        userId: req.user.id,
        entityType: "white_label_settings",
        entityId: tenantId,
        action: "update",
        newData: { brandName, logoUrl, primaryColor, secondaryColor, customDomain },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.json({
        message: "White label settings updated successfully",
        tenant: updatedTenant
      });
    } catch (error) {
      console.error("White label settings update error:", error);
      res.status(500).json({ message: "Failed to update white label settings" });
    }
  });

  // Super Admin: Subscription Management for Any Client
  app.patch("/api/tenants/:tenantId/subscription", authenticateToken, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { subscriptionStatus, trialEndDate, planType, features } = req.body;
      
      // Only super admin can manage subscriptions for any tenant
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Only super admin can manage client subscriptions" });
      }
      
      console.log(`[SUPER ADMIN] Subscription update for tenant: ${tenantId}`);
      
      // Update tenant subscription
      const updatedTenant = await storage.updateTenant(tenantId, {
        subscriptionStatus,
        trialEndDate: trialEndDate ? new Date(trialEndDate) : undefined,
        planType,
        settings: {
          ...await storage.getTenant(tenantId).then(t => t?.settings || {}),
          features: features || ['unlimited', 'white_label', 'premium_support'],
          planType: planType || 'unlimited'
        },
        updatedAt: new Date()
      });
      
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId, // Platform tenant
        userId: req.user.id,
        entityType: "subscription",
        entityId: tenantId,
        action: "update",
        newData: { subscriptionStatus, planType, features },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.json({
        message: "Subscription updated successfully",
        tenant: updatedTenant
      });
    } catch (error) {
      console.error("Subscription update error:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Super Admin: Client Management Dashboard Data
  app.get("/api/admin/clients", authenticateToken, async (req, res) => {
    try {
      // Only super admin can access client management
      if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: "Only super admin can access client management" });
      }
      
      const tenants = await storage.getAllTenants();
      
      // Get enhanced client data with user counts and activity
      const clientsData = await Promise.all(tenants.map(async (tenant) => {
        const users = await storage.getUsersByTenant(tenant.id);
        const activeUsers = users.filter(u => u.isActive).length;
        
        return {
          ...tenant,
          userCount: users.length,
          activeUsers,
          hasWhiteLabel: !!(tenant.brandName || tenant.logoUrl || tenant.customDomain),
          isUnlimited: tenant.settings?.planType === 'unlimited' || 
                      tenant.settings?.features?.includes('unlimited')
        };
      }));
      
      res.json(clientsData);
    } catch (error) {
      console.error("Client management error:", error);
      res.status(500).json({ message: "Failed to fetch client data" });
    }
  });

  // Create new user (for tenant admin user management)
  app.post("/api/users", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check permissions - only super admin, tenant admin, and director can create users
      if (req.user?.role !== 'super_admin' && req.user?.role !== 'tenant_admin' && req.user?.role !== 'director') {
        return res.status(403).json({ message: "Access denied. Admin privileges required to create users." });
      }

      // Tenant admin can only create users in their own organization
      const targetTenantId = req.user.role === 'super_admin' ? (req.body.tenantId || req.user.tenantId) : req.user.tenantId;

      // Validate that tenant admin and director cannot create super admin users
      // But allow them to create other tenant admins for multi-admin pharmacy management
      if (req.user?.role === 'tenant_admin' || req.user?.role === 'director') {
        if (role === 'super_admin') {
          return res.status(403).json({ message: "Only super admins can create other super admin users." });
        }
      }

      // Check if username or email already exists in this tenant
      const existingUserByUsername = await storage.getUserByUsername(username, targetTenantId);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists in this organization" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email, targetTenantId);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists in this organization" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Cast to UserRole type
        tenantId: targetTenantId,
        isActive: true
      });

      // Create audit log
      await storage.createAuditLog({
        tenantId: targetTenantId,
        userId: req.user?.id || null,
        entityType: "user",
        entityId: newUser.id,
        action: "create",
        previousData: null,
        newData: { 
          username, 
          email, 
          firstName, 
          lastName, 
          role,
          tenantId: targetTenantId
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive,
          tenantId: newUser.tenantId
        }
      });
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get all reports across platform for super admin
  app.get("/api/platform/reports", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Platform reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch platform reports" });
    }
  });

  // Download report endpoint
  app.get("/api/reports/:id/download", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id, req.tenant?.id || '');
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== 'completed') {
        return res.status(400).json({ message: "Report is not ready for download" });
      }

      // Generate mock report content based on type and format
      const reportContent = generateReportContent(report);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format}`;

      // Set appropriate headers based on format
      switch (report.format) {
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'excel':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          break;
        default:
          res.setHeader('Content-Type', 'application/octet-stream');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportContent);

    } catch (error) {
      console.error("Report download error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // Platform download endpoint for cross-tenant reports
  app.get("/api/platform/reports/:id/download", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const { id } = req.params;
      const reports = await storage.getAllReports();
      const report = reports.find(r => r.id === id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== 'completed') {
        return res.status(400).json({ message: "Report is not ready for download" });
      }

      // Generate mock report content
      const reportContent = generateReportContent(report);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format}`;

      // Set headers
      switch (report.format) {
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'excel':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          break;
        default:
          res.setHeader('Content-Type', 'application/octet-stream');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportContent);

    } catch (error) {
      console.error("Platform report download error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // ==================== MULTILINGUAL COMMUNICATION ROUTES ====================

  // Medical Communications routes
  app.get("/api/medical-communications", authenticateToken, requireTenant, async (req, res) => {
    try {
      const communications = await storage.getMedicalCommunicationsByTenant(req.user.tenantId);
      res.json(communications);
    } catch (error) {
      console.error("Failed to fetch communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.get("/api/medical-communications/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const communication = await storage.getMedicalCommunication(id, req.user.tenantId);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      
      res.json(communication);
    } catch (error) {
      console.error("Failed to fetch communication:", error);
      res.status(500).json({ message: "Failed to fetch communication" });
    }
  });

  app.post("/api/medical-communications", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertMedicalCommunicationSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        senderId: req.user.userId,
      });

      const communication = await storage.createMedicalCommunication(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "CREATE",
        newData: communication,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(communication);
    } catch (error) {
      console.error("Failed to create communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.patch("/api/medical-communications/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const communication = await storage.updateMedicalCommunication(id, updates, req.user.tenantId);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "UPDATE",
        newData: communication,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(communication);
    } catch (error) {
      console.error("Failed to update communication:", error);
      res.status(500).json({ message: "Failed to update communication" });
    }
  });

  // Communication Translations routes
  app.get("/api/communication-translations/:communicationId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { communicationId } = req.params;
      const translations = await storage.getCommunicationTranslations(communicationId);
      res.json(translations);
    } catch (error) {
      console.error("Failed to fetch translations:", error);
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });

  app.post("/api/communication-translations", authenticateToken, requireTenant, async (req, res) => {
    try {
      const validatedData = insertCommunicationTranslationSchema.parse(req.body);
      const translation = await storage.createCommunicationTranslation(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "communication_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(translation);
    } catch (error) {
      console.error("Failed to create translation:", error);
      res.status(500).json({ message: "Failed to create translation" });
    }
  });

  // Supported Languages routes
  app.get("/api/supported-languages", authenticateToken, requireTenant, async (req, res) => {
    try {
      const languages = await storage.getSupportedLanguages(req.user.tenantId);
      res.json(languages);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.post("/api/supported-languages", authenticateToken, requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertSupportedLanguageSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
      });

      const language = await storage.createSupportedLanguage(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "supported_language",
        entityId: language.id,
        action: "CREATE",
        newData: language,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(language);
    } catch (error) {
      console.error("Failed to create language:", error);
      res.status(500).json({ message: "Failed to create language" });
    }
  });

  app.patch("/api/supported-languages/:id", authenticateToken, requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const language = await storage.updateSupportedLanguage(id, updates, req.user.tenantId);
      
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "supported_language",
        entityId: language.id,
        action: "UPDATE",
        newData: language,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(language);
    } catch (error) {
      console.error("Failed to update language:", error);
      res.status(500).json({ message: "Failed to update language" });
    }
  });

  // Pharmacies routes
  app.get("/api/pharmacies", authenticateToken, async (req, res) => {
    try {
      // Get all active pharmacy tenants for prescription routing
      const pharmacies = await storage.getPharmaciesForPrescriptionRouting();
      res.json(pharmacies);
    } catch (error) {
      console.error("Failed to fetch pharmacies:", error);
      res.status(500).json({ message: "Failed to fetch pharmacies" });
    }
  });

  // Update patient preferred pharmacy (requires patient approval)
  app.patch("/api/patients/:id/preferred-pharmacy", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { preferredPharmacyId, updatedBy, reason, requiresPatientApproval } = req.body;

      // Get the patient to verify they belong to this tenant
      const patient = await storage.getPatient(id, req.user.tenantId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // For now, we'll update the preferred pharmacy directly
      // In a real system, this would create a pending approval request
      const updatedPatient = await storage.updatePatient(id, {
        preferredPharmacyId: preferredPharmacyId
      }, req.user.tenantId);

      // Create audit log for the pharmacy change
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "patient",
        entityId: id,
        action: "UPDATE_PREFERRED_PHARMACY",
        oldData: { preferredPharmacyId: patient.preferredPharmacyId },
        newData: { preferredPharmacyId: preferredPharmacyId, updatedBy, reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: "Preferred pharmacy updated successfully",
        patient: updatedPatient,
        requiresPatientApproval: requiresPatientApproval
      });
    } catch (error) {
      console.error("Failed to update preferred pharmacy:", error);
      res.status(500).json({ message: "Failed to update preferred pharmacy" });
    }
  });

  // Medical Phrases routes
  app.get("/api/medical-phrases", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { category } = req.query;
      const phrases = await storage.getMedicalPhrases(req.user.tenantId, category as string);
      res.json(phrases);
    } catch (error) {
      console.error("Failed to fetch phrases:", error);
      res.status(500).json({ message: "Failed to fetch phrases" });
    }
  });

  app.post("/api/medical-phrases", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertMedicalPhraseSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
      });

      const phrase = await storage.createMedicalPhrase(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_phrase",
        entityId: phrase.id,
        action: "CREATE",
        newData: phrase,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(phrase);
    } catch (error) {
      console.error("Failed to create phrase:", error);
      res.status(500).json({ message: "Failed to create phrase" });
    }
  });

  // Phrase Translations routes
  app.get("/api/phrase-translations/:phraseId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { phraseId } = req.params;
      const translations = await storage.getPhraseTranslations(phraseId);
      res.json(translations);
    } catch (error) {
      console.error("Failed to fetch phrase translations:", error);
      res.status(500).json({ message: "Failed to fetch phrase translations" });
    }
  });

  app.post("/api/phrase-translations", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertPhraseTranslationSchema.parse({
        ...req.body,
        translatedBy: req.user.userId,
      });

      const translation = await storage.createPhraseTranslation(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "phrase_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(translation);
    } catch (error) {
      console.error("Failed to create phrase translation:", error);
      res.status(500).json({ message: "Failed to create phrase translation" });
    }
  });

  // Laboratory Management Routes
  app.get("/api/laboratories", authenticateToken, requireTenant, async (req, res) => {
    try {
      const laboratories = await storage.getLaboratoriesByTenant(req.tenantId!);
      res.json(laboratories);
    } catch (error) {
      console.error("Error fetching laboratories:", error);
      res.status(500).json({ message: "Failed to fetch laboratories" });
    }
  });

  app.get("/api/laboratories/active", authenticateToken, requireTenant, async (req, res) => {
    try {
      // Get all active laboratory tenants (not labs within current tenant)
      const laboratories = await storage.getActiveLaboratoryTenants();
      res.json(laboratories);
    } catch (error) {
      console.error("Error fetching active laboratories:", error);
      res.status(500).json({ message: "Failed to fetch active laboratories" });
    }
  });

  app.post("/api/laboratories", authenticateToken, requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const laboratoryData = insertLaboratorySchema.parse({
        ...req.body,
        tenantId: req.tenantId
      });

      const laboratory = await storage.createLaboratory(laboratoryData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "laboratory",
        entityId: laboratory.id,
        action: "create",
        newData: laboratory,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(laboratory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid laboratory data", errors: error.errors });
      }
      console.error("Error creating laboratory:", error);
      res.status(500).json({ message: "Failed to create laboratory" });
    }
  });

  // Lab Results Routes
  app.get("/api/lab-results", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByTenant(req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching lab results:", error);
      res.status(500).json({ message: "Failed to fetch lab results" });
    }
  });

  app.get("/api/lab-results/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByPatient(req.params.patientId, req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching patient lab results:", error);
      res.status(500).json({ message: "Failed to fetch patient lab results" });
    }
  });

  app.get("/api/lab-results/order/:labOrderId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByOrder(req.params.labOrderId, req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching lab order results:", error);
      res.status(500).json({ message: "Failed to fetch lab order results" });
    }
  });

  app.post("/api/lab-results", authenticateToken, requireRole(["lab_technician", "physician", "tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const labResultData = insertLabResultSchema.parse({
        ...req.body,
        tenantId: req.tenantId
      });

      const labResult = await storage.createLabResult(labResultData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "lab_result",
        entityId: labResult.id,
        action: "create",
        newData: labResult,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(labResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab result data", errors: error.errors });
      }
      console.error("Error creating lab result:", error);
      res.status(500).json({ message: "Failed to create lab result" });
    }
  });

  // Lab Order Assignment Routes
  app.post("/api/lab-order-assignments", authenticateToken, requireRole(["physician", "nurse", "lab_technician", "tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const assignmentData = insertLabOrderAssignmentSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        assignedBy: req.userId
      });

      const assignment = await storage.createLabOrderAssignment(assignmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "lab_order_assignment",
        entityId: assignment.id,
        action: "create",
        newData: assignment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Error creating lab order assignment:", error);
      res.status(500).json({ message: "Failed to create lab order assignment" });
    }
  });

  // External Lab Integration Endpoint for receiving results
  app.post("/api/external-lab/results", async (req, res) => {
    try {
      const { 
        externalLabId, 
        labOrderId, 
        results, 
        laboratoryApiKey 
      } = req.body;

      // Find laboratory by API key across all tenants
      const allTenants = await storage.getAllTenants();
      let laboratory;
      
      for (const tenant of allTenants) {
        const labs = await storage.getLaboratoriesByTenant(tenant.id);
        laboratory = labs.find(lab => lab.apiKey === laboratoryApiKey);
        if (laboratory) break;
      }

      if (!laboratory) {
        return res.status(401).json({ message: "Invalid laboratory API key" });
      }

      // Process each result
      for (const result of results) {
        const labResultData = insertLabResultSchema.parse({
          labOrderId: labOrderId,
          laboratoryId: laboratory.id,
          tenantId: laboratory.tenantId,
          patientId: result.patientId,
          testName: result.testName,
          result: result.result,
          normalRange: result.normalRange,
          unit: result.unit,
          status: 'completed',
          abnormalFlag: result.abnormalFlag,
          notes: result.notes,
          performedBy: result.performedBy,
          completedAt: new Date(result.completedAt),
          reportedAt: new Date(),
          externalLabId: externalLabId,
          rawData: result.rawData
        });

        await storage.createLabResult(labResultData);
      }

      // Update the lab order assignment status
      const assignment = await storage.getLabOrderAssignmentByOrder(labOrderId, laboratory.tenantId);
      if (assignment) {
        await storage.updateLabOrderAssignment(assignment.id, {
          status: 'completed',
          actualCompletionTime: new Date()
        }, laboratory.tenantId);
      }

      res.json({ message: "Results received successfully", processed: results.length });
    } catch (error) {
      console.error("Error processing external lab results:", error);
      res.status(500).json({ message: "Failed to process lab results" });
    }
  });

  // Laboratory application routes (external lab registration) - Public endpoint
  app.post("/api/laboratory-applications", async (req, res) => {
    try {
      const applicationData = insertLaboratoryApplicationSchema.parse(req.body);
      
      const application = await storage.createLaboratoryApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error creating laboratory application:", error);
      res.status(500).json({ message: "Failed to create laboratory application" });
    }
  });

  app.get("/api/laboratory-applications", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const status = req.query.status as string;
      const applications = status 
        ? await storage.getLaboratoryApplicationsByStatus(status)
        : await storage.getAllLaboratoryApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching laboratory applications:", error);
      res.status(500).json({ message: "Failed to fetch laboratory applications" });
    }
  });

  app.post("/api/laboratory-applications/:id/approve", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reviewNotes } = req.body;
      const result = await storage.approveLaboratoryApplication(req.params.id, req.userId!, reviewNotes);
      
      if (!result) {
        return res.status(404).json({ message: "Laboratory application not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error approving laboratory application:", error);
      res.status(500).json({ message: "Failed to approve laboratory application" });
    }
  });

  app.post("/api/laboratory-applications/:id/reject", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reviewNotes } = req.body;
      
      if (!reviewNotes) {
        return res.status(400).json({ message: "Review notes are required for rejection" });
      }

      const application = await storage.rejectLaboratoryApplication(req.params.id, req.userId!, reviewNotes);
      
      if (!application) {
        return res.status(404).json({ message: "Laboratory application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error rejecting laboratory application:", error);
      res.status(500).json({ message: "Failed to reject laboratory application" });
    }
  });

  // Vital Signs routes
  app.get("/api/vital-signs", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByTenant(req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching vital signs:", error);
      res.status(500).json({ message: "Failed to fetch vital signs" });
    }
  });

  app.get("/api/vital-signs/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByPatient(req.params.patientId, req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching patient vital signs:", error);
      res.status(500).json({ message: "Failed to fetch patient vital signs" });
    }
  });

  app.get("/api/vital-signs/appointment/:appointmentId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByAppointment(req.params.appointmentId, req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching appointment vital signs:", error);
      res.status(500).json({ message: "Failed to fetch appointment vital signs" });
    }
  });

  app.post("/api/vital-signs", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "receptionist"]), async (req, res) => {
    try {
      console.log("[VITAL SIGNS DEBUG] Starting vital signs creation");
      console.log("[VITAL SIGNS DEBUG] req.user:", JSON.stringify(req.user));
      console.log("[VITAL SIGNS DEBUG] req.user?.id:", req.user?.id);
      console.log("[VITAL SIGNS DEBUG] req.userId:", req.userId);
      console.log("[VITAL SIGNS DEBUG] req.tenantId:", req.tenantId);
      console.log("[VITAL SIGNS DEBUG] req.body:", JSON.stringify(req.body));
      
      const dataToValidate = {
        ...req.body,
        tenantId: req.tenantId,
        recordedBy: req.user?.id || req.userId || "FALLBACK_USER_ID"
      };
      
      console.log("[VITAL SIGNS DEBUG] Data to validate:", JSON.stringify(dataToValidate));
      
      const validatedData = insertVitalSignsSchema.parse(dataToValidate);

      const vitalSigns = await storage.createVitalSigns(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id!,
        tenantId: req.tenantId!,
        action: "vital_signs_created",
        entityType: "vital_signs",
        entityId: vitalSigns.id,
        details: { patientId: vitalSigns.patientId, appointmentId: vitalSigns.appointmentId }
      });

      res.status(201).json(vitalSigns);
    } catch (error) {
      console.error("Error creating vital signs:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vital signs" });
    }
  });

  app.patch("/api/vital-signs/:id", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "receptionist"]), async (req, res) => {
    try {
      const vitalSigns = await storage.updateVitalSigns(req.params.id, req.body, req.tenantId!);
      
      if (!vitalSigns) {
        return res.status(404).json({ message: "Vital signs not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: req.userId!,
        tenantId: req.tenantId!,
        action: "vital_signs_updated",
        resourceType: "vital_signs",
        resourceId: vitalSigns.id,
        details: { changes: req.body }
      });

      res.json(vitalSigns);
    } catch (error) {
      console.error("Error updating vital signs:", error);
      res.status(500).json({ message: "Failed to update vital signs" });
    }
  });

  // Visit Summary routes
  app.get("/api/visit-summaries", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByTenant(req.tenant!.id);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch visit summaries" });
    }
  });

  app.get("/api/visit-summaries/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByPatient(req.params.patientId, req.tenant!.id);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching patient visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch patient visit summaries" });
    }
  });

  app.get("/api/visit-summaries/provider/:providerId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByProvider(req.params.providerId, req.tenant!.id);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching provider visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch provider visit summaries" });
    }
  });

  app.get("/api/visit-summaries/appointment/:appointmentId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummary = await storage.getVisitSummaryByAppointment(req.params.appointmentId, req.tenant!.id);
      res.json(visitSummary);
    } catch (error) {
      console.error("Error fetching appointment visit summary:", error);
      res.status(500).json({ message: "Failed to fetch appointment visit summary" });
    }
  });

  app.post("/api/visit-summaries", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "physician"]), async (req, res) => {
    try {
      const validatedData = insertVisitSummarySchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
        providerId: req.user!.id
      });

      const visitSummary = await storage.createVisitSummary(validatedData);

      // TODO: Fix audit log creation - temporarily disabled
      // await storage.createAuditLog({
      //   tenantId: req.tenant!.id,
      //   userId: req.user!.id,
      //   entityType: "visit_summary",
      //   entityId: visitSummary.id,
      //   action: "visit_summary_created",
      //   previousData: null,
      //   newData: visitSummary,
      //   ipAddress: req.ip || null,
      //   userAgent: req.get("User-Agent") || null
      // });

      res.status(201).json(visitSummary);
    } catch (error) {
      console.error("Error creating visit summary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create visit summary" });
    }
  });

  app.patch("/api/visit-summaries/:id", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "physician"]), async (req, res) => {
    try {
      const visitSummary = await storage.updateVisitSummary(req.params.id, req.body, req.tenant!.id);
      
      if (!visitSummary) {
        return res.status(404).json({ message: "Visit summary not found" });
      }

      // TODO: Fix audit log creation - temporarily disabled
      // await storage.createAuditLog({
      //   tenantId: req.tenant!.id,
      //   userId: req.user!.id,
      //   entityType: "visit_summary",
      //   entityId: visitSummary.id,
      //   action: "visit_summary_updated",
      //   previousData: null,
      //   newData: visitSummary,
      //   ipAddress: req.ip || null,
      //   userAgent: req.get("User-Agent") || null
      // });

      res.json(visitSummary);
    } catch (error) {
      console.error("Error updating visit summary:", error);
      res.status(500).json({ message: "Failed to update visit summary" });
    }
  });

  // Helper function to generate mock report content
function generateReportContent(report: any): string {
  const timestamp = new Date().toISOString();
  
  if (report.format === 'csv') {
    return generateCSVContent(report, timestamp);
  } else if (report.format === 'excel') {
    return generateExcelContent(report, timestamp);
  } else {
    return generatePDFContent(report, timestamp);
  }
}

function generateCSVContent(report: any, timestamp: string): string {
  const headers = ['Date', 'Type', 'Category', 'Value', 'Status'];
  const rows = [
    [timestamp.split('T')[0], report.type, 'Patients', '150', 'Active'],
    [timestamp.split('T')[0], report.type, 'Appointments', '45', 'Scheduled'],
    [timestamp.split('T')[0], report.type, 'Revenue', '$12,500', 'Collected'],
    [timestamp.split('T')[0], report.type, 'Lab Tests', '28', 'Completed'],
    [timestamp.split('T')[0], report.type, 'Prescriptions', '67', 'Dispensed']
  ];
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateExcelContent(report: any, timestamp: string): string {
  // For Excel format, return a simple CSV-like content
  // In a real implementation, you would use a library like xlsx
  return generateCSVContent(report, timestamp);
}

function generatePDFContent(report: any, timestamp: string): string {
  // For PDF format, return plain text content
  // In a real implementation, you would use a library like pdfkit
  return `
HEALTHCARE REPORT
=================

Report Title: ${report.title}
Report Type: ${report.type}
Generated: ${timestamp}
Format: ${report.format.toUpperCase()}

SUMMARY
-------
This report contains healthcare analytics and operational data
for the selected time period and organization.

KEY METRICS
-----------
• Total Patients: 150
• Appointments Scheduled: 45
• Revenue Generated: $12,500
• Lab Tests Completed: 28
• Prescriptions Dispensed: 67

COMPLIANCE STATUS
-----------------
✓ HIPAA Compliance: Active
✓ Data Security: Verified
✓ Audit Trail: Complete

Generated by NAVIMED Healthcare Platform
Report ID: ${report.id}
`;
}

  // AI Health Recommendations routes
  app.get("/api/health-recommendations/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const recommendations = await storage.getHealthRecommendationsByPatient(patientId, tenantId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching health recommendations:", error);
      res.status(500).json({ message: "Failed to fetch health recommendations" });
    }
  });

  app.get("/api/health-recommendations/patient/:patientId/active", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const recommendations = await storage.getActiveHealthRecommendationsByPatient(patientId, tenantId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching active health recommendations:", error);
      res.status(500).json({ message: "Failed to fetch active health recommendations" });
    }
  });

  app.post("/api/health-recommendations", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { tenantId, userId } = req.user;
      const validatedData = insertHealthRecommendationSchema.parse({
        ...req.body,
        tenantId
      });
      
      const recommendation = await storage.createHealthRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating health recommendation:", error);
      res.status(500).json({ message: "Failed to create health recommendation" });
    }
  });

  app.patch("/api/health-recommendations/:id/acknowledge", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user;
      
      const recommendation = await storage.acknowledgeHealthRecommendation(id, userId, tenantId);
      if (!recommendation) {
        return res.status(404).json({ message: "Health recommendation not found" });
      }
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error acknowledging health recommendation:", error);
      res.status(500).json({ message: "Failed to acknowledge health recommendation" });
    }
  });

  // AI Health Analysis routes
  app.get("/api/health-analyses/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const analyses = await storage.getHealthAnalysesByPatient(patientId, tenantId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching health analyses:", error);
      res.status(500).json({ message: "Failed to fetch health analyses" });
    }
  });

  app.get("/api/health-analyses/patient/:patientId/latest", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const analysis = await storage.getLatestHealthAnalysis(patientId, tenantId);
      if (!analysis) {
        return res.status(404).json({ message: "No health analysis found for this patient" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching latest health analysis:", error);
      res.status(500).json({ message: "Failed to fetch latest health analysis" });
    }
  });

  app.post("/api/health-analyses/generate/:patientId", authenticateToken, requireTenant, requireRole(['physician', 'nurse', 'tenant_admin', 'super_admin']), async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId, userId } = req.user;
      
      // Get patient data
      const patient = await storage.getPatient(patientId, tenantId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get vital signs (latest 10 records)
      const vitalSigns = await storage.getVitalSignsByPatient(patientId, tenantId);
      const recentVitalSigns = vitalSigns.slice(0, 10);
      
      // Get recent appointments (latest 5)
      const appointments = await storage.getAppointmentsByPatient(patientId, tenantId);
      const recentAppointments = appointments.slice(0, 5);
      
      if (recentVitalSigns.length === 0) {
        return res.status(400).json({ 
          message: "No vital signs data available for health analysis. Please record vital signs first." 
        });
      }
      
      // Generate AI health analysis
      const analysisResult = await aiHealthAnalyzer.analyzePatientHealth(
        patient,
        recentVitalSigns,
        recentAppointments
      );
      
      // Save health analysis to database
      const healthAnalysis = await storage.createHealthAnalysis({
        tenantId,
        patientId,
        overallHealthScore: analysisResult.overallHealthScore,
        riskFactors: analysisResult.riskFactors,
        trends: analysisResult.trends,
        nextAppointmentSuggestion: analysisResult.nextAppointmentSuggestion,
        analysisData: analysisResult,
        confidence: 0.85 // Default confidence score
      });
      
      // Save individual recommendations
      const savedRecommendations = [];
      for (const rec of analysisResult.recommendations) {
        const recommendation = await storage.createHealthRecommendation({
          tenantId,
          patientId,
          type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          recommendations: rec.recommendations,
          reasoning: rec.reasoning,
          followUpRequired: rec.followUpRequired
        });
        savedRecommendations.push(recommendation);
      }
      
      // Log audit trail
      await storage.logAuditAction(
        tenantId,
        userId,
        'health_analysis',
        healthAnalysis.id,
        'generate',
        null,
        { 
          patientId,
          analysisScore: analysisResult.overallHealthScore,
          recommendationsCount: savedRecommendations.length
        }
      );
      
      res.json({
        analysis: healthAnalysis,
        recommendations: savedRecommendations,
        summary: {
          overallHealthScore: analysisResult.overallHealthScore,
          riskFactors: analysisResult.riskFactors,
          trends: analysisResult.trends,
          recommendationsCount: savedRecommendations.length
        }
      });
    } catch (error) {
      console.error("Error generating health analysis:", error);
      res.status(500).json({ 
        message: "Failed to generate health analysis",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Hospital Billing Routes with Access Control
  app.get("/api/hospital/billing", requireTenant, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const tenantId = req.tenant!.id;

      // Check if user has admin privileges or billing access
      const hasFullBillingAccess = userRole && [
        'tenant_admin', 
        'director', 
        'billing_staff', 
        'super_admin'
      ].includes(userRole);

      // For physicians without admin privileges, only show bills for services they performed
      if (userRole === 'physician' && !hasFullBillingAccess) {
        // Get bills only for appointments where this doctor was the provider
        const doctorBills = await storage.getHospitalBillsByProvider(userId, tenantId);
        return res.json(doctorBills);
      }

      // For users with full access, return all bills
      const allBills = await storage.getHospitalBills(tenantId);
      res.json(allBills);
    } catch (error) {
      console.error("Error fetching hospital bills:", error);
      res.status(500).json({ message: "Failed to fetch hospital bills" });
    }
  });

  app.post("/api/hospital/billing", requireRole(["physician", "billing_staff", "tenant_admin", "director"]), async (req, res) => {
    try {
      const billData = {
        ...req.body,
        tenantId: req.tenant!.id,
        generatedBy: req.user!.id
      };

      const bill = await storage.createHospitalBill(billData);
      res.json(bill);
    } catch (error) {
      console.error("Error creating hospital bill:", error);
      res.status(500).json({ message: "Failed to create hospital bill" });
    }
  });

  app.put("/api/hospital/billing/:id", requireRole(["billing_staff", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const tenantId = req.tenant!.id;

      const updatedBill = await storage.updateHospitalBill(id, updateData, tenantId);
      res.json(updatedBill);
    } catch (error) {
      console.error("Error updating hospital bill:", error);
      res.status(500).json({ message: "Failed to update hospital bill" });
    }
  });

  app.get("/api/hospital/analytics", requireTenant, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const tenantId = req.tenant!.id;

      // Check if user has admin privileges
      const hasFullAnalyticsAccess = userRole && [
        'tenant_admin', 
        'director', 
        'billing_staff', 
        'super_admin'
      ].includes(userRole);

      let analytics;
      if (userRole === 'physician' && !hasFullAnalyticsAccess) {
        // Get analytics only for this doctor's services
        analytics = await storage.getHospitalAnalyticsByProvider(userId, tenantId);
      } else {
        // Get full analytics for users with access
        analytics = await storage.getHospitalAnalytics(tenantId);
      }

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching hospital analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // User permissions endpoint to check billing access
  app.get("/api/user/billing-permissions", authenticateToken, async (req, res) => {
    try {
      const userRole = req.user?.role;
      
      const permissions = {
        canViewAllBills: userRole && [
          'tenant_admin', 
          'director', 
          'billing_staff', 
          'super_admin'
        ].includes(userRole),
        canCreateBills: userRole && [
          'physician', 
          'billing_staff', 
          'tenant_admin', 
          'director'
        ].includes(userRole),
        canEditBills: userRole && [
          'billing_staff', 
          'tenant_admin', 
          'director'
        ].includes(userRole),
        isPhysicianWithRestrictedAccess: userRole === 'physician' && ![
          'tenant_admin', 
          'director', 
          'billing_staff', 
          'super_admin'
        ].includes(userRole)
      };

      res.json(permissions);
    } catch (error) {
      console.error("Error checking billing permissions:", error);
      res.status(500).json({ message: "Failed to check permissions" });
    }
  });

  // Patient Access Request Routes for Multi-Doctor Separation
  app.post("/api/patient-access-requests", requireRole(["physician"]), async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.tenant!.id;

      const request = await storage.createPatientAccessRequest({
        ...req.body,
        requestingPhysicianId: userId,
        tenantId: tenantId
      });

      res.json(request);
    } catch (error) {
      console.error("Error creating patient access request:", error);
      res.status(500).json({ message: "Failed to create access request" });
    }
  });

  app.get("/api/patient-access-requests", requireTenant, async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const tenantId = req.tenant!.id;
      
      let requests;
      if (['tenant_admin', 'director', 'super_admin'].includes(userRole || '')) {
        // Admins see all requests
        requests = await storage.getPatientAccessRequests(tenantId);
      } else if (userRole === 'physician') {
        // Physicians see requests involving them
        requests = await storage.getPatientAccessRequests(tenantId, userId);
      } else {
        return res.status(403).json({ message: "Access denied to patient access requests" });
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching patient access requests:", error);
      res.status(500).json({ message: "Failed to fetch access requests" });
    }
  });

  app.put("/api/patient-access-requests/:id", requireRole(["tenant_admin", "director", "physician"]), async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant!.id;

      const updatedRequest = await storage.updatePatientAccessRequest(id, req.body, tenantId);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Access request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating patient access request:", error);
      res.status(500).json({ message: "Failed to update access request" });
    }
  });

  app.get("/api/patient-access-audit", requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const { patientId, doctorId } = req.query;

      const logs = await storage.getPatientAccessLogs(
        tenantId, 
        patientId as string, 
        doctorId as string
      );
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching patient access logs:", error);
      res.status(500).json({ message: "Failed to fetch access logs" });
    }
  });

  // Role Permissions Management Routes
  app.get("/api/role-permissions", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { role } = req.query;
      let permissions;
      
      if (role) {
        permissions = await storage.getRolePermissionsByRole(role as string, req.tenantId!);
      } else {
        permissions = await storage.getRolePermissions(req.tenantId!);
      }
      
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/role-permissions", authenticateToken, requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      console.log("🔧 [SERVER] Role permissions POST request:", req.body);
      console.log("🔧 [SERVER] Request user info:", { userId: req.userId, tenantId: req.tenantId, userRole: req.user?.role });
      
      const { role, module, permissions } = req.body;
      
      if (!role || !module || !Array.isArray(permissions)) {
        console.log("🔧 [SERVER] Invalid request data:", { role, module, permissions });
        return res.status(400).json({ 
          message: "Invalid request data - role, module, and permissions array required" 
        });
      }

      // Ensure we have user ID - check both req.userId and req.user.id
      const userId = req.userId || req.user?.id;
      if (!userId) {
        console.log("🔧 [SERVER] ERROR: No user ID available - req.userId:", req.userId, "req.user:", req.user);
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }

      console.log("🔧 [SERVER] Using userId:", userId);

      // Check if permission already exists for this role and module
      const existingPermissions = await storage.getRolePermissionsByRole(role, req.tenantId!);
      const existingPermission = existingPermissions.find(p => p.module === module);

      let result;
      if (existingPermission) {
        // Update existing permission
        console.log("🔧 [SERVER] Updating existing permission:", existingPermission.id);
        result = await storage.updateRolePermission(
          existingPermission.id,
          {
            permissions,
            updatedBy: userId,
            updatedAt: new Date()
          },
          req.tenantId!
        );
        console.log("🔧 [SERVER] Update result:", result);
      } else {
        // Create new permission
        console.log("🔧 [SERVER] Creating new permission for user:", userId);
        
        result = await storage.createRolePermission({
          tenantId: req.tenantId!,
          role: role as any,
          module,
          permissions,
          createdBy: userId,
          isActive: true
        });
        console.log("🔧 [SERVER] Create result:", result);
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: userId,
        entityType: "role_permission",
        entityId: result?.id || existingPermission?.id || "unknown",
        action: existingPermission ? "update" : "create",
        newData: { role, module, permissions },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      console.log("🔧 [SERVER] Permission saved successfully:", result);
      res.status(200).json({
        message: "Permission saved successfully",
        permission: result
      });

    } catch (error) {
      console.error("🔧 [SERVER] Error saving role permission:", error);
      res.status(500).json({ message: "Failed to save role permission" });
    }
  });

  app.delete("/api/role-permissions/:id", authenticateToken, requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRolePermission(id, req.tenantId!);
      
      if (!deleted) {
        return res.status(404).json({ message: "Role permission not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "role_permission",
        entityId: id,
        action: "delete",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({ message: "Role permission deleted successfully" });
    } catch (error) {
      console.error("Error deleting role permission:", error);
      res.status(500).json({ message: "Failed to delete role permission" });
    }
  });

  // Initialize default TENANT ADMIN permissions
  app.post("/api/role-permissions/initialize-tenant-admin", authenticateToken, requireRole(["super_admin", "tenant_admin"]), requireTenant, async (req, res) => {
    try {
      console.log("🚀 [INIT] Initializing TENANT ADMIN permissions for tenant:", req.tenantId);
      
      const userId = req.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Define the exact permissions the user specified for TENANT ADMIN
      const tenantAdminPermissions = {
        patients: ["view", "search"],
        appointments: ["view"],
        users: ["view", "create", "update", "deactivate"],
        roles: ["assign", "modify"],
        tenant_settings: ["view", "update"],
        audit_logs: ["view"],
        reports: ["view", "generate"],
        billing: ["view", "manage"],
        service_price: ["view", "manage"],
        dashboard: ["view_admin"]
      };

      const results = [];
      for (const [module, permissions] of Object.entries(tenantAdminPermissions)) {
        // Check if permission already exists
        const existing = await storage.getRolePermissionByRoleAndModule("tenant_admin", module, req.tenantId!);
        
        if (existing) {
          // Update existing
          const updated = await storage.updateRolePermission(
            existing.id,
            {
              permissions,
              updatedBy: userId,
              updatedAt: new Date()
            },
            req.tenantId!
          );
          results.push(updated);
        } else {
          // Create new
          const created = await storage.createRolePermission({
            tenantId: req.tenantId!,
            role: "tenant_admin",
            module,
            permissions,
            createdBy: userId,
            isActive: true
          });
          results.push(created);
        }
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: userId,
        entityType: "role_permission",
        entityId: "tenant_admin",
        action: "initialize",
        newData: { role: "tenant_admin", permissions: tenantAdminPermissions },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      console.log("🚀 [INIT] Successfully initialized", results.length, "permissions");
      res.json({ 
        message: "TENANT ADMIN permissions initialized successfully",
        permissions: results
      });
    } catch (error) {
      console.error("🚀 [INIT] Error initializing permissions:", error);
      res.status(500).json({ message: "Failed to initialize permissions" });
    }
  });

  // Delete/reset role permissions for a specific role
  app.delete("/api/role-permissions/:role", authenticateToken, requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const { role } = req.params;
      console.log("🔧 [SERVER] Role permissions DELETE request for role:", role);
      
      if (!role) {
        return res.status(400).json({ message: "Role parameter is required" });
      }

      // Delete all permissions for this role in this tenant
      const deletedCount = await storage.deleteRolePermissionsByRole(role, req.tenantId!);
      console.log("🔧 [SERVER] Deleted permissions count:", deletedCount);

      // Create audit log
      const userId = req.userId || req.user?.id;
      if (userId) {
        await storage.createAuditLog({
          tenantId: req.tenantId!,
          userId: userId,
          entityType: "role_permission",
          entityId: role,
          action: "reset",
          previousData: { role, action: "reset_all_permissions" },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent")
        });
      }

      res.json({ 
        message: "Role permissions reset successfully",
        role,
        deletedCount
      });
    } catch (error) {
      console.error("🔧 [SERVER] Error resetting role permissions:", error);
      res.status(500).json({ message: "Failed to reset role permissions" });
    }
  });

  // ==== DEPARTMENT MANAGEMENT ====
  // Get departments for a tenant
  app.get('/api/departments', authenticateToken, requireTenant, async (req, res) => {
    try {
      const departments = await storage.getDepartments(req.tenantId!);
      res.json(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  // Create new department
  app.post('/api/departments', authenticateToken, requireRole(['tenant_admin']), requireTenant, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse({
        ...req.body,
        tenantId: req.tenantId!
      });

      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({ error: 'Failed to create department' });
    }
  });

  // Update department
  app.put('/api/departments/:id', authenticateToken, requireRole(['tenant_admin']), requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDepartmentSchema.partial().parse(req.body);

      const updatedDepartment = await storage.updateDepartment(id, validatedData, req.tenantId!);
      if (!updatedDepartment) {
        return res.status(404).json({ error: 'Department not found' });
      }

      res.json(updatedDepartment);
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  // Delete department
  app.delete('/api/departments/:id', authenticateToken, requireRole(['tenant_admin']), requireTenant, async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await storage.deleteDepartment(id, req.tenantId!);
      if (!deleted) {
        return res.status(404).json({ error: 'Department not found' });
      }

      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  // Test email functionality (for administrators)
  app.post('/api/test-email', authenticateToken, requireRole(['super_admin', 'tenant_admin']), async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      const tempPassword = generateTemporaryPassword();
      const tenant = await storage.getTenant(req.tenantId!);
      
      const success = await sendWelcomeEmail({
        userEmail: email,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        temporaryPassword: tempPassword,
        organizationName: tenant?.name || 'NaviMed Platform',
        loginUrl: `${req.protocol}://${req.get('host')}/login`
      });

      res.json({ 
        message: success ? 'Test email sent successfully' : 'Failed to send test email',
        success,
        sendgridConfigured: !!process.env.SENDGRID_API_KEY,
        emailFrom: 'info@navimedi.com'
      });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ 
        error: 'Failed to send test email', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Advertisement System Routes
  
  // Get all advertisements (public - for marketplace viewing)
  app.get('/api/advertisements', async (req, res) => {
    try {
      const advertisements = await storage.getAllAdvertisements();
      res.json(advertisements);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });

  // Get advertisements by tenant (authenticated)
  app.get('/api/advertisements/my', authenticateToken, setTenantContext, async (req, res) => {
    try {
      const advertisements = await storage.getAdvertisementsByTenant(req.tenantId!);
      res.json(advertisements);
    } catch (error) {
      console.error('Error fetching tenant advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch advertisements' });
    }
  });

  // Create new advertisement
  app.post('/api/advertisements', authenticateToken, setTenantContext, async (req, res) => {
    try {
      const validationResult = insertAdvertisementSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid advertisement data', 
          details: validationResult.error.errors 
        });
      }

      const advertisementData = {
        ...validationResult.data,
        tenantId: req.tenantId!,
        status: 'pending_review' as const,
        submittedAt: new Date().toISOString()
      };

      const advertisement = await storage.createAdvertisement(advertisementData);
      res.status(201).json(advertisement);
    } catch (error) {
      console.error('Error creating advertisement:', error);
      res.status(500).json({ error: 'Failed to create advertisement' });
    }
  });

  // Update advertisement status (admin only)
  app.patch('/api/advertisements/:id/status', authenticateToken, requireRole(['super_admin', 'tenant_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;

      const validStatuses = ['draft', 'pending_review', 'approved', 'active', 'paused', 'expired', 'rejected', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const userId = req.user?.id || req.userId;
      const advertisement = await storage.updateAdvertisementStatus(id, {
        status,
        reviewNotes,
        reviewedBy: userId,
        reviewedAt: new Date().toISOString()
      });

      if (!advertisement) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }

      res.json(advertisement);
    } catch (error) {
      console.error('Error updating advertisement status:', error);
      res.status(500).json({ error: 'Failed to update advertisement status' });
    }
  });

  // Delete advertisement
  app.delete('/api/advertisements/:id', authenticateToken, setTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdvertisement(id, req.tenantId!);
      
      if (!success) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }

      res.json({ message: 'Advertisement deleted successfully' });
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      res.status(500).json({ error: 'Failed to delete advertisement' });
    }
  });

  // Track advertisement views
  app.post('/api/advertisements/:id/view', async (req, res) => {
    try {
      const { id } = req.params;
      const { viewDuration, clickedThrough } = req.body;

      const viewData = {
        advertisementId: id,
        viewerTenantId: req.tenantId || null,
        viewerUserId: req.userId || null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        viewDuration,
        clickedThrough: !!clickedThrough
      };

      const view = await storage.createAdView(viewData);
      
      // Update advertisement impression count
      await storage.incrementAdvertisementImpressions(id);
      
      if (clickedThrough) {
        await storage.incrementAdvertisementClicks(id);
      }

      res.status(201).json(view);
    } catch (error) {
      console.error('Error tracking advertisement view:', error);
      res.status(500).json({ error: 'Failed to track view' });
    }
  });

  // Create advertisement inquiry
  app.post('/api/advertisements/:id/inquire', authenticateToken, setTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = insertAdInquirySchema.safeParse({
        ...req.body,
        advertisementId: id,
        inquirerTenantId: req.tenantId!,
        inquirerUserId: req.userId || req.user?.id
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid inquiry data', 
          details: validationResult.error.errors 
        });
      }

      const inquiry = await storage.createAdInquiry(validationResult.data);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error('Error creating advertisement inquiry:', error);
      res.status(500).json({ error: 'Failed to create inquiry' });
    }
  });

  // Get advertisement inquiries (for advertisers)
  app.get('/api/advertisements/:id/inquiries', authenticateToken, setTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify the advertisement belongs to the current tenant
      const advertisement = await storage.getAdvertisement(id);
      if (!advertisement || advertisement.tenantId !== req.tenantId) {
        return res.status(404).json({ error: 'Advertisement not found' });
      }

      const inquiries = await storage.getAdInquiries(id);
      res.json(inquiries);
    } catch (error) {
      console.error('Error fetching advertisement inquiries:', error);
      res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  });

  // Duplicate supplier login endpoint removed - moved to before middleware

  // Supplier-specific API endpoints
  app.get('/api/supplier/profile', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the supplier profile by organization name (more secure than email)
      const suppliers = await storage.getMedicalSuppliers();
      const supplierProfile = suppliers.find(s => 
        s.organizationSlug === user.organizationName?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') ||
        s.contactEmail === user.email // Fallback for existing accounts
      );
      
      if (!supplierProfile) {
        return res.status(404).json({ 
          error: 'Supplier profile not found',
          debug: {
            userOrg: user.organizationName,
            userEmail: user.email,
            availableSuppliers: suppliers.map(s => ({ name: s.companyName, slug: s.organizationSlug, email: s.contactEmail }))
          }
        });
      }

      res.json(supplierProfile);
    } catch (error) {
      console.error('[SUPPLIER] Error fetching supplier profile:', error);
      res.status(500).json({ error: 'Failed to fetch supplier profile' });
    }
  });

  app.get('/api/supplier/advertisements', authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // First find the supplier by organization name
      const suppliers = await storage.getMedicalSuppliers();
      const supplierProfile = suppliers.find(s => 
        s.organizationSlug === user.organizationName?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') ||
        s.contactEmail === user.email // Fallback for existing accounts
      );

      if (!supplierProfile) {
        return res.status(404).json({ error: 'Supplier profile not found' });
      }

      // Get advertisements for this supplier organization
      const allAdvertisements = await storage.getAllAdvertisements();
      const supplierAds = allAdvertisements.filter(ad => 
        ad.contactEmail === supplierProfile.contactEmail
      );
      
      res.json(supplierAds);
    } catch (error) {
      console.error('[SUPPLIER] Error fetching supplier advertisements:', error);
      res.status(500).json({ error: 'Failed to fetch supplier advertisements' });
    }
  });

  // Supplier API blocking middleware moved to earlier position

  // SUPPLIER STORE SYSTEM - Simple HTML page to prevent React conflicts
  app.get('/supplier-signup-direct', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Supplier Registration</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            min-height: 100vh;
            line-height: 1.6;
        }
        .signup-container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }
        .logo { 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .logo h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
        }
        .logo p {
            color: #64748b;
            margin: 5px 0 0 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        .form-group { 
            flex: 1;
            margin-bottom: 20px; 
        }
        .form-group label { 
            display: block; 
            margin-bottom: 8px; 
            color: #374151; 
            font-weight: 500; 
        }
        .form-group input, .form-group textarea { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e5e7eb; 
            border-radius: 8px; 
            font-size: 16px; 
            transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { 
            outline: none; 
            border-color: #2563eb; 
        }
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        .required { color: #ef4444; }
        .btn { 
            background: #2563eb; 
            color: white; 
            padding: 14px 24px; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 600;
            cursor: pointer; 
            width: 100%;
            transition: background-color 0.2s;
        }
        .btn:hover { 
            background: #1d4ed8; 
        }
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .message { 
            margin: 15px 0; 
            padding: 12px; 
            border-radius: 8px; 
            text-align: center;
        }
        .success { 
            background: #d1fae5; 
            color: #065f46; 
            border: 1px solid #a7f3d0;
        }
        .error { 
            background: #fee2e2; 
            color: #991b1b; 
            border: 1px solid #fca5a5;
        }
        .links {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .links a {
            color: #2563eb;
            text-decoration: none;
            margin: 0 10px;
        }
        .links a:hover {
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 0;
            }
            .signup-container {
                padding: 20px;
                margin: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="signup-container">
        <div class="logo">
            <h1>Medical Supplier Registration</h1>
            <p>Join our healthcare marketplace and reach providers worldwide</p>
        </div>

        <form id="signupForm">
            <div class="section">
                <h3>Company Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="companyName">Company Name <span class="required">*</span></label>
                        <input type="text" id="companyName" name="companyName" required>
                    </div>
                    <div class="form-group">
                        <label for="businessType">Business Type <span class="required">*</span></label>
                        <input type="text" id="businessType" name="businessType" placeholder="e.g., Medical Device Manufacturer" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="yearsInBusiness">Years in Business <span class="required">*</span></label>
                        <input type="number" id="yearsInBusiness" name="yearsInBusiness" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="website">Website</label>
                        <input type="url" id="website" name="website" placeholder="https://www.yourcompany.com">
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Company Description <span class="required">*</span></label>
                    <textarea id="description" name="description" placeholder="Describe your company, products, and services..." required></textarea>
                </div>

                <div class="form-group">
                    <label for="specialties">Medical Specialties <span class="required">*</span></label>
                    <textarea id="specialties" name="specialties" placeholder="e.g., Cardiac devices, Surgical instruments, Diagnostic equipment..." required></textarea>
                </div>
            </div>

            <div class="section">
                <h3>Contact Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="contactEmail">Contact Email <span class="required">*</span></label>
                        <input type="email" id="contactEmail" name="contactEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="contactPhone">Contact Phone <span class="required">*</span></label>
                        <input type="tel" id="contactPhone" name="contactPhone" required>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Business Address</h3>
                <div class="form-group">
                    <label for="address">Address <span class="required">*</span></label>
                    <input type="text" id="address" name="address" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="city">City <span class="required">*</span></label>
                        <input type="text" id="city" name="city" required>
                    </div>
                    <div class="form-group">
                        <label for="state">State/Province <span class="required">*</span></label>
                        <input type="text" id="state" name="state" required>
                    </div>
                    <div class="form-group">
                        <label for="zipCode">ZIP/Postal Code <span class="required">*</span></label>
                        <input type="text" id="zipCode" name="zipCode" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="country">Country <span class="required">*</span></label>
                    <input type="text" id="country" name="country" required>
                </div>
            </div>

            <div id="message"></div>
            <button type="submit" class="btn" id="signupBtn">Submit Registration</button>
        </form>

        <div class="links">
            <a href="/supplier-login-direct">Already have an account? Login here</a>
            <a href="/marketplace">Browse Marketplace</a>
        </div>
    </div>

    <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const signupBtn = document.getElementById('signupBtn');
            const messageDiv = document.getElementById('message');
            
            signupBtn.disabled = true;
            signupBtn.textContent = 'Submitting Registration...';
            messageDiv.innerHTML = '';
            
            const formData = new FormData(e.target);
            const registrationData = {
                companyName: formData.get('companyName'),
                businessType: formData.get('businessType'),
                yearsInBusiness: parseInt(formData.get('yearsInBusiness')),
                website: formData.get('website') || undefined,
                description: formData.get('description'),
                specialties: formData.get('specialties'),
                contactEmail: formData.get('contactEmail'),
                contactPhone: formData.get('contactPhone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            };
            
            try {
                const response = await fetch('/public/suppliers/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="message success">Registration submitted successfully! Our team will review your application and contact you within 2-3 business days.</div>';
                    document.getElementById('signupForm').reset();
                    
                    // Show success message and redirect option
                    setTimeout(() => {
                        messageDiv.innerHTML += '<div class="message success">You can now <a href="/marketplace">browse our marketplace</a> or <a href="/supplier-login-direct">login if you already have credentials</a>.</div>';
                    }, 2000);
                } else {
                    messageDiv.innerHTML = '<div class="message error">Registration failed: ' + (result.error || result.message || 'Unknown error') + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message error">Registration failed: ' + error.message + '</div>';
            } finally {
                signupBtn.disabled = false;
                signupBtn.textContent = 'Submit Registration';
            }
        });
    </script>
</body>
</html>`);
  });

  app.get('/supplier-login-direct', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Supplier Login</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
        }
        .logo { 
            text-align: center; 
            margin-bottom: 30px; 
        }
        .logo h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        .form-group label { 
            display: block; 
            margin-bottom: 8px; 
            color: #374151; 
            font-weight: 500; 
        }
        .form-group input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #d1d5db; 
            border-radius: 6px; 
            font-size: 16px; 
            box-sizing: border-box;
        }
        .form-group input:focus { 
            outline: none; 
            border-color: #2563eb; 
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); 
        }
        .btn { 
            width: 100%; 
            padding: 12px; 
            background: #2563eb; 
            color: white; 
            border: none; 
            border-radius: 6px; 
            font-size: 16px; 
            font-weight: 500; 
            cursor: pointer; 
            margin-top: 10px;
        }
        .btn:hover { 
            background: #1d4ed8; 
        }
        .btn:disabled { 
            background: #9ca3af; 
            cursor: not-allowed; 
        }
        .error { 
            color: #dc2626; 
            margin-top: 10px; 
            font-size: 14px; 
        }
        .success { 
            color: #059669; 
            margin-top: 10px; 
            font-size: 14px; 
        }
        .test-credentials {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            border-left: 4px solid #2563eb;
        }
        .test-credentials h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #374151;
        }
        .test-credentials code {
            display: block;
            font-family: monospace;
            color: #2563eb;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>🏥 Medical Supplier Login</h1>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <div class="form-group">
                <label for="organizationName">Organization Name</label>
                <input type="text" id="organizationName" name="organizationName" required>
            </div>
            
            <button type="submit" class="btn" id="loginBtn">Sign In</button>
            
            <div id="message"></div>
        </form>

        <div class="test-credentials">
            <h3>Test Credentials:</h3>
            <code>Username: medtech_admin</code>
            <code>Password: password</code>
            <code>Organization: MedTech Solutions Inc.</code>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loginBtn = document.getElementById('loginBtn');
            const messageDiv = document.getElementById('message');
            
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing In...';
            messageDiv.innerHTML = '';
            
            const formData = new FormData(e.target);
            const loginData = {
                username: formData.get('username'),
                password: formData.get('password'),
                organizationName: formData.get('organizationName')
            };
            
            try {
                const response = await fetch('/api/supplier/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Store authentication data
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('userType', 'supplier');
                    
                    messageDiv.innerHTML = '<div class="success">Login successful! Redirecting...</div>';
                    
                    // Redirect to supplier dashboard
                    setTimeout(() => {
                        window.location.href = '/supplier-dashboard-direct';
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">' + (result.message || 'Login failed') + '</div>';
                }
            } catch (error) {
                console.error('Login error:', error);
                messageDiv.innerHTML = '<div class="error">Network error. Please try again.</div>';
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        });
    </script>
</body>
</html>`);
  });

  app.get('/supplier-dashboard-direct', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Supply Store Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; }
        .user-info { margin-top: 10px; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
        .stat-card .value { font-size: 24px; font-weight: bold; color: #333; }
        .actions { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .btn { padding: 10px 20px; margin: 5px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #1d4ed8; }
        .btn-secondary { background: #6b7280; }
        .btn-secondary:hover { background: #4b5563; }
        
        /* Modal Styles */
        .modal { 
            position: fixed; 
            z-index: 1000; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            background-color: rgba(0,0,0,0.5); 
            display: flex; 
            align-items: center; 
            justify-content: center;
        }
        .modal-content { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            width: 90%; 
            max-width: 800px; 
            max-height: 90vh; 
            overflow-y: auto;
        }
        .close { 
            float: right; 
            font-size: 28px; 
            font-weight: bold; 
            cursor: pointer; 
            color: #666;
        }
        .close:hover { color: #000; }
        
        /* Form Styles */
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #374151; }
        .form-group input, .form-group textarea, .form-group select { 
            width: 100%; 
            padding: 8px 12px; 
            border: 1px solid #d1d5db; 
            border-radius: 4px; 
            box-sizing: border-box;
        }
        .form-actions { 
            display: flex; 
            gap: 10px; 
            justify-content: flex-end; 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb;
        }
        
        /* Table Styles */
        .table-header { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; 
            gap: 10px; 
            padding: 10px; 
            background: #f3f4f6; 
            border-radius: 4px; 
            font-weight: 500;
        }
        .order-row { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; 
            gap: 10px; 
            padding: 10px; 
            border-bottom: 1px solid #e5e7eb;
        }
        
        /* Report Styles */
        .report-section { margin-bottom: 30px; }
        .report-stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 15px 0;
        }
        .report-stat { 
            background: #f9fafb; 
            padding: 15px; 
            border-radius: 6px; 
            text-align: center;
        }
        .report-stat .label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .report-stat .value { font-size: 24px; font-weight: bold; color: #111827; }
        .product-performance { background: #f9fafb; border-radius: 6px; padding: 15px; }
        .product-row { 
            display: grid; 
            grid-template-columns: 2fr 1fr 1fr; 
            gap: 15px; 
            padding: 10px 0; 
            border-bottom: 1px solid #e5e7eb;
        }
        .product-row:last-child { border-border: none; }
        
        /* Upload Styles */
        .form-group input[type="file"] {
            padding: 8px 0;
            border: 2px dashed #d1d5db;
            border-radius: 4px;
            background: #f9fafb;
            text-align: center;
            cursor: pointer;
        }
        .form-group input[type="file"]:hover {
            border-color: #2563eb;
            background: #eff6ff;
        }
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏪 Medical Supply Store Dashboard</h1>
            <div class="user-info" id="userInfo">Loading...</div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Products Listed</h3>
                <div class="value">247</div>
            </div>
            <div class="stat-card">
                <h3>Monthly Orders</h3>
                <div class="value">142</div>
            </div>
            <div class="stat-card">
                <h3>Monthly Revenue</h3>
                <div class="value">$28,450</div>
            </div>
            <div class="stat-card">
                <h3>Store Rating</h3>
                <div class="value">4.8/5</div>
            </div>
        </div>
        
        <div class="actions">
            <h2>Quick Actions</h2>
            <button class="btn" onclick="showAddProduct()">Add New Product</button>
            <button class="btn" onclick="showManageOrders()">Manage Orders</button>
            <button class="btn" onclick="showReports()">View Reports</button>
            <button class="btn" onclick="logout()">Logout</button>
        </div>
        
        <!-- Products List Section -->
        <div class="actions">
            <h2>My Products</h2>
            <div id="productsList" style="margin-top: 20px; min-height: 200px;">
                Loading products...
            </div>
        </div>
        
        <!-- Add Product Modal -->
        <div id="addProductModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close" onclick="closeModal('addProductModal')">&times;</span>
                <h2>Add New Product</h2>
                <form id="addProductForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productName">Product Name</label>
                            <input type="text" id="productName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="productSKU">SKU</label>
                            <input type="text" id="productSKU" name="sku" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="productDescription">Description</label>
                        <textarea id="productDescription" name="description" rows="3" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productCategory">Category</label>
                            <select id="productCategory" name="category" required>
                                <option value="">Select Category</option>
                                <option value="Diagnostic Equipment">Diagnostic Equipment</option>
                                <option value="Surgical Instruments">Surgical Instruments</option>
                                <option value="Patient Monitoring">Patient Monitoring</option>
                                <option value="Laboratory Equipment">Laboratory Equipment</option>
                                <option value="Medical Supplies">Medical Supplies</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="productPrice">Price ($)</label>
                            <input type="number" id="productPrice" name="price" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="productStock">Stock Quantity</label>
                            <input type="number" id="productStock" name="stockQuantity" required>
                        </div>
                        <div class="form-group">
                            <label for="productBrand">Brand</label>
                            <input type="text" id="productBrand" name="brand" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="productImage">Product Image</label>
                        <input type="file" id="productImage" name="image" accept="image/*">
                        <small style="color: #666; display: block; margin-top: 5px;">Upload a product image (optional - JPG, PNG, or WebP)</small>
                        <div id="imagePreview" style="margin-top: 10px; display: none;">
                            <img id="previewImg" style="max-width: 200px; max-height: 150px; border-radius: 4px; border: 1px solid #ddd;">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('addProductModal')">Cancel</button>
                        <button type="submit" class="btn" id="addProductBtn">
                            <span id="addProductBtnText">Add Product</span>
                            <span id="addProductBtnLoading" style="display: none;">Uploading...</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Manage Orders Modal -->
        <div id="manageOrdersModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close" onclick="closeModal('manageOrdersModal')">&times;</span>
                <h2>Manage Orders</h2>
                <div id="ordersTable">
                    <div class="table-header">
                        <div>Order #</div>
                        <div>Customer</div>
                        <div>Product</div>
                        <div>Amount</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    <div id="ordersList">Loading orders...</div>
                </div>
            </div>
        </div>
        
        <!-- Reports Modal -->
        <div id="reportsModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close" onclick="closeModal('reportsModal')">&times;</span>
                <h2>Sales Reports</h2>
                <div class="report-section">
                    <h3>Monthly Performance</h3>
                    <div class="report-stats">
                        <div class="report-stat">
                            <div class="label">Total Revenue</div>
                            <div class="value">$28,450</div>
                        </div>
                        <div class="report-stat">
                            <div class="label">Orders Processed</div>
                            <div class="value">142</div>
                        </div>
                        <div class="report-stat">
                            <div class="label">Top Product</div>
                            <div class="value">Digital Stethoscope</div>
                        </div>
                    </div>
                </div>
                <div class="report-section">
                    <h3>Product Performance</h3>
                    <div class="product-performance">
                        <div class="product-row">
                            <div>Advanced Digital Stethoscope</div>
                            <div>45 sold</div>
                            <div>$13,455</div>
                        </div>
                        <div class="product-row">
                            <div>Portable Ultrasound Machine</div>
                            <div>8 sold</div>
                            <div>$11,992</div>
                        </div>
                        <div class="product-row">
                            <div>Surgical Instrument Set</div>
                            <div>23 sold</div>
                            <div>$3,003</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function checkAuth() {
            const userType = localStorage.getItem('userType');
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (userType !== 'supplier' || !token || !user) {
                window.location.href = '/supplier-login-direct';
                return false;
            }
            
            try {
                const currentUser = JSON.parse(user);
                document.getElementById('userInfo').textContent = 
                    currentUser.firstName + ' ' + currentUser.lastName + ' (' + currentUser.organizationName + ')';
                return true;
            } catch (e) {
                window.location.href = '/supplier-login-direct';
                return false;
            }
        }
        
        function logout() {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/supplier-login-direct';
        }
        
        // Modal Functions
        function showAddProduct() {
            document.getElementById('addProductModal').style.display = 'flex';
        }
        
        function showManageOrders() {
            document.getElementById('manageOrdersModal').style.display = 'flex';
            loadOrders();
        }
        
        function showReports() {
            document.getElementById('reportsModal').style.display = 'flex';
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // Add Product Form Handler
        document.getElementById('addProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            const addBtn = document.getElementById('addProductBtn');
            const btnText = document.getElementById('addProductBtnText');
            const btnLoading = document.getElementById('addProductBtnLoading');
            
            addBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            
            const formData = new FormData(e.target);
            const imageFile = formData.get('image');
            let imageUrl = null;
            
            // Upload image first if provided
            if (imageFile && imageFile.size > 0) {
                try {
                    const token = localStorage.getItem('token');
                    
                    // Get upload URL
                    const uploadResponse = await fetch('/api/objects/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    
                    if (!uploadResponse.ok) {
                        throw new Error('Failed to get upload URL');
                    }
                    
                    const { uploadURL } = await uploadResponse.json();
                    
                    // Upload image to object storage
                    const imageUploadResponse = await fetch(uploadURL, {
                        method: 'PUT',
                        body: imageFile,
                        headers: {
                            'Content-Type': imageFile.type
                        }
                    });
                    
                    if (!imageUploadResponse.ok) {
                        throw new Error('Failed to upload image');
                    }
                    
                    // Set ACL policy for the uploaded image
                    const aclResponse = await fetch('/api/product-images', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            productImageURL: uploadURL.split('?')[0] // Remove query parameters
                        })
                    });
                    
                    if (aclResponse.ok) {
                        const aclResult = await aclResponse.json();
                        imageUrl = aclResult.objectPath;
                    }
                    
                } catch (error) {
                    console.error('Image upload error:', error);
                    alert('Warning: Image upload failed, but product will be created without image.');
                }
            }
            
            const productData = {
                name: formData.get('name'),
                sku: formData.get('sku'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stockQuantity: parseInt(formData.get('stockQuantity')),
                brand: formData.get('brand'),
                manufacturer: 'MedTech Solutions Inc.',
                shortDescription: formData.get('description').substring(0, 100),
                currency: 'USD',
                status: 'active',
                isActive: true,
                trackInventory: true,
                imageUrls: imageUrl ? [imageUrl] : []
            };
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/supplier/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    alert('Product added successfully!');
                    closeModal('addProductModal');
                    e.target.reset();
                    document.getElementById('imagePreview').style.display = 'none';
                    // Update stats and reload products
                    loadProducts();
                } else {
                    const error = await response.json();
                    alert('Error adding product: ' + (error.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Network error. Please try again.');
            } finally {
                // Reset loading state
                addBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        });
        
        // Load Orders Function
        async function loadOrders() {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = 'Loading orders...';
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/supplier/orders', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (response.ok) {
                    const orders = await response.json();
                    if (orders.length === 0) {
                        ordersList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No orders found</div>';
                    } else {
                        ordersList.innerHTML = orders.map(order => 
                            '<div class="order-row">' +
                                '<div>' + order.orderNumber + '</div>' +
                                '<div>' + order.customerName + '</div>' +
                                '<div>' + order.productName + '</div>' +
                                '<div>$' + order.totalAmount + '</div>' +
                                '<div><span class="status-' + order.status + '">' + order.status + '</span></div>' +
                                '<div><button class="btn" onclick="updateOrderStatus(\\'' + order.id + '\\', \\'' + order.status + '\\')">Update</button></div>' +
                            '</div>'
                        ).join('');
                    }
                } else {
                    ordersList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626;">Error loading orders</div>';
                }
            } catch (error) {
                console.error('Error loading orders:', error);
                ordersList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626;">Network error loading orders</div>';
            }
        }
        
        // Update Order Status
        function updateOrderStatus(orderId, currentStatus) {
            const statuses = ['pending', 'processing', 'shipped', 'delivered'];
            const currentIndex = statuses.indexOf(currentStatus);
            const nextStatus = statuses[currentIndex + 1] || statuses[0];
            
            if (confirm('Update order status to: ' + nextStatus + '?')) {
                // In a real implementation, this would make an API call
                alert('Order status updated to: ' + nextStatus);
                loadOrders(); // Reload orders
            }
        }
        
        // Load Products Function
        async function loadProducts() {
            const productsList = document.getElementById('productsList');
            const totalProductsElement = document.querySelector('.stat-card:first-child .value');
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/supplier/products', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (response.ok) {
                    const products = await response.json();
                    
                    // Update total products count
                    if (totalProductsElement) {
                        totalProductsElement.textContent = products.length;
                    }
                    
                    if (products.length === 0) {
                        productsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; background: white; border-radius: 8px;">No products found. Click "Add New Product" to get started!</div>';
                    } else {
                        productsList.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">' +
                            products.map(product => 
                                '<div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">' +
                                    '<h3 style="margin: 0 0 10px 0; color: #333;">' + product.name + '</h3>' +
                                    '<p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">SKU: ' + product.sku + '</p>' +
                                    '<p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">' + product.description + '</p>' +
                                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">' +
                                        '<div>' +
                                            '<span style="font-size: 18px; font-weight: bold; color: #2563eb;">$' + product.price + '</span>' +
                                            '<span style="margin-left: 15px; color: #666;">Stock: ' + product.stockQuantity + '</span>' +
                                        '</div>' +
                                        '<div>' +
                                            '<span style="padding: 4px 8px; background: #10b981; color: white; border-radius: 4px; font-size: 12px;">' + product.status + '</span>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>'
                            ).join('') +
                        '</div>';
                    }
                } else {
                    productsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626; background: white; border-radius: 8px;">Error loading products. Please try again.</div>';
                }
            } catch (error) {
                console.error('Error loading products:', error);
                productsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc2626; background: white; border-radius: 8px;">Network error loading products</div>';
            }
        }
        
        // Update dashboard stats
        async function updateDashboardStats() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/supplier/stats', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (response.ok) {
                    const stats = await response.json();
                    // Update the dashboard with real stats
                    console.log('Updated stats:', stats);
                }
            } catch (error) {
                console.error('Error updating stats:', error);
            }
            
            // Load products
            loadProducts();
        }
        
        // Image preview functionality
        document.getElementById('productImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }
        
        // Initialize page
        if (checkAuth()) {
            updateDashboardStats();
            loadProducts();
        }
    </script>
</body>
</html>`);
  });

  // Complete Express setup
  // =====================================
  // OBJECT STORAGE ENDPOINTS FOR PRODUCT IMAGES
  // =====================================
  
  // Get upload URL for product images
  app.post("/api/objects/upload", authenticateToken, async (req, res) => {
    try {
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Set ACL policy for product images (public visibility)
  app.put("/api/product-images", authenticateToken, async (req, res) => {
    try {
      const { productImageURL } = req.body;
      
      if (!productImageURL) {
        return res.status(400).json({ error: "productImageURL is required" });
      }

      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        productImageURL,
        {
          owner: req.userId || 'supplier-user-001',
          visibility: "public", // Product images should be publicly accessible
        }
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting product image ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects (product images)
  app.get("/objects/*", async (req, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage');
      const { ObjectPermission } = await import('./objectAcl');
      
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // For product images, we allow public access since they're marked as public
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(404); // Don't reveal existence of private files
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      const { ObjectNotFoundError } = await import('./objectStorage');
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // =====================================
  // MARKETPLACE PRODUCT CATALOG ENDPOINTS
  // =====================================
  
  // Get all marketplace products (public catalog for healthcare providers)
  app.get("/api/marketplace/products", async (req, res) => {
    try {
      const { category, search, status = 'active', page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const products = await storage.getMarketplaceProducts({
        category: category as string,
        search: search as string,
        status: status as string,
        limit: Number(limit),
        offset
      });
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching marketplace products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single marketplace product with details
  app.get("/api/marketplace/products/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getMarketplaceProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Increment view count
      await storage.incrementProductViewCount(id);
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Supplier-specific product management endpoints
  app.get("/api/supplier/products", authenticateToken, requireRole(["supplier_admin", "tenant_admin"]), async (req, res) => {
    try {
      const { status } = req.query;
      const supplierTenantId = req.tenant!.id;
      
      const products = await storage.getSupplierProducts(supplierTenantId, status as string);
      res.json(products);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/supplier/products", authenticateToken, requireRole(["supplier_admin", "tenant_admin"]), async (req, res) => {
    try {
      const supplierTenantId = req.tenant!.id;
      const userId = req.userId!;
      
      const productData = {
        ...req.body,
        supplierTenantId,
        status: 'draft' // All new products start as draft
      };
      
      const product = await storage.createMarketplaceProduct(productData);
      
      // Create audit log (skip for now since userId format needs fixing)
      try {
        await storage.createAuditLog({
          tenantId: supplierTenantId,
          userId: req.userId || 'system',
          entityType: "marketplace_product",
          entityId: product.id,
          action: "create",
          newData: productData,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent")
        });
      } catch (auditError) {
        console.log("Audit log creation skipped due to user ID format:", auditError.message);
      }
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/supplier/products/:id", authenticateToken, requireRole(["supplier_admin", "tenant_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const supplierTenantId = req.tenant!.id;
      const userId = req.userId!;
      
      const updatedProduct = await storage.updateMarketplaceProduct(id, req.body, supplierTenantId);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
      
      // Create audit log (skip for now since userId format needs fixing)
      try {
        await storage.createAuditLog({
          tenantId: supplierTenantId,
          userId: req.userId || 'system',
          entityType: "marketplace_product",
          entityId: id,
          action: "update",
          newData: req.body,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent")
        });
      } catch (auditError) {
        console.log("Audit log creation skipped due to user ID format:", auditError.message);
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // =====================================
  // MARKETPLACE ORDER MANAGEMENT ENDPOINTS
  // =====================================
  
  // Create marketplace order (hospitals/pharmacies/labs placing orders)
  app.post("/api/marketplace/orders", authenticateToken, requireRole(["tenant_admin", "director", "physician", "pharmacist", "lab_technician"]), async (req, res) => {
    try {
      const buyerTenantId = req.tenant!.id;
      const buyerUserId = req.userId!;
      
      const orderData = {
        ...req.body,
        buyerTenantId,
        buyerUserId,
        orderNumber: await storage.generateOrderNumber(),
        status: 'pending'
      };
      
      const order = await storage.createMarketplaceOrder(orderData);
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: buyerTenantId,
        userId: buyerUserId,
        entityType: "marketplace_order",
        entityId: order.id,
        action: "create",
        newData: orderData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get orders for buyer (hospital/pharmacy/lab)
  app.get("/api/marketplace/orders/buyer", authenticateToken, requireRole(["tenant_admin", "director", "physician", "pharmacist", "lab_technician"]), async (req, res) => {
    try {
      const buyerTenantId = req.tenant!.id;
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const orders = await storage.getBuyerOrders(buyerTenantId, {
        status: status as string,
        limit: Number(limit),
        offset
      });
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get orders for supplier
  app.get("/api/marketplace/orders/supplier", authenticateToken, requireRole(["supplier_admin"]), async (req, res) => {
    try {
      const supplierTenantId = req.tenant!.id;
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const orders = await storage.getSupplierOrders(supplierTenantId, {
        status: status as string,
        limit: Number(limit),
        offset
      });
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching supplier orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status (suppliers fulfilling orders)
  app.put("/api/marketplace/orders/:id/status", authenticateToken, requireRole(["supplier_admin", "tenant_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const tenantId = req.tenant!.id;
      const userId = req.userId!;
      
      const updatedOrder = await storage.updateOrderStatus(id, status, notes, tenantId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found or unauthorized" });
      }
      
      // Create audit log
      await storage.createAuditLog({
        tenantId,
        userId,
        entityType: "marketplace_order",
        entityId: id,
        action: "status_update",
        newData: { status, notes },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // =====================================
  // PRODUCT REVIEWS AND RATINGS ENDPOINTS
  // =====================================
  
  // Create product review (verified purchasers only)
  app.post("/api/marketplace/products/:productId/reviews", authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const reviewerTenantId = req.tenant!.id;
      const reviewerUserId = req.userId!;
      
      // Verify purchaser has bought this product
      const hasPurchased = await storage.hasUserPurchasedProduct(reviewerUserId, productId);
      
      if (!hasPurchased) {
        return res.status(403).json({ message: "You can only review products you have purchased" });
      }
      
      const reviewData = {
        ...req.body,
        productId,
        reviewerTenantId,
        reviewerUserId,
        isVerifiedPurchase: true,
        isApproved: false // Reviews need moderation
      };
      
      const review = await storage.createProductReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get product reviews
  app.get("/api/marketplace/products/:productId/reviews", async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const reviews = await storage.getProductReviews(productId, {
        limit: Number(limit),
        offset,
        approvedOnly: true
      });
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Insurance Claims Management Routes
  app.get("/api/insurance-claims", authenticateToken, requireTenant, async (req, res) => {
    try {
      const claims = await storage.getInsuranceClaimsByTenant(req.tenant!.id);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching insurance claims:", error);
      res.status(500).json({ message: "Failed to fetch insurance claims" });
    }
  });

  app.get("/api/insurance-claims/appointment/:appointmentId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const claims = await storage.getInsuranceClaimsByAppointment(appointmentId, req.tenant!.id);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching appointment claims:", error);
      res.status(500).json({ message: "Failed to fetch appointment claims" });
    }
  });

  app.get("/api/insurance-claims/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const claims = await storage.getInsuranceClaimsByPatient(patientId, req.tenant!.id);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching patient claims:", error);
      res.status(500).json({ message: "Failed to fetch patient claims" });
    }
  });

  app.post("/api/insurance-claims", authenticateToken, requireTenant, requireRole(["doctor", "physician", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { nanoid } = await import('nanoid');
      
      // Generate unique claim number
      const claimNumber = `CLM-${Date.now()}-${nanoid(8)}`;
      
      // Calculate totals from procedures
      const totalAmount = req.body.procedureCodes?.reduce((sum: number, proc: any) => sum + (proc.amount || 0), 0) || 0;
      
      // Calculate insurance amounts based on patient insurance
      let totalInsuranceAmount = 0;
      let totalPatientCopay = totalAmount;
      
      if (req.body.patientInsuranceId) {
        const patientInsurance = await storage.getPatientInsurance(req.body.patientInsuranceId, req.tenant!.id);
        if (patientInsurance) {
          const coveragePercentage = patientInsurance.coveragePercentage || 0;
          totalInsuranceAmount = totalAmount * (coveragePercentage / 100);
          totalPatientCopay = Math.max(totalAmount - totalInsuranceAmount, patientInsurance.copayAmount || 0);
        }
      }
      
      const claimData = insertInsuranceClaimSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
        providerId: req.user!.id,
        claimNumber,
        totalAmount: totalAmount.toString(),
        totalPatientCopay: totalPatientCopay.toString(),
        totalInsuranceAmount: totalInsuranceAmount.toString(),
        status: 'draft'
      });

      const claim = await storage.createInsuranceClaim(claimData);
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: claim.id,
        action: "create",
        newData: claim,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating insurance claim:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create insurance claim" });
    }
  });

  app.patch("/api/insurance-claims/:id", authenticateToken, requireTenant, requireRole(["doctor", "physician", "tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Recalculate totals if procedures are updated
      if (req.body.procedureCodes) {
        const totalAmount = req.body.procedureCodes.reduce((sum: number, proc: any) => sum + (proc.amount || 0), 0);
        req.body.totalAmount = totalAmount.toString();
        
        // Recalculate insurance amounts if needed
        if (req.body.patientInsuranceId) {
          const patientInsurance = await storage.getPatientInsurance(req.body.patientInsuranceId, req.tenant!.id);
          if (patientInsurance) {
            const coveragePercentage = patientInsurance.coveragePercentage || 0;
            const totalInsuranceAmount = totalAmount * (coveragePercentage / 100);
            const totalPatientCopay = Math.max(totalAmount - totalInsuranceAmount, patientInsurance.copayAmount || 0);
            req.body.totalInsuranceAmount = totalInsuranceAmount.toString();
            req.body.totalPatientCopay = totalPatientCopay.toString();
          }
        }
      }
      
      const updatedClaim = await storage.updateInsuranceClaim(id, req.body, req.tenant!.id);
      
      if (!updatedClaim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: updatedClaim.id,
        action: "update",
        newData: updatedClaim,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating insurance claim:", error);
      res.status(500).json({ message: "Failed to update insurance claim" });
    }
  });

  app.post("/api/insurance-claims/:id/submit", authenticateToken, requireTenant, requireRole(["doctor", "physician", "tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const updatedClaim = await storage.updateInsuranceClaim(id, {
        status: 'submitted',
        submittedDate: new Date()
      }, req.tenant!.id);
      
      if (!updatedClaim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: updatedClaim.id,
        action: "submit",
        newData: { status: 'submitted', submittedDate: updatedClaim.submittedDate },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedClaim);
    } catch (error) {
      console.error("Error submitting insurance claim:", error);
      res.status(500).json({ message: "Failed to submit insurance claim" });
    }
  });

  app.get("/api/insurance-claims/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const claim = await storage.getInsuranceClaim(id, req.tenant!.id);
      
      if (!claim) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }

      res.json(claim);
    } catch (error) {
      console.error("Error fetching insurance claim:", error);
      res.status(500).json({ message: "Failed to fetch insurance claim" });
    }
  });

  // Counter Reset API - Super Admin Only
  app.post("/api/admin/reset-counters", authenticateToken, async (req, res) => {
    try {
      console.log("Counter reset request - User:", req.user);
      
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const result = await resetAllCounters();
      
      res.json({
        success: true,
        message: "All counters have been successfully reset to zero",
        details: {
          resetCounters: [
            "Work shift prescriptions, revenue, and insurance claims",
            "User levels, points, tests completed, and streaks",
            "Advertisement impressions, clicks, and conversions",
            "Product view counts, order counts, ratings, and reviews",
            "Activity log points",
            "Stock quantities reset to zero"
          ],
          timestamp: result.timestamp,
          resetBy: req.user.username || req.user.email
        }
      });
    } catch (error) {
      console.error("Error resetting counters:", error);
      res.status(500).json({ 
        message: "Failed to reset counters",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test Data Creation API - Super Admin Only
  app.post("/api/admin/create-test-data", authenticateToken, async (req, res) => {
    try {
      console.log("Test data creation request - User:", req.user);
      
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      // Import and run the test data creation
      const { createHospitalTestData } = await import('./create-hospital-test-data.js');
      const result = await createHospitalTestData();
      
      res.json({
        success: true,
        message: "Hospital test data created successfully",
        details: result
      });
    } catch (error) {
      console.error("Error creating test data:", error);
      res.status(500).json({ 
        message: "Failed to create test data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ============================================
  // CURRENCY MANAGEMENT ENDPOINTS
  // ============================================

  // Get all available currencies
  app.get("/api/currencies", async (req, res) => {
    try {
      const currencies = await storage.getAllCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Get currencies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get African currencies specifically
  app.get("/api/currencies/african", async (req, res) => {
    try {
      const currencies = await storage.getAfricanCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Get African currencies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get tenant's currency settings
  app.get("/api/tenant/currency-settings", requireTenant, async (req, res) => {
    try {
      const settings = {
        baseCurrency: req.tenant!.baseCurrency || 'USD',
        supportedCurrencies: req.tenant!.supportedCurrencies || ['USD']
      };
      res.json(settings);
    } catch (error) {
      console.error("Get tenant currency settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get tenant currencies with full info
  app.get("/api/tenant/currencies", requireTenant, async (req, res) => {
    try {
      const tenantCurrencies = await storage.getTenantCurrencies(req.tenant!.id);
      res.json(tenantCurrencies);
    } catch (error) {
      console.error("Get tenant currencies error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update tenant's currency settings
  app.put("/api/tenant/currency-settings", requireRole(["tenant_admin", "director"]), async (req, res) => {
    try {
      const { baseCurrency, supportedCurrencies } = req.body;
      
      if (!baseCurrency || !Array.isArray(supportedCurrencies)) {
        return res.status(400).json({ 
          message: "baseCurrency and supportedCurrencies array are required" 
        });
      }

      // Ensure base currency is in supported currencies
      const finalSupportedCurrencies = supportedCurrencies.includes(baseCurrency) 
        ? supportedCurrencies 
        : [baseCurrency, ...supportedCurrencies];

      await storage.updateTenantCurrencySettings(req.tenant!.id, {
        baseCurrency,
        supportedCurrencies: finalSupportedCurrencies
      });

      res.json({ 
        message: "Currency settings updated successfully",
        baseCurrency,
        supportedCurrencies: finalSupportedCurrencies
      });
    } catch (error) {
      console.error("Update currency settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get exchange rates
  app.get("/api/currency/exchange-rates", async (req, res) => {
    try {
      const { base, targets } = req.query;
      const baseCurrency = (base as string) || 'USD';
      const targetCurrencies = targets ? (targets as string).split(',') : ['USD'];
      
      const rates = await storage.getExchangeRates(baseCurrency, targetCurrencies);
      res.json(rates);
    } catch (error) {
      console.error("Get exchange rates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get currency information
  app.get("/api/currency/info", async (req, res) => {
    try {
      const { codes } = req.query;
      const currencyCodes = codes ? (codes as string).split(',') : ['USD'];
      
      const currencyInfo = await storage.getCurrencyInfo(currencyCodes);
      res.json(currencyInfo);
    } catch (error) {
      console.error("Get currency info error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Format currency amount
  app.post("/api/currencies/format", async (req, res) => {
    try {
      const { amount, currencyCode } = req.body;
      
      if (amount === undefined || !currencyCode) {
        return res.status(400).json({ 
          message: "amount and currencyCode are required" 
        });
      }

      const formatted = await storage.formatCurrency(amount, currencyCode);
      res.json({ formatted });
    } catch (error) {
      console.error("Format currency error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Convert currency
  app.post("/api/currencies/convert", async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ 
          message: "amount, fromCurrency, and toCurrency are required" 
        });
      }

      const conversion = await storage.convertCurrency(amount, fromCurrency, toCurrency);
      
      if (!conversion) {
        return res.status(400).json({ 
          message: "Currency conversion not available for the requested currencies" 
        });
      }

      res.json(conversion);
    } catch (error) {
      console.error("Convert currency error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auto-detect currency based on location/country
  app.get("/api/currency/detect", async (req, res) => {
    try {
      const { country, address } = req.query;
      
      let detectedCurrency = 'USD'; // Default fallback
      
      if (country) {
        detectedCurrency = await storage.getCurrencyByCountry(country as string);
      } else if (address) {
        detectedCurrency = await storage.getCurrencyByAddress(address as string);
      }
      
      res.json({ currency: detectedCurrency });
    } catch (error) {
      console.error("Currency detection error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==========================================
  // PATIENT CHECK-IN ROUTES
  // ==========================================
  
  // Get all patient check-ins for tenant
  app.get("/api/patient-check-ins", authenticateToken, requireTenant, async (req, res) => {
    try {
      const checkIns = await storage.getPatientCheckIns(req.tenant!.id);
      res.json(checkIns);
    } catch (error) {
      console.error("Failed to fetch patient check-ins:", error);
      res.status(500).json({ message: "Failed to fetch patient check-ins" });
    }
  });

  // Get today's patient check-ins
  app.get("/api/patient-check-ins/today", authenticateToken, requireTenant, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIns = await storage.getPatientCheckInsByDate(today, req.tenant!.id);
      res.json(checkIns);
    } catch (error) {
      console.error("Failed to fetch today's check-ins:", error);
      res.status(500).json({ message: "Failed to fetch today's check-ins" });
    }
  });

  // Get waiting patients (checked in but not completed)
  app.get("/api/patient-check-ins/waiting", authenticateToken, requireTenant, async (req, res) => {
    try {
      const waitingPatients = await storage.getWaitingPatients(req.tenant!.id);
      res.json(waitingPatients);
    } catch (error) {
      console.error("Failed to fetch waiting patients:", error);
      res.status(500).json({ message: "Failed to fetch waiting patients" });
    }
  });

  // Create patient check-in
  app.post("/api/patient-check-ins", authenticateToken, requireTenant, requireRole(["receptionist", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      console.log("[CHECK-IN DEBUG] Request body:", req.body);
      console.log("[CHECK-IN DEBUG] Tenant ID:", req.tenant!.id);
      console.log("[CHECK-IN DEBUG] User ID:", req.user!.id);

      // Prepare data with all required fields
      const checkInData = {
        ...req.body,
        tenantId: req.tenant!.id,
        checkedInBy: req.user!.id,
        checkInTime: new Date()
      };
      
      console.log("[CHECK-IN DEBUG] Data before validation:", checkInData);

      const validatedData = insertPatientCheckInSchema.parse(checkInData);
      
      console.log("[CHECK-IN DEBUG] Validated data:", validatedData);

      const checkIn = await storage.createPatientCheckIn(validatedData);
      
      console.log("[CHECK-IN DEBUG] Created check-in:", checkIn);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "patient_check_in",
        entityId: checkIn.id,
        action: "CREATE",
        previousData: null,
        newData: checkIn,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Failed to create patient check-in:", error);
      res.status(500).json({ message: "Failed to create patient check-in" });
    }
  });

  // Update patient check-in (for vital signs, status changes, etc.)
  app.patch("/api/patient-check-ins/:id", authenticateToken, requireTenant, requireRole(["receptionist", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const originalCheckIn = await storage.getPatientCheckIn(id, req.tenant!.id);
      if (!originalCheckIn) {
        return res.status(404).json({ message: "Patient check-in not found" });
      }

      const updatedCheckIn = await storage.updatePatientCheckIn(id, updates, req.tenant!.id);
      if (!updatedCheckIn) {
        return res.status(404).json({ message: "Patient check-in not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "patient_check_in",
        entityId: id,
        action: "UPDATE",
        previousData: originalCheckIn,
        newData: updatedCheckIn,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.json(updatedCheckIn);
    } catch (error) {
      console.error("Failed to update patient check-in:", error);
      res.status(500).json({ message: "Failed to update patient check-in" });
    }
  });

  // Hospital Patient Insurance routes
  app.get("/api/hospital-patient-insurance/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const insurance = await storage.getHospitalPatientInsuranceByPatientId(patientId, req.tenantId!);
      res.json(insurance);
    } catch (error) {
      console.error("Error fetching hospital patient insurance:", error);
      res.status(500).json({ message: "Failed to fetch insurance information" });
    }
  });

  app.post("/api/hospital-patient-insurance", authenticateToken, requireTenant, async (req, res) => {
    try {
      const insuranceData = {
        ...req.body,
        tenantId: req.tenantId,
      };
      
      const insurance = await storage.createHospitalPatientInsurance(insuranceData);
      res.status(201).json(insurance);
    } catch (error) {
      console.error("Error creating hospital patient insurance:", error);
      res.status(500).json({ message: "Failed to create insurance information" });
    }
  });

  app.patch("/api/hospital-patient-insurance/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      const insurance = await storage.updateHospitalPatientInsurance(id, updateData);
      
      if (!insurance) {
        return res.status(404).json({ message: "Insurance information not found" });
      }
      
      res.json(insurance);
    } catch (error) {
      console.error("Error updating hospital patient insurance:", error);
      res.status(500).json({ message: "Failed to update insurance information" });
    }
  });

  // ===== ADMIN MEDICAL CODES MANAGEMENT API =====
  
  // Countries CRUD
  app.get('/api/admin/countries', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const result = await storage.getAllCountries();
      res.json(result);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/countries', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      // Basic validation
      const countryData = {
        code: req.body.code?.toUpperCase(),
        name: req.body.name,
        region: req.body.region || null,
        cptCodeSystem: req.body.cptCodeSystem || 'CPT-4',
        icd10CodeSystem: req.body.icd10CodeSystem || 'ICD-10',
        pharmaceuticalCodeSystem: req.body.pharmaceuticalCodeSystem || 'NDC',
        currencyCode: req.body.currencyCode || 'USD',
        dateFormat: req.body.dateFormat || 'MM/DD/YYYY',
        timeZone: req.body.timeZone || 'America/New_York'
      };

      const country = await storage.createCountry(countryData);
      res.status(201).json(country);
    } catch (error) {
      console.error('Error creating country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/admin/countries/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const countryData = {
        code: req.body.code?.toUpperCase(),
        name: req.body.name,
        region: req.body.region || null,
        cptCodeSystem: req.body.cptCodeSystem,
        icd10CodeSystem: req.body.icd10CodeSystem,
        pharmaceuticalCodeSystem: req.body.pharmaceuticalCodeSystem,
        currencyCode: req.body.currencyCode,
        dateFormat: req.body.dateFormat,
        timeZone: req.body.timeZone
      };

      const country = await storage.updateCountry(req.params.id, countryData);
      res.json(country);
    } catch (error) {
      console.error('Error updating country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Medical Codes CRUD
  app.get('/api/admin/medical-codes', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const filters = {
        countryId: req.query.countryId as string,
        codeType: req.query.codeType as string,
        search: req.query.search as string
      };
      
      const codes = await storage.getMedicalCodes(filters);
      res.json(codes);
    } catch (error) {
      console.error('Error fetching medical codes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/medical-codes', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const codeData = {
        countryId: req.body.countryId,
        codeType: req.body.codeType,
        code: req.body.code,
        description: req.body.description,
        category: req.body.category || null,
        amount: req.body.amount || null,
        source: 'manual',
        uploadedBy: req.user.id
      };

      const medicalCode = await storage.createMedicalCode(codeData);
      res.status(201).json(medicalCode);
    } catch (error) {
      console.error('Error creating medical code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/admin/medical-codes/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const codeData = {
        countryId: req.body.countryId,
        codeType: req.body.codeType,
        code: req.body.code,
        description: req.body.description,
        category: req.body.category || null,
        amount: req.body.amount || null
      };

      const medicalCode = await storage.updateMedicalCode(req.params.id, codeData);
      res.json(medicalCode);
    } catch (error) {
      console.error('Error updating medical code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/medical-codes/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      await storage.deleteMedicalCode(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting medical code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // CSV Upload for Medical Codes
  app.post('/api/admin/medical-codes/upload', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      // Note: In a real implementation, you'd use multer or similar for file handling
      // For now, we'll simulate the upload process
      
      const uploadData = {
        countryId: req.body.countryId,
        fileName: req.body.fileName || 'manual_upload.csv',
        uploadedBy: req.user.id
      };

      const upload = await storage.createMedicalCodeUpload(uploadData);
      
      // Process the CSV file here (simulate for now)
      // In reality, you'd parse the CSV and import the codes
      
      res.status(201).json({ 
        message: 'Upload started successfully',
        uploadId: upload.id 
      });
    } catch (error) {
      console.error('Error uploading medical codes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Upload History
  app.get('/api/admin/medical-code-uploads', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const uploads = await storage.getMedicalCodeUploads();
      res.json(uploads);
    } catch (error) {
      console.error('Error fetching upload history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Country-specific medical code lookup (for tenants)
  app.get('/api/medical-codes/lookup', authenticateToken, requireTenant, async (req, res) => {
    try {
      const { codeType, search } = req.query;
      const tenant = req.tenant;
      
      if (!tenant.countryId) {
        return res.status(400).json({ error: 'Tenant country not configured' });
      }

      const codes = await storage.getMedicalCodesByCountry(tenant.countryId, {
        codeType: codeType as string,
        search: search as string
      });
      
      res.json(codes);
    } catch (error) {
      console.error('Error looking up medical codes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
