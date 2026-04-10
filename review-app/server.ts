import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import {
  getPendingCandidates,
  readRawWebcams,
  readReviewMap,
  saveDecision
} from "../lib/review/store";
import { bootstrapReviewDataset } from "../lib/review/bootstrap";

const port = Number(process.env.REVIEW_APP_PORT ?? "3010");
const root = process.cwd();
const targetCount = Number(process.env.WINDY_TARGET_COUNT ?? "500");

function sendJson(response: http.ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendFile(response: http.ServerResponse, filePath: string, contentType: string) {
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
}

async function handleApiReview(response: http.ServerResponse) {
  const [records, reviewMap] = await Promise.all([readRawWebcams(), readReviewMap()]);
  const pending = getPendingCandidates(records, reviewMap);
  sendJson(response, 200, {
    total: records.length,
    reviewed: records.length - pending.length,
    pending
  });
}

async function parseBody(request: http.IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    id?: string;
    decision?: "approved" | "rejected";
  };
}

const server = http.createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", `http://localhost:${port}`);

  try {
    if (method === "GET" && url.pathname === "/") {
      return sendFile(response, path.join(root, "review-app", "index.html"), "text/html; charset=utf-8");
    }

    if (method === "GET" && url.pathname === "/app.js") {
      return sendFile(
        response,
        path.join(root, "review-app", "app.js"),
        "application/javascript; charset=utf-8"
      );
    }

    if (method === "GET" && url.pathname === "/styles.css") {
      return sendFile(response, path.join(root, "review-app", "styles.css"), "text/css; charset=utf-8");
    }

    if (method === "GET" && url.pathname === "/api/review") {
      return await handleApiReview(response);
    }

    if (method === "POST" && url.pathname === "/api/review") {
      const body = await parseBody(request);

      if (!body.id || (body.decision !== "approved" && body.decision !== "rejected")) {
        return sendJson(response, 400, { error: "Invalid payload" });
      }

      await saveDecision(body.id, body.decision);
      return sendJson(response, 200, { ok: true });
    }

    if (method === "GET" && url.pathname.startsWith("/rounds/")) {
      return sendFile(
        response,
        path.join(root, "public", url.pathname.slice(1)),
        "image/jpeg"
      );
    }

    if (method === "GET" && url.pathname === "/favicon.ico") {
      response.writeHead(204);
      return response.end();
    }

    if (method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, { ok: true });
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Server error" });
  }
});

async function main() {
  console.log(`Bootstrapping review dataset target=${targetCount}`);
  const summary = await bootstrapReviewDataset(targetCount);
  console.log(
    `Dataset ready: ${summary.total} images, ${summary.autoRejected} auto-rejected for low quality`
  );

  server.listen(port, () => {
    console.log(`Review app running at http://localhost:${port}`);
  });
}

void main();
