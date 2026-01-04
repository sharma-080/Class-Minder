import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { addMonths, format, parseISO, getDay, addDays } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Middleware to ensure auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Subjects
  app.get(api.subjects.list.path, requireAuth, async (req, res) => {
    const subjects = await storage.getSubjects((req.user as any).claims.sub);
    res.json(subjects);
  });

  app.post(api.subjects.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.subjects.create.input.parse(req.body);
      const subject = await storage.createSubject((req.user as any).claims.sub, input);
      res.status(201).json(subject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  app.delete(api.subjects.delete.path, requireAuth, async (req, res) => {
    await storage.deleteSubject((req.user as any).claims.sub, Number(req.params.id));
    res.status(204).send();
  });

  // Schedule
  app.get(api.schedule.list.path, requireAuth, async (req, res) => {
    const schedule = await storage.getWeeklySchedule((req.user as any).claims.sub);
    res.json(schedule);
  });

  app.post(api.schedule.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.schedule.create.input.parse(req.body);
      const item = await storage.createWeeklySchedule((req.user as any).claims.sub, input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  app.delete(api.schedule.delete.path, requireAuth, async (req, res) => {
    await storage.deleteWeeklySchedule((req.user as any).claims.sub, Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.schedule.generate.path, requireAuth, async (req, res) => {
    try {
      const { startDate, months } = api.schedule.generate.input.parse(req.body);
      const userId = (req.user as any).claims.sub;

      const schedule = await storage.getWeeklySchedule(userId);
      if (schedule.length === 0) {
        return res.status(400).json({ message: "No weekly schedule found. Please set up your timetable first." });
      }

      const start = parseISO(startDate);
      const end = addMonths(start, months);
      let current = start;
      const records = [];

      while (current <= end) {
        const day = getDay(current); // 0-6 (0=Sunday)
        const adjustedDay = day === 0 ? 7 : day; // Convert 0(Sun) to 7(Sun) to match 1-7 ISO

        const daySchedule = schedule.filter(s => s.dayOfWeek === adjustedDay);

        for (const item of daySchedule) {
          // Check if this specific instance already exists to avoid duplicates if re-running
          const existing = await storage.getAttendanceRecords(userId, format(current, 'yyyy-MM-dd'), format(current, 'yyyy-MM-dd'));
          const isDuplicate = existing.some(e => 
            e.subjectId === item.subjectId && 
            e.startTime === item.startTime && 
            e.endTime === item.endTime
          );

          if (!isDuplicate) {
            records.push({
              userId,
              subjectId: item.subjectId,
              date: format(current, 'yyyy-MM-dd'),
              startTime: item.startTime,
              endTime: item.endTime,
              status: 'scheduled',
            });
          }
        }
        current = addDays(current, 1);
      }

      await storage.bulkCreateAttendanceRecords(records);
      res.json({ message: "Schedule generated", count: records.length });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate schedule" });
    }
  });

  // Attendance
  app.get(api.attendance.list.path, requireAuth, async (req, res) => {
    const { startDate, endDate } = req.query;
    const records = await storage.getAttendanceRecords(
      (req.user as any).claims.sub,
      startDate as string,
      endDate as string
    );
    res.json(records);
  });

  app.patch(api.attendance.update.path, requireAuth, async (req, res) => {
    const { status } = req.body;
    const record = await storage.updateAttendanceStatus((req.user as any).claims.sub, Number(req.params.id), status);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  });

  app.get(api.attendance.stats.path, requireAuth, async (req, res) => {
    const stats = await storage.getAttendanceStats((req.user as any).claims.sub);
    res.json(stats);
  });

  return httpServer;
}
