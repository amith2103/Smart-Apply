import { useState, useEffect } from "react";
import { useApplications, useDeleteApplication } from "@/hooks/use-applications";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Search, MapPin, Building2, MoreHorizontal, ExternalLink, CalendarClock, Trash2, Edit, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type Application } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function ApplicationsList() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  
  const [search, setSearch] = useState(params.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>(params.get("status") || "all");
  const [sponsorshipFilter, setSponsorshipFilter] = useState<string>(params.get("sponsorshipStatus") || "all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: applications, isLoading } = useApplications({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    sponsorshipStatus: sponsorshipFilter === "all" ? undefined : (sponsorshipFilter as any),
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
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your job search</p>
        </div>
        
        <Link href="/applications/new">
          <Button data-testid="button-add-application">
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search companies or roles..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sponsorshipFilter} onValueChange={setSponsorshipFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-sponsorship-filter">
            <SelectValue placeholder="Sponsorship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sponsorship</SelectItem>
            <SelectItem value="Offered">Offered</SelectItem>
            <SelectItem value="Not offered">Not offered</SelectItem>
            <SelectItem value="Required">Required</SelectItem>
            <SelectItem value="Not needed">Not needed</SelectItem>
            <SelectItem value="Unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
         <div className="space-y-3">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
           ))}
         </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium">No applications found</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all" ? "Try adjusting your filters." : "Start tracking your first application."}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/applications/new">
              <Button className="mt-4" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {applications?.map((app) => (
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onDelete={() => setDeletingId(app.id)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
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

function ApplicationCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  const isOverdue = app.followUpDate && new Date(app.followUpDate) < new Date() && !app.followUpDone;

  const getSponsorshipVariant = (status: string) => {
    switch (status) {
      case "Offered": return "default";
      case "Not offered": return "destructive";
      case "Required": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card className="hover:border-primary/30 transition-colors" data-testid={`card-application-${app.id}`}>
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-medium truncate">{app.jobTitle}</h3>
            <StatusBadge status={app.status} />
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <CalendarClock className="w-3 h-3 mr-1" /> Overdue
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
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
              {format(new Date(app.dateApplied), "MMM d, yyyy")}
            </div>
            <Badge variant={getSponsorshipVariant(app.sponsorshipStatus)} className="text-xs">
              {app.sponsorshipStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {app.jobLink && (
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
              <a href={app.jobLink} target="_blank" rel="noopener noreferrer" data-testid={`link-job-${app.id}`}>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground" data-testid={`button-menu-${app.id}`}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${app.id}/edit`} className="flex items-center cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
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
