import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAttendance, useAttendanceStats } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { ClassCard } from "@/components/ClassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Bell, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Fetch today's attendance
  const { data: todaysClasses, isLoading: loadingClasses } = useAttendance(today, today);
  const { data: stats, isLoading: loadingStats } = useAttendanceStats();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!todaysClasses || !notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      todaysClasses.forEach(record => {
        const [hours, minutes] = record.startTime.split(':').map(Number);
        const [endHours, endMinutes] = record.endTime.split(':').map(Number);
        
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

        // 15 mins before reminder
        const fifteenMinsBefore = new Date(startTime.getTime() - 15 * 60000);
        if (now.getTime() >= fifteenMinsBefore.getTime() && now.getTime() < startTime.getTime()) {
          const key = `reminder-before-${record.id}`;
          if (!localStorage.getItem(key)) {
            new Notification(`Class Starting Soon: ${record.subject.name}`, {
              body: `Your class starts at ${record.startTime}. Get ready!`,
            });
            localStorage.setItem(key, 'true');
          }
        }

        // 10 mins after reminder
        const tenMinsAfter = new Date(endTime.getTime() + 10 * 60000);
        if (now.getTime() >= tenMinsAfter.getTime() && now.getTime() < (endTime.getTime() + 15 * 60000)) {
          const key = `reminder-after-${record.id}`;
          if (!localStorage.getItem(key)) {
            new Notification(`Class Ended: ${record.subject.name}`, {
              body: `Your class ended at ${record.endTime}. Please mark your attendance.`,
            });
            localStorage.setItem(key, 'true');
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [todaysClasses, notificationsEnabled]);

  const requestNotification = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") setNotificationsEnabled(true);
  };

  // Process stats for Chart
  const chartData = stats?.reduce((acc: any[], curr) => {
    return [
      ...acc,
      { name: `${curr.subjectName} Present`, value: curr.present, color: "#22c55e" }, // Green
      { name: `${curr.subjectName} Absent`, value: curr.absent, color: "#ef4444" },   // Red
    ];
  }, []) || [];
  
  // Aggregate for simple pie
  const simpleChartData = [
    { name: "Present", value: stats?.reduce((sum, s) => sum + s.present, 0) || 0, color: "#22c55e" },
    { name: "Absent", value: stats?.reduce((sum, s) => sum + s.absent, 0) || 0, color: "#ef4444" },
    { name: "Cancelled", value: stats?.reduce((sum, s) => sum + (s.total - s.present - s.absent), 0) || 0, color: "#94a3b8" },
  ];

  const totalClasses = simpleChartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        
        {!notificationsEnabled && (
          <Button 
            onClick={requestNotification}
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors h-9"
          >
            <Bell className="w-4 h-4" />
            Enable Class Reminders
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Today's Classes
            </h2>
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              {todaysClasses?.length || 0} Classes
            </span>
          </div>

          {loadingClasses ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : todaysClasses?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No classes today</h3>
              <p className="text-muted-foreground">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todaysClasses?.map((record) => (
                <ClassCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        {/* Analytics Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Overview</h2>
          
          <Card className="border-border/60 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                 <Skeleton className="h-64 w-full rounded-full" />
              ) : totalClasses === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No attendance data yet. Generate a schedule first!</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={simpleChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {simpleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.map((stat) => (
                  <div key={stat.subjectId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stat.subjectName}</span>
                      <span className={stat.percentage >= 75 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {stat.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          stat.percentage >= 75 ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
