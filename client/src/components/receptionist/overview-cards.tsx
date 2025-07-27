import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Calendar, Activity } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

interface OverviewCardsProps {
  todayCheckIns: any[];
  waitingPatients: any[];
  todayAppointments: any[];
}

export default function OverviewCards({ todayCheckIns, waitingPatients, todayAppointments }: OverviewCardsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('todays-checkins'),
      value: todayCheckIns.length,
      icon: Users,
      description: t('patients-checked-in-today'),
      color: 'text-blue-600',
    },
    {
      title: t('waiting-patients'),
      value: waitingPatients.length,
      icon: Clock,
      description: t('patients-currently-waiting'),
      color: 'text-yellow-600',
    },
    {
      title: t('scheduled-appointments'),
      value: todayAppointments.length,
      icon: Calendar,
      description: t('total-appointments-today'),
      color: 'text-green-600',
    },
    {
      title: t('avg-wait-time'),
      value: '12 min',
      icon: Activity,
      description: t('average-wait-time-today'),
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}