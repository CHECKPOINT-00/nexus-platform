import { logJob } from "./storage.js";

export function parseAndLogAgentEvent(jobId: string, line: string): void {
  const trimmed = line.trim();
  if (!trimmed) return;
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    logJob(jobId, trimmed);
    return;
  }
  try {
    const ev = JSON.parse(trimmed);
    switch (ev.type) {
      case "turn_start":
        logJob(jobId, `🔄 [Vòng lặp] Bắt đầu lượt phân tích mới...`);
        break;

      case "tool_execution_start": {
        const tool = ev.toolName || "tool";
        let paramPreview = "";
        if (ev.args) {
          if (ev.args.path) paramPreview += ` path: "${ev.args.path}"`;
          if (ev.args.command) paramPreview += ` cmd: "${ev.args.command}"`;
          if (ev.args.pattern) paramPreview += ` pattern: "${ev.args.pattern}"`;
          if (!paramPreview) {
            const raw = JSON.stringify(ev.args);
            paramPreview = " " + (raw.length > 80 ? raw.slice(0, 80) + "..." : raw);
          }
        }
        const intentStr = ev.intent ? ` | Ý định: ${ev.intent}` : "";
        logJob(jobId, `🔧 [Gọi Tool] ${tool}${paramPreview}${intentStr}`);
        break;
      }

      case "tool_execution_end": {
        const tool = ev.toolName || "tool";
        let detail = "";
        if (ev.result?.content?.[0]?.text) {
          const len = ev.result.content[0].text.length;
          detail = ` (${len} ký tự)`;
        }
        logJob(jobId, `✅ [Xong Tool] ${tool}${detail}`);
        break;
      }

      case "message_update": {
        const ame = ev.assistantMessageEvent;
        if (ame?.type === "thinking_end" && ame.content) {
          const thought = ame.content.trim();
          if (thought) {
            const cleanThought = thought.length > 350 ? thought.slice(0, 350) + "..." : thought;
            logJob(jobId, `💭 [Suy nghĩ] ${cleanThought}`);
          }
        } else if (ame?.type === "text_end" && ame.content) {
          const text = ame.content.trim();
          if (text) {
            const preview = text.length > 250 ? text.slice(0, 250) + "..." : text;
            logJob(jobId, `📝 [Phản hồi] ${preview}`);
          }
        }
        break;
      }

      case "turn_end": {
        const usage = ev.message?.usage;
        if (usage) {
          logJob(
            jobId,
            `⏱️ [Lượt hoàn thành] Input Tokens: ${usage.input || 0} | Output: ${usage.output || 0} | Tổng: ${usage.totalTokens || 0}`
          );
        }
        break;
      }

      case "agent_end":
        logJob(jobId, `🏁 [Hoàn thành] OMP kết thúc các lượt tự hành.`);
        break;

      default:
        break;
    }
  } catch {
    logJob(jobId, trimmed);
  }
}
