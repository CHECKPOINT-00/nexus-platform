# DB Backup Guide (for agents)

Quy trình backup database Supabase bằng Docker + pg_dump. Chạy trước/sau các thao tác seed, migration, hoặc cleanup data.

## Yêu cầu

- Docker installed + đang chạy
- `.env` có `DATABASE_URL` / `DIRECT_URL` (Supabase Postgres)
- Quyền đọc `.env` (user approve nếu bị block)

## Kiểm tra Docker trước

```powershell
# Kiểm tra Docker có installed không
Get-Command docker -ErrorAction SilentlyContinue
# Nếu không có → báo: "Docker chưa cài. Vào https://docs.docker.com/get-docker/ cài rồi chạy lại."

# Kiểm tra Docker daemon đang chạy
docker info 2>&1 | Select-String "Server Version"
# Nếu lỗi → báo: "Docker chưa chạy. Mở Docker Desktop lên rồi chạy lại."

# Agent: KHÔNG tự cài Docker. Chỉ kiểm tra và thông báo.
```

## Backup

```powershell
# 1. Lấy DIRECT_URL từ .env
$directUrl = Select-String -Path ".env" -Pattern "^DIRECT_URL=" | ForEach-Object { $_ -replace '^DIRECT_URL="(.+)"$', '$1' }

# 2. Tạo thư mục backup + tên file
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$outFile = "prisma/backup/nexus-db-backup-$timestamp.sql"
New-Item -ItemType Directory -Path "prisma/backup" -Force | Out-Null

# 3. Chạy pg_dump qua Docker (dùng port 5432, không qua pgbouncer)
docker run --rm postgres:17 pg_dump --no-owner --no-acl `
  "$directUrl" | Out-File -FilePath $outFile -Encoding utf8
```

## Kiểm tra

```powershell
Get-ChildItem prisma/backup | Select-Object Name, Length | Format-Table -AutoSize
```

File >100KB = OK. Mở head để verify có header `PostgreSQL database dump`.

## Lưu ý

- Dùng `DIRECT_URL` (port 5432), không dùng `DATABASE_URL` (port 6543 qua pgbouncer — pg_dump không chạy được)
- Server version Supabase = 17 → dùng image `postgres:17` (không 16, không 15)
- File backup lưu trong `prisma/backup/`
- Format tên file: `nexus-db-backup-YYYY-MM-DD-HHMM.sql`

## Example output

```
Name                                Length
----                                ------
nexus-db-backup-2026-07-23-0203.sql 129835
nexus-db-backup-2026-07-23-1601.sql 236863
```
