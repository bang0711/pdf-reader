import ChatInterface from "@/components/chat/chat-interface";
import SidebarLayout from "@/components/layout/sidebar-layout";

import { instance } from "@/lib/instance";

import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ documentId: string }>;
};

async function DocumentChatPage({ params }: Props) {
  const { documentId } = await params;

  const res = await instance.get(`/document`);

  const documents: DocumentWithMessages[] = res.data;

  const currentDocument = documents.find((doc) => doc.id === documentId);

  if (!currentDocument) {
    redirect("/");
  }

  return (
    <SidebarLayout
      currentRoute="chat"
      currentDocument={currentDocument}
      documents={documents}
    >
      <ChatInterface
        currentDocument={currentDocument}
        currentMessages={currentDocument.messages}
      />
    </SidebarLayout>
  );
}

export default DocumentChatPage;
