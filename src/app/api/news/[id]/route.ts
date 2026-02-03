import { NextResponse } from "next/server";
import * as newsDb from "@/lib/newsDb";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const item = await newsDb.getNewsById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("GET /api/news/[id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get news" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const patch: {
      title?: string;
      content?: string;
      year?: number;
      order?: number;
      status?: "draft" | "published";
    } = {};
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.content === "string") patch.content = body.content.trim();
    if (typeof body.year === "number") patch.year = body.year;
    if (typeof body.order === "number") patch.order = body.order;
    if (["draft", "published"].includes(body.status)) patch.status = body.status;

    const item = await newsDb.updateNews(id, patch);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("PATCH /api/news/[id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update news" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const ok = await newsDb.deleteNews(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/news/[id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete news" },
      { status: 500 }
    );
  }
}
