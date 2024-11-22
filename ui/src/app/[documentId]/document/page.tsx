import SidebarLayout from "@/components/layout/sidebar-layout";
import UpdateDocument from "@/components/update-document";

import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ documentId: string }>;
};

async function DocumentPage({ params }: Props) {
  const { documentId } = await params;

  const documents = await prisma.document.findMany({
    include: {
      messages: true,
    },
  });

  const currentDocument = documents.find((doc) => doc.id === documentId);

  if (!currentDocument) {
    redirect("/");
  }

  return (
    <SidebarLayout
      currentRoute="document"
      currentDocument={currentDocument}
      documents={documents}
    >
      <div className="space-y-5">
        <h1>
          Current Document:{" "}
          <span className="font-semibold text-primary">
            {currentDocument.name}
          </span>
        </h1>

        <UpdateDocument documentId={documentId} />
      </div>
    </SidebarLayout>
  );
}

export default DocumentPage;
