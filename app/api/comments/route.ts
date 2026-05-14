import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createJsonFileStore } from "@/lib/jsonFileStore";

export const dynamic = "force-dynamic";

export type StoredComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

const commentsStore = createJsonFileStore("comments.json");

async function readComments(): Promise<StoredComment[]> {
  const raw = await commentsStore.read<unknown>([]);
  if (!Array.isArray(raw)) return [];
  return raw as StoredComment[];
}

async function writeComments(comments: StoredComment[]): Promise<void> {
  await commentsStore.write(comments);
}

export async function GET() {
  const comments = await readComments();
  const sorted = [...comments].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return NextResponse.json(sorted);
}

export async function POST(request: NextRequest) {
  let body: { author?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const author = typeof body.author === "string" ? body.author.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!author || author.length > 80) {
    return NextResponse.json(
      { error: "İsim 1–80 karakter olmalıdır." },
      { status: 400 }
    );
  }
  if (!text || text.length > 1000) {
    return NextResponse.json(
      { error: "Yorum 1–1000 karakter olmalıdır." },
      { status: 400 }
    );
  }

  try {
    const comments = await readComments();
    const next: StoredComment = {
      id: randomUUID(),
      author,
      text,
      createdAt: new Date().toISOString(),
    };
    comments.push(next);
    await writeComments(comments);

    return NextResponse.json(next, { status: 201 });
  } catch (e) {
    console.error("[api/comments] write failed:", e);
    return NextResponse.json(
      { error: "Sunucuda yorum kaydedilemedi." },
      { status: 500 }
    );
  }
}
