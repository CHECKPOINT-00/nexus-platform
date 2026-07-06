import '../env.js';
import { prisma } from "../db.js";
import fs from "fs";
import path from "path";

const tableMapping: Record<string, string> = {
  user: 'users',
  session: 'sessions',
  account: 'accounts',
  verification: 'verifications',
  twoFactor: 'two_factors',
  servicePackage: 'service_packages',
  case: 'cases',
  caseMember: 'case_members',
  checkpoint: 'checkpoints',
  lifecycleUnit: 'lifecycle_units',
  documentRecord: 'document_records',
  documentType: 'document_types',
  report: 'reports',
  payment: 'payments',
  caseMessage: 'case_messages',
  caseEvent: 'case_events',
  aiJob: 'ai_jobs',
  refund: 'refunds',
};

function formatVal(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
  if (typeof val === "number") return val.toString();
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function run() {
  const now = new Date();
  const dateStr = now.toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/[^a-zA-Z0-9_]/g, "");
  
  const backupDir = path.resolve("../../prisma/backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `backup_data_${dateStr}.sql`);
  let sqlContent = `-- Database Data Backup generated on ${now.toISOString()}\n\n`;

  console.log("Starting SQL backup to:", backupFile);

  for (const [model, tableName] of Object.entries(tableMapping)) {
    try {
      console.log(`Dumping table ${tableName}...`);
      // @ts-ignore
      const rows = await prisma[model].findMany();
      if (rows.length === 0) {
        sqlContent += `-- Table ${tableName} is empty\n\n`;
        continue;
      }

      sqlContent += `-- Data for table ${tableName} (${rows.length} rows)\n`;
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(formatVal);
        
        sqlContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});\n`;
      }
      sqlContent += "\n";
      console.log(`Dumped ${tableName}: ${rows.length} rows`);
    } catch (e: any) {
      console.error(`Failed to dump model ${model} (table ${tableName}):`, e.message);
      sqlContent += `-- Failed to dump table ${tableName}: ${e.message}\n\n`;
    }
  }

  fs.writeFileSync(backupFile, sqlContent, "utf-8");
  console.log("SQL Backup completed successfully! File size:", fs.statSync(backupFile).size, "bytes");
  process.exit(0);
}

run().catch((err) => {
  console.error("SQL Backup script failed:", err);
  process.exit(1);
});
