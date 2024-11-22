import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";

import { QdrantClient } from "@qdrant/js-client-rest";

import OpenAI from "openai";

import { PrismaClient } from "@prisma/client";

const client = new QdrantClient({
  host: process.env.QDRANT_HOST,
  port: parseInt(process.env.QDRANT_PORT!),
});

const configuration = {
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL!,
};

const openai = new OpenAI({
  // custom settings, e.g.
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});
const prisma = new PrismaClient();

const app = new Elysia()
  .use(
    swagger({
      path: "/docs",
    })
  )
  .use(
    cors({
      origin: "*",
      methods: ["*"],
    })
  )
  .get("/", () => "Hello Elysia")
  .get("/document", async (ctx) => {
    return await prisma.document.findMany({
      include: {
        messages: true,
      },
    });
  })
  .post("/document", async (ctx) => {
    try {
      console.log("Incoming POST request to /document");

      // // Generate collection name
      const documentId = crypto.randomUUID();

      const isCollectionExists = await client.collectionExists(documentId);

      if (!isCollectionExists.exists) {
        await client.createCollection(documentId, {
          vectors: {
            size: 768,
            distance: "Cosine", // Metric for similarity search
          },
        });
      }
      // Extract file from request
      const formData = await ctx.request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        console.error("No file provided in the request");
        return new Response("No file provided", { status: 400 });
      }

      console.log("File received:", file.name);

      // Convert file to blob
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });

      // Load and parse PDF
      const loader = new PDFLoader(blob);
      const docs = await loader.load();

      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await textSplitter.splitDocuments(docs);

      const currentDate = new Date().toISOString();

      const embeddings = new OpenAIEmbeddings({
        configuration,
        model: "nomic-embed-text",
      });

      await prisma.document.create({
        data: {
          createdAt: currentDate,
          name: file.name,
          pageCount: docs.length,
          size: file.size,
          id: documentId,
        },
      });

      await Promise.all(
        splitDocs.map(async (doc) => {
          const id = crypto.randomUUID();

          const vectorRes = await embeddings.embedQuery(doc.pageContent);

          client.upsert(documentId, {
            wait: true,
            points: [
              {
                id,
                vector: vectorRes,
                payload: {
                  id,
                  metadata: doc.metadata,
                  documentId,
                  filename: file.name,
                  uploadedAt: currentDate,
                  pageContent: doc.pageContent,
                },
              },
            ],
          });
        })
      );

      return new Response("Document uploaded", {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error processing /document request:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  })
  .put("/document/:id", async ({ params, request }) => {
    const { id } = params;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    //convert file to blob
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Load and parse PDF
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    const currentDate = new Date().toISOString();

    const embeddings = new OpenAIEmbeddings({
      configuration,
      model: "nomic-embed-text",
    });

    await prisma.document.update({
      where: { id },
      data: {
        name: file.name,
        pageCount: docs.length,
        size: file.size,
      },
    });

    await client.delete(id, {
      wait: true,
      filter: {},
    });

    await Promise.all(
      splitDocs.map(async (doc) => {
        const vectorId = crypto.randomUUID();

        const vectorRes = await embeddings.embedQuery(doc.pageContent);

        client.upsert(id, {
          wait: true,
          points: [
            {
              id: vectorId,
              vector: vectorRes,
              payload: {
                vectorId,
                metadata: doc.metadata,
                documentId: id,
                filename: file.name,
                uploadedAt: currentDate,
                pageContent: doc.pageContent,
              },
            },
          ],
        });
      })
    );

    return new Response("Document updated", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  })
  .delete("/document/:id", async ({ params }) => {
    const { id } = params;

    await prisma.document.delete({ where: { id } });

    await client.delete(id, {
      wait: true,
      filter: {},
    });

    return new Response("Document deleted", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  })
  .post(
    "/chat/:documentId",
    async ({ params, body }) => {
      const { documentId } = params;
      const { question } = body;

      if (!question.trim()) {
        return new Response("Question is missing or empty", { status: 400 });
      }

      if (!documentId) {
        return new Response("Document ID is missing", { status: 400 });
      }

      // Generate embeddings for the question
      const embeddings = new OpenAIEmbeddings({
        configuration,
        model: "nomic-embed-text", // Use the appropriate OpenAI embedding model
      });

      const queryVector = await embeddings.embedQuery(question);

      // Perform a similarity search in Qdrant
      const searchResults = await client.search(documentId, {
        vector: queryVector,
        limit: 4,
        with_payload: true,
      });

      if (searchResults.length === 0) {
        return new Response("No relevant documents found", { status: 404 }); // NextResponse.json({
      }

      const contentText = searchResults
        .map((result) => result.payload?.pageContent)
        .join("\n");

      const prompt = `You are a helpful AI assistant, remember to give concise and detailed answers as possible, make it at least 100 words. Using the following context from a document, 
  please answer the user's question accurately and concisely. If the context doesn't contain 
  relevant information to answer the question, please say so.
  
  Context:
  ${contentText}
  
  Question: ${question}
  
  Answer:`;

      const stream = new ReadableStream({
        async start(controller) {
          const response = await openai.completions.create({
            model: "llama3.2",
            prompt,
            stream: true,
          });

          let AIResponse = "";

          for await (const chunk of response) {
            const content = chunk.choices[0]?.text || "";
            AIResponse += content;

            controller.enqueue(new TextEncoder().encode(content));
          }
          controller.close();

          const userMessage = {
            role: "user",
            content: question,
            document: {
              connect: { id: documentId },
            },
          };

          const assistantMessage = {
            role: "assistant",
            content: AIResponse,
            document: {
              connect: { id: documentId },
            },
          };

          await prisma.message.create({
            data: userMessage,
          });

          await prisma.message.create({
            data: assistantMessage,
          });
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
    {
      body: t.Object({
        question: t.String(),
      }),
    }
  )
  .onError(({ code }) => {
    if (code === "NOT_FOUND") {
      return "Route not found :(";
    }
  })
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
