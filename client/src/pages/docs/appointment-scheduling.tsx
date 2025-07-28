import { ArrowLeft, Clock, Users, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export function AppointmentScheduling() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Appointment Scheduling</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>25 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Intermediate</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Efficient appointment management for healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NAVIMED's appointment scheduling system streamlines the booking process for patients, providers, and administrative staff while maintaining optimal resource utilization and patient care coordination.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Provider Availability</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Set working hours and break times</li>
                    <li>• Configure appointment duration by visit type</li>
                    <li>• Block time for procedures and surgeries</li>
                    <li>• Manage vacation and leave schedules</li>
                    <li>• Set recurring availability patterns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Appointment Types</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Consultation (30-60 minutes)</li>
                    <li>• Follow-up visits (15-30 minutes)</li>
                    <li>• Procedure appointments (variable duration)</li>
                    <li>• Emergency slots (immediate availability)</li>
                    <li>• Telemedicine appointments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Booking Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Patient Self-Booking</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Online portal with real-time availability</li>
                    <li>• Mobile app booking capabilities</li>
                    <li>• Insurance verification during booking</li>
                    <li>• Automatic confirmation emails/SMS</li>
                    <li>• Reminder notifications system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Staff-Assisted Booking</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Phone booking with instant schedule access</li>
                    <li>• Walk-in appointment management</li>
                    <li>• Emergency slot allocation</li>
                    <li>• Double-booking prevention</li>
                    <li>• Waitlist management for cancellations</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">Smart Scheduling</h5>
                  <p className="text-blue-700 text-sm">The system automatically suggests optimal appointment times based on provider preferences, patient history, and appointment type requirements.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Status Tracking</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Scheduled → Confirmed → Checked In → In Progress → Completed</li>
                    <li>• Cancelled and No-Show tracking</li>
                    <li>• Rescheduling with automatic notifications</li>
                    <li>• Late arrival management</li>
                    <li>• Provider running late alerts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Communication Features</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automatic appointment reminders (24h, 2h before)</li>
                    <li>• SMS and email notifications</li>
                    <li>• Waiting room updates</li>
                    <li>• Provider delay notifications</li>
                    <li>• Post-appointment follow-up messages</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration & Automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">EHR Integration</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automatic patient record linking</li>
                    <li>• Pre-visit questionnaire completion</li>
                    <li>• Insurance verification before arrival</li>
                    <li>• Medical history review alerts</li>
                    <li>• Prescription refill reminders</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Billing Integration</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>• Automatic charge capture</li>
                    <li>• Insurance copay collection</li>
                    <li>• No-show fee processing</li>
                    <li>• Revenue cycle optimization</li>
                    <li>• Financial reporting integration</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">Efficiency Metrics</h5>
                  <p className="text-green-700 text-sm">Track appointment utilization, wait times, no-show rates, and provider productivity to optimize your scheduling workflow.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}