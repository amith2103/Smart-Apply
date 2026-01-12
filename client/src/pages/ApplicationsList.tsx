import { useState } from "react";
import { useApplications, useDeleteApplication } from "@/hooks/use-applications";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/ApplicationForm";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Search, MapPin, Building2, MoreHorizontal, ExternalLink, CalendarClock, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type Application } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ApplicationsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: applications, isLoading } = useApplications({
    search,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  });

  const deleteMutation = useDeleteApplication();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
      toast({ title: "Deleted", description: "Application removed successfully." });
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Applications</h2>
          <p className="text-muted-foreground">Manage and track your job search.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interviewing">Interviewing</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
         <div className="space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
           ))}
         </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
          <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No applications found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            {search ? "Try adjusting your search terms." : "Start by adding your first job application."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications?.map((app) => (
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onEdit={() => setEditingApp(app)}
              onDelete={() => setDeletingId(app.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          {editingApp && (
            <ApplicationForm 
              initialData={editingApp} 
              onSuccess={() => setEditingApp(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ApplicationCard({ app, onEdit, onDelete }: { app: Application; onEdit: () => void; onDelete: () => void }) {
  const isOverdue = app.followUpDate && new Date(app.followUpDate) < new Date() && !app.followUpDone;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border group">
      <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold truncate">{app.jobTitle}</h3>
            <StatusBadge status={app.status} />
            {isOverdue && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CalendarClock className="w-3 h-3" /> Overdue Follow-up
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              {app.companyName}
            </div>
            {app.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {app.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" />
              Applied {format(new Date(app.dateApplied), "MMM d, yyyy")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
          {app.jobLink && (
            <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 text-muted-foreground hover:text-primary">
              <a href={app.jobLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
