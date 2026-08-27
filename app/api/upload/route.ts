import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// NOTE: this writes to the local filesystem under public/uploads, which
// works for local dev but is NOT durable on serverless hosts like Vercel
// (the filesystem there is ephemeral / read-only at runtime). Before
// deploying, swap this for Supabase Storage, S3, or Cloudinary — keep the
// same request/response shape (multipart "file" in, { url } out) so
// nothing else in the app needs to change.
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  await writeFile(path.join(uploadsDir, safeName), buffer);

  return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 });
}
