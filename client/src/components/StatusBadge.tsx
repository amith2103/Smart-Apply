import { cn } from "@/lib/utils";

type Status = "Applied" | "Interviewing" | "Offer" | "Rejected" | string;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const getStyles = (s: string) => {
    switch (s) {
      case "Offer":
        return "bg-green-100 text-green-700 border-green-200";
      case "Interviewing":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Rejected":
        return "bg-red-50 text-red-600 border-red-100";
      case "Applied":
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border",
      getStyles(status),
      className
    )}>
      {status}
    </span>
  );
}
