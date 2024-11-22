import DeleteDocument from "@/components/delete-document";
import SidebarLayout from "@/components/layout/sidebar-layout";

import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ documentId: string }>;
};

async function SettingChatPage({ params }: Props) {
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
      currentRoute="setting"
      currentDocument={currentDocument}
      documents={documents}
    >
      <DeleteDocument documentId={documentId} />
    </SidebarLayout>
  );
}

export default SettingChatPage;
