import { db } from "./db";
import { 
  subjects, weeklySchedule, attendanceRecords, 
  type Subject, type InsertSubject, 
  type WeeklySchedule, type InsertWeeklySchedule,
  type AttendanceRecord, type InsertAttendanceRecord,
  type User, type UpsertUser, users
} from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Subjects
  getSubjects(userId: string): Promise<Subject[]>;
  createSubject(userId: string, subject: InsertSubject): Promise<Subject>;
  deleteSubject(userId: string, id: number): Promise<void>;

  // Schedule
  getWeeklySchedule(userId: string): Promise<(WeeklySchedule & { subject: Subject })[]>;
  createWeeklySchedule(userId: string, item: InsertWeeklySchedule): Promise<WeeklySchedule>;
  deleteWeeklySchedule(userId: string, id: number): Promise<void>;

  // Attendance
  getAttendanceRecords(userId: string, startDate?: string, endDate?: string): Promise<(AttendanceRecord & { subject: Subject })[]>;
  createAttendanceRecord(userId: string, record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceStatus(userId: string, id: number, status: string): Promise<AttendanceRecord | undefined>;
  getAttendanceStats(userId: string): Promise<any[]>;
  
  // Bulk create for generation
  bulkCreateAttendanceRecords(records: InsertAttendanceRecord[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  // App methods
  async getSubjects(userId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.userId, userId));
  }

  async createSubject(userId: string, subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values({ ...subject, userId }).returning();
    return newSubject;
  }

  async deleteSubject(userId: string, id: number): Promise<void> {
    // Cascading delete for schedule and attendance
    await db.delete(weeklySchedule).where(eq(weeklySchedule.subjectId, id));
    await db.delete(attendanceRecords).where(eq(attendanceRecords.subjectId, id));
    await db.delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId)));
  }

  async getWeeklySchedule(userId: string): Promise<(WeeklySchedule & { subject: Subject })[]> {
    const rows = await db.select()
      .from(weeklySchedule)
      .innerJoin(subjects, eq(weeklySchedule.subjectId, subjects.id))
      .where(eq(weeklySchedule.userId, userId));
    
    return rows.map(r => ({ ...r.weekly_schedule, subject: r.subjects }));
  }

  async createWeeklySchedule(userId: string, item: InsertWeeklySchedule): Promise<WeeklySchedule> {
    const [newItem] = await db.insert(weeklySchedule).values({ ...item, userId }).returning();
    return newItem;
  }

  async deleteWeeklySchedule(userId: string, id: number): Promise<void> {
    await db.delete(weeklySchedule).where(and(eq(weeklySchedule.id, id), eq(weeklySchedule.userId, userId)));
  }

  async getAttendanceRecords(userId: string, startDate?: string, endDate?: string): Promise<(AttendanceRecord & { subject: Subject })[]> {
    let query = db.select()
      .from(attendanceRecords)
      .innerJoin(subjects, eq(attendanceRecords.subjectId, subjects.id))
      .where(eq(attendanceRecords.userId, userId));

    if (startDate) {
      query.where(gte(attendanceRecords.date, startDate));
    }
    if (endDate) {
      query.where(lte(attendanceRecords.date, endDate));
    }
    
    // Default sort by date desc
    // query.orderBy(desc(attendanceRecords.date)); // Need to import desc

    const rows = await query;
    return rows.map(r => ({ ...r.attendance_records, subject: r.subjects })).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime() || 
      b.startTime.localeCompare(a.startTime)
    );
  }

  async createAttendanceRecord(userId: string, record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [newRecord] = await db.insert(attendanceRecords).values({ ...record, userId }).returning();
    return newRecord;
  }

  async updateAttendanceStatus(userId: string, id: number, status: string): Promise<AttendanceRecord | undefined> {
    const [updated] = await db.update(attendanceRecords)
      .set({ status })
      .where(and(eq(attendanceRecords.id, id), eq(attendanceRecords.userId, userId)))
      .returning();
    return updated;
  }

  async bulkCreateAttendanceRecords(records: InsertAttendanceRecord[]): Promise<void> {
    if (records.length === 0) return;
    await db.insert(attendanceRecords).values(records);
  }

  async getAttendanceStats(userId: string): Promise<any[]> {
    const records = await db.select({
      subjectId: attendanceRecords.subjectId,
      status: attendanceRecords.status,
    })
    .from(attendanceRecords)
    .where(and(eq(attendanceRecords.userId, userId), lte(attendanceRecords.date, new Date().toISOString().split('T')[0]))); // Only past records

    const subjectsList = await this.getSubjects(userId);
    const statsMap = new Map<number, { total: number, present: number, absent: number }>();

    subjectsList.forEach(s => {
      statsMap.set(s.id, { total: 0, present: 0, absent: 0 });
    });

    records.forEach(r => {
      const stat = statsMap.get(r.subjectId);
      if (stat) {
        if (r.status === 'present') {
          stat.total++;
          stat.present++;
        } else if (r.status === 'absent') {
          stat.total++;
          stat.absent++;
        }
        // Cancelled/Scheduled don't count towards percentage usually? Or scheduled in past counts as absent? 
        // Let's assume only explicitly marked present/absent count for now, or maybe scheduled in past = unknown/absent.
        // For simplicity: only present/absent.
      }
    });

    return subjectsList.map(s => {
      const stat = statsMap.get(s.id)!;
      return {
        subjectId: s.id,
        subjectName: s.name,
        total: stat.total,
        present: stat.present,
        absent: stat.absent,
        percentage: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0
      };
    });
  }
}

export const storage = new DatabaseStorage();
// Export authStorage specifically for the auth integration to use
export const authStorage = storage;
