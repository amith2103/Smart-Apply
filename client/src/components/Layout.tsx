import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-30 flex items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
             <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="ml-3 font-semibold">Smart Apply</h1>
      </div>

      <main className="flex-1 md:ml-56 p-4 md:p-8 pt-18 md:pt-8">
        {children}
      </main>
    </div>
  );
}
