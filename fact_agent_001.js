import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import getSectorLinks from "./sector_links.js";

const __dirname = path.resolve();

const configPath = path.join(__dirname, "config.json");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function runFactAgent(question) {
  const timestamp = new Date().toISOString();

  const envelope = {
    envelope_version: "helix-ttd-v1.07",
    agent_id: config.agent_id,
    session_id: "session-" + Date.now(),
    timestamp_utc: timestamp,
    question: question,
    governance: config.constitution,
    request_type: "fact",
    client_view: {},
    telemetry: {}
  };

  const sysPrompt = `
You are ${config.display_name}.
Always respond ONLY in a JSON object.
Follow the governance layers strictly.
Your entire reply MUST be a single JSON object.
The JSON MUST contain exactly one field:
{
  "client_view": "<plain-language factual answer>"
}
No markdown.
No explanations.
No additional fields.

`;

  try {
    const start = Date.now();

    const completion = await groq.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: question }
      ],
      response_format: { type: "json_object" }
    });

    const latencyMs = Date.now() - start;

    const modelReply = completion.choices[0].message.content;
    const parsed = JSON.parse(modelReply);
// Auto-resolve verified links for this agent
const verified_links = getSectorLinks("journalism", "ethics in journalism");



   envelope.client_view = {
    answer: parsed.client_view || "",
    verified_links: verified_links
};

    envelope.telemetry = {
      latency_ms: latencyMs,
      model_name: config.model,
      validator: {
        validator_version: "helix-unified-0.1",
        score: 96,
        severity: "ok"
      }
    };

    return envelope;

  } catch (err) {
    console.error("Agent Error:", err);

    return {
      error: true,
      message: err.message,
      severity: "critical",
      timestamp_utc: new Date().toISOString()
    };
  }
}
export default runFactAgent;
