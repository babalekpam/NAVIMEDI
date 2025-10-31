/**
 * Scheduling Service
 * 
 * Business logic for staff scheduling, time tracking, and leave management
 */

import { storage } from "./storage";
import type { StaffShift, TimeLog, LeaveRequest } from "@shared/schema";

/**
 * Check if a shift conflicts with existing shifts for a user
 * Prevents double-booking staff members
 */
export async function checkShiftConflicts(
  userId: string,
  tenantId: string,
  shiftDate: Date,
  startTime: string,
  endTime: string,
  excludeShiftId?: number
): Promise<{ hasConflict: boolean; conflictingShift?: StaffShift }> {
  try {
    // Get all shifts for the user on the same date
    const existingShifts = await storage.getStaffShifts(tenantId, {
      userId,
      startDate: shiftDate,
      endDate: shiftDate,
    });

    // Check for time overlaps
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const newStartMinutes = startHour * 60 + startMin;
    const newEndMinutes = endHour * 60 + endMin;

    for (const shift of existingShifts) {
      // Skip the shift being updated
      if (excludeShiftId && shift.id === excludeShiftId) {
        continue;
      }

      // Skip cancelled or no-show shifts
      if (shift.status === 'cancelled' || shift.status === 'no_show') {
        continue;
      }

      const [existingStartHour, existingStartMin] = shift.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = shift.endTime.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      // Check for overlap
      if (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      ) {
        return { hasConflict: true, conflictingShift: shift };
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error('Error checking shift conflicts:', error);
    throw error;
  }
}

/**
 * Calculate total work hours from clock in/out times
 */
export function calculateHours(
  clockInTime: Date,
  clockOutTime: Date,
  breakMinutes: number = 0
): number {
  const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60);
  const workMinutes = totalMinutes - breakMinutes;
  return Math.max(0, Number((workMinutes / 60).toFixed(2)));
}

/**
 * Calculate overtime hours based on total hours and regular hours threshold
 * Standard work week is 40 hours, overtime is hours beyond that
 */
export function calculateOvertime(
  totalHours: number,
  regularHoursThreshold: number = 8
): number {
  const overtime = totalHours - regularHoursThreshold;
  return Math.max(0, Number(overtime.toFixed(2)));
}

/**
 * Check staffing levels for a department on a specific date
 * Returns the number of staff scheduled vs required
 */
export async function checkStaffingLevels(
  tenantId: string,
  departmentId: string | null,
  date: Date
): Promise<{
  scheduledStaff: number;
  requiredStaff: number;
  isAdequate: boolean;
  staffList: StaffShift[];
}> {
  try {
    const shifts = await storage.getStaffShifts(tenantId, {
      departmentId,
      startDate: date,
      endDate: date,
      status: ['scheduled', 'confirmed', 'in_progress']
    });

    // Count unique staff members (avoid double-counting if someone has multiple shifts)
    const uniqueStaff = new Set(shifts.map(s => s.userId));
    const scheduledStaff = uniqueStaff.size;
    
    // TODO: This should be configurable per department
    // For now, we'll use a simple heuristic: 3 staff minimum per department
    const requiredStaff = 3;

    return {
      scheduledStaff,
      requiredStaff,
      isAdequate: scheduledStaff >= requiredStaff,
      staffList: shifts
    };
  } catch (error) {
    console.error('Error checking staffing levels:', error);
    throw error;
  }
}

/**
 * Generate shifts from a schedule template
 * Applies a weekly pattern to create shifts for a date range
 */
export async function generateScheduleFromTemplate(
  templateId: number,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  createdBy: string
): Promise<StaffShift[]> {
  try {
    const template = await storage.getScheduleTemplate(templateId, tenantId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.isActive) {
      throw new Error('Template is not active');
    }

    const templateData = template.templateData as any;
    const createdShifts: StaffShift[] = [];

    // Iterate through each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

      // Check if template has shifts for this day
      const dayShifts = templateData[dayName] || [];

      for (const shiftTemplate of dayShifts) {
        // Check for conflicts before creating shift
        const { hasConflict } = await checkShiftConflicts(
          shiftTemplate.userId,
          tenantId,
          currentDate,
          shiftTemplate.startTime,
          shiftTemplate.endTime
        );

        if (!hasConflict) {
          const shift = await storage.createStaffShift({
            tenantId,
            userId: shiftTemplate.userId,
            shiftType: shiftTemplate.shiftType,
            shiftDate: currentDate,
            startTime: shiftTemplate.startTime,
            endTime: shiftTemplate.endTime,
            breakMinutes: shiftTemplate.breakMinutes || 0,
            departmentId: template.departmentId,
            status: 'scheduled',
            notes: `Generated from template: ${template.templateName}`,
            assignedBy: createdBy
          });
          createdShifts.push(shift);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return createdShifts;
  } catch (error) {
    console.error('Error generating schedule from template:', error);
    throw error;
  }
}

/**
 * Validate leave request
 * Checks for conflicts with existing shifts and approved leave
 */
export async function validateLeaveRequest(
  userId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  excludeRequestId?: number
): Promise<{
  isValid: boolean;
  conflicts: {
    shifts?: StaffShift[];
    leaveRequests?: LeaveRequest[];
  };
  message?: string;
}> {
  try {
    // Check for conflicting shifts
    const shifts = await storage.getStaffShifts(tenantId, {
      userId,
      startDate,
      endDate,
      status: ['scheduled', 'confirmed']
    });

    // Check for conflicting leave requests
    const leaveRequests = await storage.getLeaveRequests(tenantId, {
      userId,
      startDate,
      endDate,
      status: ['pending', 'approved']
    });

    // Filter out the current leave request being updated
    const conflictingLeave = excludeRequestId
      ? leaveRequests.filter(lr => lr.id !== excludeRequestId)
      : leaveRequests;

    const hasConflicts = shifts.length > 0 || conflictingLeave.length > 0;

    if (hasConflicts) {
      let message = 'Leave request conflicts with: ';
      if (shifts.length > 0) {
        message += `${shifts.length} scheduled shift(s)`;
      }
      if (conflictingLeave.length > 0) {
        if (shifts.length > 0) message += ' and ';
        message += `${conflictingLeave.length} existing leave request(s)`;
      }

      return {
        isValid: false,
        conflicts: {
          shifts: shifts.length > 0 ? shifts : undefined,
          leaveRequests: conflictingLeave.length > 0 ? conflictingLeave : undefined
        },
        message
      };
    }

    return { isValid: true, conflicts: {} };
  } catch (error) {
    console.error('Error validating leave request:', error);
    throw error;
  }
}

/**
 * Calculate total days between two dates (inclusive)
 */
export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffMs / oneDayMs) + 1; // +1 to include both start and end dates
}

/**
 * Get overtime summary for a user within a date range
 */
export async function getOvertimeSummary(
  userId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  timeLogs: TimeLog[];
}> {
  try {
    const timeLogs = await storage.getTimeLogs(tenantId, {
      userId,
      startDate,
      endDate,
      status: ['clocked_out', 'approved']
    });

    let totalHours = 0;
    let overtimeHours = 0;

    for (const log of timeLogs) {
      totalHours += Number(log.totalHours || 0);
      overtimeHours += Number(log.overtimeHours || 0);
    }

    const regularHours = totalHours - overtimeHours;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      regularHours: Number(regularHours.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      timeLogs
    };
  } catch (error) {
    console.error('Error getting overtime summary:', error);
    throw error;
  }
}
