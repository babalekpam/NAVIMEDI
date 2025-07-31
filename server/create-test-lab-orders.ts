import { storage } from './storage.js';

async function createTestLabOrders() {
  try {
    console.log('Creating test lab orders for laboratory billing...');

    // Get existing patients and lab tenant
    const patients = await storage.getAllPatients();
    const labTenant = await storage.getTenantBySubdomain('joy');
    const hospitalTenant = await storage.getTenantBySubdomain('metro-general');
    
    if (!labTenant) {
      console.error('JOY Laboratory tenant not found');
      return;
    }

    if (!hospitalTenant) {
      console.error('Metro General Hospital tenant not found');
      return;
    }

    if (patients.length === 0) {
      console.log('No patients found, skipping lab order creation');
      return;
    }

    // Get a doctor from the hospital to act as the ordering physician
    const doctors = await storage.getUsersByRole('physician', hospitalTenant.id);
    if (doctors.length === 0) {
      console.log('No doctors found in hospital, skipping lab order creation');
      return;
    }

    const orderingDoctor = doctors[0];

    // Create completed lab orders for the first few patients
    const labOrdersToCreate = [
      {
        patientId: patients[0].id,
        providerId: orderingDoctor.id,
        testCode: 'CBC001',
        testName: 'Complete Blood Count',
        status: 'completed' as const,
        priority: 'routine' as const,
        notes: 'Routine blood work as requested by physician',
        assignedLaboratoryId: labTenant.id,
        tenantId: patients[0].tenantId,
        orderingPhysician: orderingDoctor.firstName + ' ' + orderingDoctor.lastName,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        patientId: patients[1]?.id || patients[0].id,
        providerId: orderingDoctor.id,
        testCode: 'LIPID001',
        testName: 'Lipid Panel',
        status: 'completed' as const,
        priority: 'routine' as const,
        notes: 'Lipid panel for cardiovascular screening',
        assignedLaboratoryId: labTenant.id,
        tenantId: patients[1]?.tenantId || patients[0].tenantId,
        orderingPhysician: orderingDoctor.firstName + ' ' + orderingDoctor.lastName,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        patientId: patients[0].id,
        providerId: orderingDoctor.id,
        testCode: 'TSH001',
        testName: 'Thyroid Stimulating Hormone',
        status: 'completed' as const,
        priority: 'urgent' as const,
        notes: 'TSH test for thyroid function evaluation',
        assignedLaboratoryId: labTenant.id,
        tenantId: patients[0].tenantId,
        orderingPhysician: orderingDoctor.firstName + ' ' + orderingDoctor.lastName,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      }
    ];

    for (const orderData of labOrdersToCreate) {
      try {
        const existingOrders = await storage.getLabOrdersByPatient(orderData.patientId);

        const existingOrder = existingOrders.find(o => o.testCode === orderData.testCode);
        if (!existingOrder) {
          const order = await storage.createLabOrder(orderData);
          console.log(`✓ Created lab order: ${order.testName} for patient ${orderData.patientId}`);
        } else {
          console.log(`✓ Lab order already exists: ${orderData.testName} for patient ${orderData.patientId}`);
        }
      } catch (error) {
        console.error(`Error creating lab order ${orderData.testName}:`, error);
      }
    }

    console.log('✓ Test lab orders creation completed');
  } catch (error) {
    console.error('Error creating test lab orders:', error);
  }
}

createTestLabOrders();