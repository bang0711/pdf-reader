type IDocument = {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type IMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  documentId: string;
};

type DocumentWithMessages = IDocument & {
  messages: IMessage[];
};
