import { useState } from "react";
import { useSchedule, useCreateScheduleItem, useDeleteScheduleItem, useGenerateSchedule } from "@/hooks/use-schedule";
import { useSubjects } from "@/hooks/use-subjects";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeeklyScheduleSchema, type InsertWeeklySchedule } from "@shared/schema";
import { z } from "zod";
import { Plus, Trash2, CalendarRange, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths } from "date-fns";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Timetable() {
  const { data: schedule, isLoading: loadingSchedule } = useSchedule();
  const { data: subjects } = useSubjects();
  const createItem = useCreateScheduleItem();
  const deleteItem = useDeleteScheduleItem();
  const generateSchedule = useGenerateSchedule();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Add Item Form
  const form = useForm<InsertWeeklySchedule>({
    resolver: zodResolver(insertWeeklyScheduleSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  // Generate Form
  const [generateParams, setGenerateParams] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    months: 1
  });

  const onAddItem = async (data: InsertWeeklySchedule) => {
    try {
      await createItem.mutateAsync({
        ...data,
        subjectId: Number(data.subjectId),
        dayOfWeek: Number(data.dayOfWeek)
      });
      toast({ title: "Success", description: "Class added to schedule" });
      setIsAddOpen(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const onGenerate = async () => {
    try {
      const res = await generateSchedule.mutateAsync({
        startDate: generateParams.startDate,
        months: Number(generateParams.months)
      });
      toast({ title: "Schedule Generated", description: `${res.count} classes scheduled!` });
      setIsGenerateOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Remove this class from weekly schedule?")) {
      await deleteItem.mutateAsync(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Weekly Timetable</h1>
          <p className="text-muted-foreground">Define your routine structure here</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Class to Timetable</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onAddItem)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select onValueChange={(v) => form.setValue("subjectId", parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.subjectId && <p className="text-red-500 text-sm">Subject required</p>}
                </div>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select 
                    defaultValue="1" 
                    onValueChange={(v) => form.setValue("dayOfWeek", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" {...form.register("startTime")} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" {...form.register("endTime")} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createItem.isPending}>
                  {createItem.isPending ? "Adding..." : "Add to Schedule"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Play className="w-4 h-4" /> Generate Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Attendance Records</DialogTitle>
                <DialogDescription>
                  This will create attendance records for the upcoming months based on your weekly timetable defined below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Start From</Label>
                  <Input 
                    type="date" 
                    value={generateParams.startDate}
                    onChange={(e) => setGenerateParams({...generateParams, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Months</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={12}
                    value={generateParams.months}
                    onChange={(e) => setGenerateParams({...generateParams, months: parseInt(e.target.value)})}
                  />
                </div>
                <Button onClick={onGenerate} className="w-full" disabled={generateSchedule.isPending}>
                  {generateSchedule.isPending ? "Generating..." : "Generate Classes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {days.map((dayName, index) => {
          const dayNum = index + 1;
          const dayItems = schedule?.filter(item => item.dayOfWeek === dayNum).sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          return (
            <div key={dayName} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/50 p-3 border-b border-border font-semibold text-center text-sm uppercase tracking-wider text-muted-foreground">
                {dayName}
              </div>
              <div className="p-4 space-y-3 min-h-[200px]">
                {dayItems?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 text-sm italic py-8">
                    No classes
                  </div>
                ) : (
                  dayItems?.map(item => (
                    <div 
                      key={item.id} 
                      className="bg-background rounded-lg p-3 border border-border shadow-sm hover:shadow-md transition-shadow relative group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ backgroundColor: item.subject.color || '#ccc' }} />
                      <div className="pl-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm">{item.subject.name}</h4>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
