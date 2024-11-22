"use client";

import { useCallback, useState } from "react";

import { useDropzone } from "react-dropzone";

import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { useRouter } from "next/navigation";

import { instance } from "@/lib/instance";

function UploadFile() {
  const [uploadProgress, setUploadProgress] = useState(false);

  const [error, setError] = useState<string>("");

  const router = useRouter();
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      setUploadProgress(true);

      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      
      try {
        await instance.post(`/document`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast({
          title: "Document uploaded successfully",
          duration: 1000,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        toast({
          title: "Something went wrong",
          variant: "destructive",
          duration: 1000,
        });
      } finally {
        setUploadProgress(false);
        router.refresh();
      }
    },
    [router, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <>
      <Card className="mb-8 p-6">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-blue-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <input {...getInputProps()} />

          {uploadProgress ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <p>Processing document...</p>
            </div>
          ) : (
            <p>Drag and drop PDF files here, or click to select files</p>
          )}
        </div>
      </Card>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}
    </>
  );
}

export default UploadFile;
