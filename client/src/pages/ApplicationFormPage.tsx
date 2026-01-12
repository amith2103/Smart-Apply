import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, type InsertApplication, type Application } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateApplication, useUpdateApplication, useApplication } from "@/hooks/use-applications";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { Link, useLocation, useParams } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = insertApplicationSchema.extend({
  dateApplied: z.coerce.date().default(() => new Date()),
  followUpDate: z.coerce.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ApplicationFormPage() {
  const params = useParams<{ id: string }>();
  const isEditing = !!params.id;
  const applicationId = params.id ? Number(params.id) : undefined;
  
  const { data: existingApp, isLoading: isLoadingApp } = useApplication(applicationId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      location: "",
      jobLink: "",
      status: "Applied",
      priority: "Medium",
      salaryRange: "",
      notes: "",
      sponsorshipStatus: "Unknown",
      workAuthorization: "F1",
      sponsorshipNotes: "",
      dateApplied: new Date(),
      followUpDate: null,
      followUpDone: false,
    },
  });

  useEffect(() => {
    if (existingApp) {
      form.reset({
        companyName: existingApp.companyName || "",
        jobTitle: existingApp.jobTitle || "",
        location: existingApp.location || "",
        jobLink: existingApp.jobLink || "",
        status: existingApp.status,
        priority: existingApp.priority || "Medium",
        salaryRange: existingApp.salaryRange || "",
        notes: existingApp.notes || "",
        sponsorshipStatus: existingApp.sponsorshipStatus,
        workAuthorization: existingApp.workAuthorization,
        sponsorshipNotes: existingApp.sponsorshipNotes || "",
        dateApplied: existingApp.dateApplied ? new Date(existingApp.dateApplied) : new Date(),
        followUpDate: existingApp.followUpDate ? new Date(existingApp.followUpDate) : null,
        followUpDone: existingApp.followUpDone || false,
      });
    }
  }, [existingApp, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && applicationId) {
        await updateMutation.mutateAsync({ id: applicationId, ...values });
        toast({ title: "Updated", description: "Application updated successfully." });
      } else {
        await createMutation.mutateAsync(values);
        toast({ title: "Created", description: "Application tracked successfully." });
      }
      navigate("/applications");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive" 
      });
    }
  }

  if (isEditing && isLoadingApp) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in max-w-4xl mx-auto">
      <div className="sticky top-0 z-10 bg-background py-4 border-b mb-6 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/applications">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{isEditing ? "Edit Application" : "New Application"}</h1>
              <p className="text-sm text-muted-foreground">
                {isEditing ? "Update your application details" : "Track a new job application"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/applications">
              <Button variant="outline" data-testid="button-cancel">Cancel</Button>
            </Link>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} data-testid="button-save">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isEditing ? "Save Changes" : "Save Application"}
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Google" {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Engineer" {...field} data-testid="input-job-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interviewing">Interviewing</SelectItem>
                            <SelectItem value="Offer">Offer</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "Medium"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="dateApplied"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Applied *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [year, month, day] = e.target.value.split('-').map(Number);
                              field.onChange(new Date(year, month - 1, day, 12, 0, 0));
                            }
                          }}
                          data-testid="input-date-applied"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Remote, San Francisco" {...field} value={field.value || ''} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $150k - $180k" {...field} value={field.value || ''} data-testid="input-salary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Posting URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ''} data-testid="input-job-link" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Interview notes, HR contact, etc." 
                          {...field} 
                          value={field.value || ''} 
                          rows={3}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [year, month, day] = e.target.value.split('-').map(Number);
                              field.onChange(new Date(year, month - 1, day, 12, 0, 0));
                            } else {
                              field.onChange(null);
                            }
                          }}
                          data-testid="input-followup-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followUpDone"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-followup-done"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">Follow-up completed</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Collapsible defaultOpen={false}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Visa & Sponsorship</CardTitle>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workAuthorization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>My Work Authorization</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-work-auth">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="F1">F1 (Student)</SelectItem>
                              <SelectItem value="OPT">OPT</SelectItem>
                              <SelectItem value="CPT">CPT</SelectItem>
                              <SelectItem value="H1B">H1B</SelectItem>
                              <SelectItem value="Green Card">Green Card</SelectItem>
                              <SelectItem value="Citizen">US Citizen</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sponsorshipStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Sponsorship Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-sponsorship">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                              <SelectItem value="Not needed">Not needed</SelectItem>
                              <SelectItem value="Required">Required</SelectItem>
                              <SelectItem value="Offered">Offered</SelectItem>
                              <SelectItem value="Not offered">Not offered</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="sponsorshipNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsorship Notes</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Will sponsor H1B, Transfer only" 
                            {...field} 
                            value={field.value || ''} 
                            data-testid="input-sponsorship-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </form>
      </Form>
    </div>
  );
}
