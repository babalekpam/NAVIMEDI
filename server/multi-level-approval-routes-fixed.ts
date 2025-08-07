import { Router } from 'express';
import { storage } from './storage';
import { authenticateToken, requireRole } from './middleware/auth';
import { requireTenant } from './middleware/tenant';

const router = Router();

// Get pending approvals for current user
router.get('/my-pending-approvals', authenticateToken, requireTenant, async (req, res) => {
  try {
    const userId = req.userId!;
    const userRole = req.user!.role;
    const tenantId = req.tenantId!;

    const pendingApprovals = await storage.getPendingApprovalsForUser(userId, userRole, tenantId);
    res.json(pendingApprovals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

// Get all patient access requests (for overview)
router.get('/patient-access-requests', authenticateToken, requireTenant, async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userRole = req.user!.role;

    // Only allow certain roles to view all requests
    if (!['physician', 'director', 'tenant_admin', 'super_admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const requests = await storage.getPatientAccessRequests(tenantId);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching patient access requests:', error);
    res.status(500).json({ error: 'Failed to fetch access requests' });
  }
});

// Get approval history for a specific request
router.get('/patient-access-requests/:requestId/history', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { requestId } = req.params;
    const tenantId = req.tenantId!;

    const history = await storage.getApprovalHistory(requestId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({ error: 'Failed to fetch approval history' });
  }
});

// Approve a patient access request
router.post('/patient-access-requests/:requestId/approve', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes, conditions } = req.body;
    const userId = req.userId!;
    const userRole = req.user!.role;
    const tenantId = req.tenantId!;

    // Get current request to validate approval level
    const currentRequests = await storage.getPatientAccessRequests(tenantId);
    const currentRequest = currentRequests.find(r => r.id === requestId);

    if (!currentRequest) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    // Parse approval workflow
    const workflow = typeof currentRequest.approvalWorkflow === 'string' 
      ? JSON.parse(currentRequest.approvalWorkflow)
      : currentRequest.approvalWorkflow;

    const currentLevel = currentRequest.currentApprovalLevel;
    const currentLevelConfig = workflow.levels.find((l: any) => l.level === currentLevel);

    if (!currentLevelConfig || currentLevelConfig.approverRole !== userRole) {
      return res.status(403).json({ error: 'You are not authorized to approve at this level' });
    }

    // Process approval step
    const stepData = {
      approvalLevel: currentLevel,
      approverRole: userRole,
      approverId: userId,
      action: 'approve',
      decision: 'approve',
      notes: notes || '',
      conditions: conditions || '',
      riskAssessment: { level: 'reviewed', assessedBy: userId }
    };

    // Determine if this is the final approval
    const maxLevel = Math.max(...workflow.levels.map((l: any) => l.level));
    const isFinalApproval = currentLevel >= maxLevel;
    (stepData as any).isFinalApproval = isFinalApproval;

    const result = await storage.processApprovalStep(requestId, tenantId, stepData);

    res.json({ 
      message: isFinalApproval ? 'Access request approved successfully' : 'Approval processed, moved to next level',
      isFinalApproval,
      nextLevel: isFinalApproval ? null : currentLevel + 1
    });
  } catch (error) {
    console.error('Error approving access request:', error);
    res.status(500).json({ error: 'Failed to approve access request' });
  }
});

// Deny a patient access request
router.post('/patient-access-requests/:requestId/deny', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const userId = req.userId!;
    const userRole = req.user!.role;
    const tenantId = req.tenantId!;

    // Get current request to validate approval level
    const currentRequests = await storage.getPatientAccessRequests(tenantId);
    const currentRequest = currentRequests.find(r => r.id === requestId);

    if (!currentRequest) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    // Parse approval workflow
    const workflow = typeof currentRequest.approvalWorkflow === 'string' 
      ? JSON.parse(currentRequest.approvalWorkflow)
      : currentRequest.approvalWorkflow;

    const currentLevel = currentRequest.currentApprovalLevel;
    const currentLevelConfig = workflow.levels.find((l: any) => l.level === currentLevel);

    if (!currentLevelConfig || currentLevelConfig.approverRole !== userRole) {
      return res.status(403).json({ error: 'You are not authorized to deny at this level' });
    }

    // Process denial step
    const stepData = {
      approvalLevel: currentLevel,
      approverRole: userRole,
      approverId: userId,
      action: 'deny',
      decision: 'deny',
      notes: notes || 'Request denied',
      riskAssessment: { level: 'denied', assessedBy: userId }
    };

    await storage.processApprovalStep(requestId, tenantId, stepData);

    res.json({ message: 'Access request denied successfully' });
  } catch (error) {
    console.error('Error denying access request:', error);
    res.status(500).json({ error: 'Failed to deny access request' });
  }
});

export default router;