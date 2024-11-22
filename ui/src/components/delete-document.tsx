"use client";

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { instance } from "@/lib/instance";

import { useRouter } from "next/navigation";

import { useState } from "react";

type Props = {
  documentId: string;
};

function DeleteDocument({ documentId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteDocument = async () => {
    setIsLoading(true);

    const res = await instance.delete(`/document/${documentId}`);

    toast({
      title: res.status === 200 ? "Success" : "Error",
      description:
        res.status === 200 ? "Document deleted" : "Something went wrong",
      duration: 1000,
      variant: res.status === 200 ? "default" : "destructive",
    });

    setIsLoading(false);
    setIsOpen(false);
    router.push("/");
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Document</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            document and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button onClick={handleDeleteDocument} disabled={isLoading}>
            {isLoading ? "Loading..." : "Delete Document"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDocument;
