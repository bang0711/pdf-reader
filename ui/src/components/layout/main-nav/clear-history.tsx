import { useSidebar } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { Trash } from "lucide-react";

import { instance } from "@/lib/instance";

import { useParams, useRouter } from "next/navigation";

import { useState } from "react";

function ClearHistory() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { documentId } = params;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { open } = useSidebar();

  const handleClearHistory = async () => {
    setIsLoading(true);

    const res = await instance.post(`/api/clear-history/${documentId}`);

    toast({
      title: res.status === 200 ? "Success" : "Error",
      description:
        res.status === 200 ? "Chat history cleared" : "Something went wrong",
      duration: 1000,
      variant: res.status === 200 ? "default" : "destructive",
    });
    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  };
  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger
          asChild={!open}
          className={`flex items-center justify-center gap-1 rounded-md py-2 text-sm text-sidebar-foreground transition-all duration-300 hover:bg-sidebar-accent hover:text-destructive`}
        >
          {open ? (
            <>
              <Trash size={15} />
              Clear Chat
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center py-2 text-sidebar-foreground transition-all duration-300 hover:bg-sidebar-accent hover:text-destructive"
              >
                <Trash size={15} />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Clear Chat</p>
              </TooltipContent>
            </Tooltip>
          )}
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              messages and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button onClick={handleClearHistory} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-2 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                  <p>Clearing</p>
                </div>
              ) : (
                <p>Clear Chat</p>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ClearHistory;
