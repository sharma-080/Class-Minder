import { format } from "date-fns";
import { Check, X, Ban, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateAttendance } from "@/hooks/use-attendance";
import { type AttendanceRecord, type Subject } from "@shared/schema";

interface ClassCardProps {
  record: AttendanceRecord & { subject: Subject };
  compact?: boolean;
}

export function ClassCard({ record, compact = false }: ClassCardProps) {
  const updateMutation = useUpdateAttendance();

  const handleStatusUpdate = (status: "present" | "absent" | "cancelled") => {
    updateMutation.mutate({ id: record.id, status });
  };

  const statusColors = {
    scheduled: "border-l-4 border-l-blue-500 bg-white",
    present: "border-l-4 border-l-green-500 bg-green-50/50",
    absent: "border-l-4 border-l-red-500 bg-red-50/50",
    cancelled: "border-l-4 border-l-gray-400 bg-gray-50/50 opacity-75",
  };

  return (
    <div className={`rounded-xl shadow-sm border border-border/60 p-4 transition-all duration-300 hover:shadow-md ${statusColors[record.status as keyof typeof statusColors]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">{record.subject.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            <span>
              {record.startTime} - {record.endTime}
            </span>
          </div>
        </div>
        {!compact && (
          <span className={`
            px-2 py-1 rounded-full text-xs font-semibold capitalize
            ${record.status === 'present' ? 'bg-green-100 text-green-700' : 
              record.status === 'absent' ? 'bg-red-100 text-red-700' :
              record.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
              'bg-blue-100 text-blue-700'}
          `}>
            {record.status}
          </span>
        )}
      </div>

      {!compact && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={record.status === 'present' ? 'default' : 'outline'}
            className={record.status === 'present' ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:border-green-200 hover:bg-green-50"}
            onClick={() => handleStatusUpdate("present")}
            disabled={updateMutation.isPending}
          >
            <Check className="w-4 h-4 mr-1" /> Present
          </Button>
          <Button
            size="sm"
            variant={record.status === 'absent' ? 'destructive' : 'outline'}
            className={record.status !== 'absent' ? "hover:text-red-600 hover:border-red-200 hover:bg-red-50" : ""}
            onClick={() => handleStatusUpdate("absent")}
            disabled={updateMutation.isPending}
          >
            <X className="w-4 h-4 mr-1" /> Absent
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-muted-foreground hover:text-gray-700"
            onClick={() => handleStatusUpdate("cancelled")}
            disabled={updateMutation.isPending}
          >
            <Ban className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
