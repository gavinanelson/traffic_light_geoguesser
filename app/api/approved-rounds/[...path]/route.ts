import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function contentTypeFor(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  const resolvedParams = await context.params;
  const parts = resolvedParams.path ?? [];

  if (parts.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const approvedRoundsRoot = path.resolve(process.cwd(), "approved-rounds");
  const requestedPath = path.resolve(approvedRoundsRoot, ...parts);

  if (
    requestedPath !== approvedRoundsRoot &&
    !requestedPath.startsWith(`${approvedRoundsRoot}${path.sep}`)
  ) {
    return new Response("Invalid path", { status: 400 });
  }

  if (!existsSync(requestedPath)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(readFileSync(requestedPath), {
    headers: {
      "Content-Type": contentTypeFor(requestedPath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
