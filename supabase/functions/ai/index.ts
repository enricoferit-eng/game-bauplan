// Nordlicht – Claude für angemeldete Nutzer: stellt Folgefragen, wertet Gedanken aus, arbeitet Konzepte aus.
// Der API-Schlüssel liegt als Secret ANTHROPIC_API_KEY nur hier auf dem Server.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") ?? 40);
const MAX_PROMPT = 60_000;
const TASKS: Record<string, { effort: "low" | "medium"; maxTokens: number }> = {
  questions: { effort: "low", maxTokens: 8000 },
  thoughts: { effort: "low", maxTokens: 4000 },
  elaborate: { effort: "medium", maxTokens: 16000 },
};
// Feste Form für die Folgefragen, damit die Antwort immer gültiges JSON ist
const QUESTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["abdeckung", "fertig", "luecken", "fragen"],
  properties: {
    abdeckung: { type: "integer" },
    fertig: { type: "boolean" },
    luecken: { type: "array", items: { type: "string" } },
    fragen: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["thema", "kurz", "frage", "hilfe", "optionen"],
        properties: {
          thema: { type: "string" },
          kurz: { type: "string" },
          frage: { type: "string" },
          hilfe: { type: "string" },
          optionen: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["emoji", "text", "info", "exklusiv"],
              properties: { emoji: { type: "string" }, text: { type: "string" }, info: { type: "string" }, exklusiv: { type: "boolean" } },
            },
          },
        },
      },
    },
  },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Holt das JSON-Objekt aus einer Textantwort (auch wenn es in ```json … ``` steht)
function parseJson(text: string) {
  const t = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(t); } catch { /* weiter unten */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(t.slice(a, b + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return reply(500, { error: "config" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(jwt);
  if (!auth?.user) return reply(401, { error: "auth" });

  let body: { task?: string; prompt?: string };
  try { body = await req.json(); } catch { return reply(400, { error: "bad_request" }); }
  const task = TASKS[body.task ?? ""];
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!task || !prompt || prompt.length > MAX_PROMPT) return reply(400, { error: "bad_request" });

  const { data: allowed, error: limitErr } = await admin.rpc("gb_ai_hit", { p_user: auth.user.id, p_limit: DAILY_LIMIT });
  if (limitErr) return reply(500, { error: "config" });
  if (!allowed) return reply(429, { error: "limit" });

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: task.maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: body.task === "questions"
        ? { effort: task.effort, format: { type: "json_schema", schema: QUESTION_SCHEMA } }
        : { effort: task.effort },
      messages: [{ role: "user", content: prompt }],
    } as any);
    if (response.stop_reason === "refusal") return reply(422, { error: "refusal" });
    const text = response.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
    return reply(200, { json: parseJson(text) });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return reply(429, { error: "rate_limited" });
    if (e instanceof Anthropic.AuthenticationError) return reply(500, { error: "config" });
    if (e instanceof Anthropic.APIError) return reply(502, { error: "upstream", status: e.status });
    if (e instanceof SyntaxError) return reply(502, { error: "format" });
    return reply(500, { error: "unknown" });
  }
});
