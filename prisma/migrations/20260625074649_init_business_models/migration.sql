-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "ban_expires" TIMESTAMP(3),
    "username" TEXT,
    "display_username" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "impersonated_by" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factors" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,

    CONSTRAINT "two_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "case_code" TEXT NOT NULL,
    "group_no" TEXT,
    "owner_auth_user_id" TEXT NOT NULL,
    "team_name" TEXT,
    "school" TEXT,
    "course_context" TEXT,
    "current_checkpoint" TEXT,
    "package_id" TEXT,
    "assigned_supporter_auth_user_id" TEXT,
    "user_facing_stage" TEXT NOT NULL DEFAULT 'intake',
    "internal_status" TEXT NOT NULL DEFAULT 'unassigned',
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_members" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "auth_user_id" TEXT NOT NULL,
    "role_in_team" TEXT,
    "access_level" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "checkpoint_code" TEXT NOT NULL,
    "checkpoint_status" TEXT NOT NULL DEFAULT 'draft',
    "latest_version_no" INTEGER NOT NULL DEFAULT 1,
    "latest_assessment_no" INTEGER NOT NULL DEFAULT 0,
    "drive_folder_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycle_units" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "checkpoint_id" TEXT NOT NULL,
    "unit_code" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "assessment_no" INTEGER NOT NULL DEFAULT 0,
    "linked_version_no" INTEGER,
    "drive_folder_id" TEXT,
    "content" TEXT,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "checkpoint_id" TEXT NOT NULL,
    "lifecycle_unit_id" TEXT,
    "audit_round_id" TEXT,
    "report_type" TEXT NOT NULL,
    "content_md" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "approved_by_auth_user_id" TEXT,
    "sent_at" TIMESTAMP(3),
    "document_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_verification',
    "proof_file_url" TEXT,
    "rejection_reason" TEXT,
    "verified_by_auth_user_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_messages" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "sender_auth_user_id" TEXT NOT NULL,
    "sender_role_snapshot" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_events" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_auth_user_id" TEXT NOT NULL,
    "document_id" TEXT,
    "report_id" TEXT,
    "audit_round_id" TEXT,
    "payment_id" TEXT,
    "meeting_id" TEXT,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input_json" JSONB,
    "output_json" JSONB,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "two_factors_secret_idx" ON "two_factors"("secret");

-- CreateIndex
CREATE INDEX "two_factors_user_id_idx" ON "two_factors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cases_case_code_key" ON "cases"("case_code");

-- CreateIndex
CREATE INDEX "cases_owner_auth_user_id_idx" ON "cases"("owner_auth_user_id");

-- CreateIndex
CREATE INDEX "cases_assigned_supporter_auth_user_id_idx" ON "cases"("assigned_supporter_auth_user_id");

-- CreateIndex
CREATE INDEX "cases_package_id_idx" ON "cases"("package_id");

-- CreateIndex
CREATE INDEX "case_members_case_id_idx" ON "case_members"("case_id");

-- CreateIndex
CREATE INDEX "case_members_auth_user_id_idx" ON "case_members"("auth_user_id");

-- CreateIndex
CREATE INDEX "checkpoints_case_id_idx" ON "checkpoints"("case_id");

-- CreateIndex
CREATE INDEX "lifecycle_units_case_id_idx" ON "lifecycle_units"("case_id");

-- CreateIndex
CREATE INDEX "lifecycle_units_checkpoint_id_idx" ON "lifecycle_units"("checkpoint_id");

-- CreateIndex
CREATE INDEX "reports_case_id_idx" ON "reports"("case_id");

-- CreateIndex
CREATE INDEX "reports_checkpoint_id_idx" ON "reports"("checkpoint_id");

-- CreateIndex
CREATE INDEX "reports_lifecycle_unit_id_idx" ON "reports"("lifecycle_unit_id");

-- CreateIndex
CREATE INDEX "reports_approved_by_auth_user_id_idx" ON "reports"("approved_by_auth_user_id");

-- CreateIndex
CREATE INDEX "payments_case_id_idx" ON "payments"("case_id");

-- CreateIndex
CREATE INDEX "payments_package_id_idx" ON "payments"("package_id");

-- CreateIndex
CREATE INDEX "payments_verified_by_auth_user_id_idx" ON "payments"("verified_by_auth_user_id");

-- CreateIndex
CREATE INDEX "case_messages_case_id_idx" ON "case_messages"("case_id");

-- CreateIndex
CREATE INDEX "case_messages_sender_auth_user_id_idx" ON "case_messages"("sender_auth_user_id");

-- CreateIndex
CREATE INDEX "case_events_case_id_idx" ON "case_events"("case_id");

-- CreateIndex
CREATE INDEX "case_events_actor_auth_user_id_idx" ON "case_events"("actor_auth_user_id");

-- CreateIndex
CREATE INDEX "case_events_report_id_idx" ON "case_events"("report_id");

-- CreateIndex
CREATE INDEX "case_events_payment_id_idx" ON "case_events"("payment_id");

-- CreateIndex
CREATE INDEX "ai_jobs_case_id_idx" ON "ai_jobs"("case_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_owner_auth_user_id_fkey" FOREIGN KEY ("owner_auth_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_assigned_supporter_auth_user_id_fkey" FOREIGN KEY ("assigned_supporter_auth_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_members" ADD CONSTRAINT "case_members_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_members" ADD CONSTRAINT "case_members_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_units" ADD CONSTRAINT "lifecycle_units_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_units" ADD CONSTRAINT "lifecycle_units_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_lifecycle_unit_id_fkey" FOREIGN KEY ("lifecycle_unit_id") REFERENCES "lifecycle_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_approved_by_auth_user_id_fkey" FOREIGN KEY ("approved_by_auth_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_auth_user_id_fkey" FOREIGN KEY ("verified_by_auth_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_messages" ADD CONSTRAINT "case_messages_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_messages" ADD CONSTRAINT "case_messages_sender_auth_user_id_fkey" FOREIGN KEY ("sender_auth_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_actor_auth_user_id_fkey" FOREIGN KEY ("actor_auth_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
