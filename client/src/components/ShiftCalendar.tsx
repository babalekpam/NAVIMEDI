import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Shift {
  id: number;
  userId: string;
  shiftType: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  status: string;
  departmentId?: string | null;
  notes?: string | null;
}

interface ShiftCalendarProps {
  shifts: Shift[];
  startDate: Date;
  onShiftClick?: (shift: Shift) => void;
  userMap?: Map<string, { firstName: string; lastName: string }>;
}

const shiftTypeColors: Record<string, string> = {
  morning: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-700',
  afternoon: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 border-amber-300 dark:border-amber-700',
  evening: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-purple-300 dark:border-purple-700',
  night: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 border-indigo-300 dark:border-indigo-700',
  'on-call': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  confirmed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
  cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  'no-show': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
};

export function ShiftCalendar({ shifts, startDate, onShiftClick, userMap }: ShiftCalendarProps) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(shift => {
      const shiftDate = shift.shiftDate instanceof Date ? shift.shiftDate : new Date(shift.shiftDate);
      return isSameDay(shiftDate, day);
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2" data-testid="shift-calendar">
      {weekDays.map((day, index) => {
        const dayShifts = getShiftsForDay(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={index} className="min-h-[200px]" data-testid={`calendar-day-${index}`}>
            <div className={`p-2 text-center border-b ${isToday ? 'bg-primary/10 dark:bg-primary/20 font-semibold' : 'bg-muted/50 dark:bg-muted/20'}`}>
              <div className="text-xs text-muted-foreground dark:text-muted-foreground">{format(day, 'EEE')}</div>
              <div className="text-lg">{format(day, 'd')}</div>
            </div>
            <div className="p-2 space-y-2 bg-white dark:bg-gray-950 min-h-[160px]">
              {dayShifts.length === 0 ? (
                <div className="text-xs text-muted-foreground dark:text-muted-foreground text-center py-4">No shifts</div>
              ) : (
                dayShifts.map((shift) => {
                  const user = userMap?.get(shift.userId);
                  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

                  return (
                    <Card
                      key={shift.id}
                      className={`p-2 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${shiftTypeColors[shift.shiftType] || 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                      onClick={() => onShiftClick?.(shift)}
                      data-testid={`shift-card-${shift.id}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium truncate">{shift.startTime} - {shift.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs mt-1">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{userName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1 py-0 ${statusColors[shift.status] || ''}`}
                          data-testid={`shift-status-${shift.id}`}
                        >
                          {shift.status}
                        </Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
