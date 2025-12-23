import { useState } from "react";
import { useSubjects, useCreateSubject, useDeleteSubject } from "@/hooks/use-subjects";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema, type InsertSubject } from "@shared/schema";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Subjects() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InsertSubject>({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
  });

  const onSubmit = async (data: InsertSubject) => {
    try {
      await createSubject.mutateAsync(data);
      toast({ title: "Success", description: "Subject added successfully" });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure? This will remove all schedule items associated with this subject.")) {
      try {
        await deleteSubject.mutateAsync(id);
        toast({ title: "Deleted", description: "Subject removed" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Subjects</h1>
          <p className="text-muted-foreground">Manage your courses and colors</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-4 h-4" /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. Mathematics" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Code</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    id="color" 
                    {...form.register("color")} 
                    className="w-12 h-10 p-1 cursor-pointer" 
                  />
                  <Input 
                    {...form.register("color")} 
                    placeholder="#3b82f6" 
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createSubject.isPending}>
                  {createSubject.isPending ? "Adding..." : "Add Subject"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : subjects?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No subjects yet</h3>
          <p className="text-muted-foreground">Add your first subject to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects?.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-1.5 h-full" 
                style={{ backgroundColor: subject.color || "#3b82f6" }} 
              />
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(subject.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: subject.color || "#3b82f6" }}
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {subject.color || "#3b82f6"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
