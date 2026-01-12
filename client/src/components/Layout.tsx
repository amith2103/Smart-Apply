import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplicationForm } from "./ApplicationForm";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar onOpenNewModal={() => setIsModalOpen(true)} />
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
             <Sidebar onOpenNewModal={() => setIsModalOpen(true)} />
          </SheetContent>
        </Sheet>
        <h1 className="ml-4 font-bold text-lg">Smart Apply</h1>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Track New Application</DialogTitle>
          </DialogHeader>
          <ApplicationForm onSuccess={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
