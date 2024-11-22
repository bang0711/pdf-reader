import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

import { redirect } from "next/navigation";

import { instance } from "@/lib/instance";

async function DocumentHistory() {
  const res = await instance.get(`/document`);
  const documents: IDocument[] = res.data;

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Document History</h2>
      {documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No documents uploaded yet.
        </p>
      ) : (
        <ScrollArea className="h-[300px] space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`mb-2 w-full rounded-lg p-3 transition-all hover:bg-primary/5`}
            >
              <form
                className="w-full"
                action={async () => {
                  "use server";
                  redirect(`/${doc.id}/chat`);
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center justify-between"
                >
                  <p className="flex-1 cursor-pointer text-left">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </button>
              </form>
            </div>
          ))}
        </ScrollArea>
      )}
    </Card>
  );
}

export default DocumentHistory;
