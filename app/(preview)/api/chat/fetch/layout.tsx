import type { Metadata } from "next";



export const metadata: Metadata = {
    metadataBase: new URL("https://ai-sdk-preview-rag.vercel.app"),
    title: "Codebase RAG",
    description:
        "Augment language model generations with vector based retrieval using the Huggingface Embeddings API, Pinecone and Groq",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
