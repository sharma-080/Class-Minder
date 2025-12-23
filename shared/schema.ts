import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/auth"; // Export auth models
import { users } from "./models/auth";

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").default("#3b82f6"), // Blue-500 default
});

export const weeklySchedule = pgTable("weekly_schedule", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 7=Sunday
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
});

export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  date: date("date", { mode: "string" }).notNull(), // YYYY-MM-DD
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
  status: text("status", { enum: ["scheduled", "present", "absent", "cancelled"] }).default("scheduled").notNull(),
});

// Relations
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, { fields: [subjects.userId], references: [users.id] }),
  scheduleItems: many(weeklySchedule),
  attendanceRecords: many(attendanceRecords),
}));

export const weeklyScheduleRelations = relations(weeklySchedule, ({ one }) => ({
  subject: one(subjects, { fields: [weeklySchedule.subjectId], references: [subjects.id] }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  subject: one(subjects, { fields: [attendanceRecords.subjectId], references: [subjects.id] }),
}));

// Schemas
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, userId: true });
export const insertWeeklyScheduleSchema = createInsertSchema(weeklySchedule).omit({ id: true, userId: true });
export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({ id: true, userId: true });

// Types
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type WeeklySchedule = typeof weeklySchedule.$inferSelect;
export type InsertWeeklySchedule = z.infer<typeof insertWeeklyScheduleSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

// API Types
export type GenerateScheduleRequest = {
  startDate: string; // YYYY-MM-DD
  months: number;
};
