import { useState } from "react";
import { useAttendance } from "@/hooks/use-attendance";
import { format, subDays, addDays } from "date-fns";
import { ClassCard } from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const [date, setDate] = useState(new Date());
  
  // Fetch for single day
  const dateStr = format(date, "yyyy-MM-dd");
  const { data: records, isLoading } = useAttendance(dateStr, dateStr);

  const prevDay = () => setDate(d => subDays(d, 1));
  const nextDay = () => setDate(d => addDays(d, 1));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 bg-card p-4 rounded-2xl shadow-sm border border-border">
        <Button variant="ghost" size="icon" onClick={prevDay}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold">{format(date, "EEEE")}</h2>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <CalendarIcon className="w-3 h-3" />
            {format(date, "MMMM do, yyyy")}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={nextDay}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : records?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No classes scheduled for this day.</p>
          </div>
        ) : (
          records?.map(record => (
            <ClassCard key={record.id} record={record} />
          ))
        )}
      </div>
    </div>
  );
}
