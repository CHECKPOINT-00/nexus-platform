import { EventEmitter } from "node:events";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { EvaluationJob } from "@app/shared";
import { resolveRepoRoot } from "../../omp-audit.service.js";

class JobStoreRepository extends EventEmitter {
  private primaryFile: string;
  private sandboxFile: string;

  constructor() {
    super();
    const root = resolveRepoRoot();
    this.primaryFile = resolve(root, "storage", "jobs_db.json");
    this.sandboxFile = "E:/Workspace/test-agent-sanbox-web/storage/jobs_db.json";
  }

  private readList(): EvaluationJob[] {
    const candidateFiles = [this.sandboxFile, this.primaryFile];
    for (const f of candidateFiles) {
      if (existsSync(f)) {
        try {
          const raw = readFileSync(f, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [];
  }

  private writeList(list: EvaluationJob[]): void {
    const raw = JSON.stringify(list, null, 2);
    const candidateFiles = [this.primaryFile, this.sandboxFile];
    for (const f of candidateFiles) {
      try {
        const dir = resolve(f, "..");
        if (existsSync(dir)) {
          writeFileSync(f, raw, "utf-8");
        }
      } catch {}
    }
  }

  public get(id: string): EvaluationJob | undefined {
    const list = this.readList();
    return list.find((j) => j.id === id);
  }

  public set(job: EvaluationJob): void {
    const list = this.readList();
    const index = list.findIndex((j) => j.id === job.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...job };
    } else {
      list.unshift(job);
    }
    this.writeList(list);
    this.emit(`job:${job.id}`, job);
    this.emit("updated", job);
  }

  public appendLog(jobId: string, agent: "omp" | "pi" | "system", message: string): void {
    const list = this.readList();
    const job = list.find((j) => j.id === jobId);
    if (!job) return;

    if (!job.logs) job.logs = [];
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent,
      message,
    };
    job.logs.push(logEntry);
    this.writeList(list);
    this.emit(`log:${jobId}`, logEntry);
    this.emit(`job:${jobId}`, job);
  }

  public cancel(id: string): EvaluationJob | undefined {
    const list = this.readList();
    const job = list.find((j) => j.id === id);
    if (!job) return undefined;
    job.status = "cancelled";
    if (job.ompStatus) job.ompStatus = "cancelled";
    job.logs = job.logs || [];
    job.logs.push({
      timestamp: new Date().toISOString(),
      agent: "system",
      message: "🛑 [HỦY] Tiến trình thẩm định đã bị ngắt bởi người dùng.",
    });
    this.writeList(list);
    this.emit(`job:${id}`, job);
    return job;
  }
}

export const jobStore = new JobStoreRepository();
