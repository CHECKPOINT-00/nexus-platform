import '../env.js';
import { prisma } from "../db.js";
import fs from "fs";
import path from "path";

async function run() {
  const models = [
    'user',
    'session',
    'account',
    'verification',
    'twoFactor',
    'servicePackage',
    'case',
    'caseMember',
    'checkpoint',
    'lifecycleUnit',
    'documentRecord',
    'documentType',
    'report',
    'payment',
    'caseMessage',
    'caseEvent',
    'aiJob',
    'refund',
  ];

  const now = new Date();
  const dateStr = now.toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/[^a-zA-Z0-9_]/g, "");
  
  const backupDir = path.resolve("../../prisma/backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `backup_${dateStr}.json`);
  const backupData: Record<string, any[]> = {};

  console.log("Starting backup to:", backupFile);

  for (const model of models) {
    try {
      console.log(`Dumping ${model}...`);
      // @ts-ignore
      const data = await prisma[model].findMany();
      backupData[model] = data;
      console.log(`Dumped ${model}: ${data.length} rows`);
    } catch (e: any) {
      console.error(`Failed to dump model ${model}:`, e.message);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf-8");
  console.log("Backup completed successfully! File size:", fs.statSync(backupFile).size, "bytes");
  process.exit(0);
}

run().catch((err) => {
  console.error("Backup script failed:", err);
  process.exit(1);
});
