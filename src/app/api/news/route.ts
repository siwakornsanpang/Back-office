import { NextResponse } from "next/server";
import * as newsDb from "@/lib/newsDb";

export async function GET() {
  try {
    const items = await newsDb.listNews();
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/news", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list news" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, year, order, status } = body;
    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof year !== "number" ||
      typeof order !== "number" ||
      !["draft", "published"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid body: title, content, year, order, status required" },
        { status: 400 }
      );
    }
    const item = await newsDb.createNews({
      title: title.trim(),
      content: content.trim(),
      year,
      order,
      status,
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error("POST /api/news", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create news" },
      { status: 500 }
    );
  }
}
