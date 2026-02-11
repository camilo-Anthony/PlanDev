-- PlanDev - Migración completa para Supabase PostgreSQL
-- Generado desde prisma/schema.prisma
-- Pegar en: Supabase Dashboard → SQL Editor → New Query → Run

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "developerRate" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "qaRate" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "pmRate" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "weekLimitSimple" INTEGER NOT NULL DEFAULT 2,
    "weekLimitMedium" INTEGER NOT NULL DEFAULT 5,
    "weekLimitComplex" INTEGER NOT NULL DEFAULT 12,
    "phaseAnalysis" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "phaseDesign" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "phaseDevelopment" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "phaseTesting" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "phaseDeployment" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "contingencyLow" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "contingencyMedium" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "contingencyHigh" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "contingencyVeryHigh" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "defaultHoursPerWeek" INTEGER NOT NULL DEFAULT 40,
    "defaultTeamSize" INTEGER NOT NULL DEFAULT 1,
    "defaultDevelopers" INTEGER NOT NULL DEFAULT 1,
    "defaultQaMembers" INTEGER NOT NULL DEFAULT 0,
    "defaultHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "defaultWorkDays" TEXT NOT NULL DEFAULT '["L","M","Mi","J","V"]',
    "aiTemperature" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "aiMaxTokens" INTEGER NOT NULL DEFAULT 8000,
    "aiModel" TEXT NOT NULL DEFAULT 'sonar',

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "language" TEXT NOT NULL DEFAULT 'es',
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "developerRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qaRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pmRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursPerWeek" INTEGER NOT NULL DEFAULT 40,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3),
    "freelancerName" TEXT NOT NULL DEFAULT 'Tu Nombre',
    "workDays" TEXT NOT NULL DEFAULT '["L","M","Mi","J","V"]',
    "hoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "complexity" TEXT NOT NULL DEFAULT 'medium',
    "clientType" TEXT NOT NULL DEFAULT 'startup',
    "deadline" TEXT NOT NULL DEFAULT 'normal',
    "budgetRange" TEXT,
    "developers" INTEGER NOT NULL DEFAULT 1,
    "qaMembers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT,
    "userRoles" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '[]',
    "integrations" TEXT NOT NULL DEFAULT '[]',
    "hasPayments" BOOLEAN NOT NULL DEFAULT false,
    "screenCount" TEXT NOT NULL DEFAULT 'medium',
    "requirementsClarity" TEXT NOT NULL DEFAULT 'moderate',

    CONSTRAINT "Requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "architecture" TEXT,
    "frontend" TEXT,
    "backend" TEXT,
    "database" TEXT,
    "infrastructure" TEXT,
    "constraints" TEXT,

    CONSTRAINT "TechnicalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "contingencyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "contingencyHours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userStory" TEXT,
    "phase" TEXT NOT NULL,
    "hoursOptimistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursMostLikely" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursPessimistic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursExpected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursDeviation" DOUBLE PRECISION,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualHours" DOUBLE PRECISION,
    "role" TEXT NOT NULL DEFAULT 'developer',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "baseHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contingencyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "contingencyHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "modulesData" TEXT NOT NULL,
    "proposalData" TEXT,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "PlanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "UserConfig_userId_key" ON "UserConfig"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Project_shareToken_key" ON "Project"("shareToken");
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
CREATE INDEX "Project_type_idx" ON "Project"("type");
CREATE UNIQUE INDEX "ProjectConfig_projectId_key" ON "ProjectConfig"("projectId");
CREATE UNIQUE INDEX "Requirements_projectId_key" ON "Requirements"("projectId");
CREATE UNIQUE INDEX "TechnicalConfig_projectId_key" ON "TechnicalConfig"("projectId");
CREATE INDEX "Module_projectId_idx" ON "Module"("projectId");
CREATE INDEX "Module_order_idx" ON "Module"("order");
CREATE INDEX "Task_moduleId_idx" ON "Task"("moduleId");
CREATE INDEX "Task_phase_idx" ON "Task"("phase");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_moduleId_phase_idx" ON "Task"("moduleId", "phase");
CREATE UNIQUE INDEX "Proposal_projectId_key" ON "Proposal"("projectId");
CREATE INDEX "PlanHistory_projectId_idx" ON "PlanHistory"("projectId");
CREATE INDEX "PlanHistory_createdAt_idx" ON "PlanHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectConfig" ADD CONSTRAINT "ProjectConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Requirements" ADD CONSTRAINT "Requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TechnicalConfig" ADD CONSTRAINT "TechnicalConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanHistory" ADD CONSTRAINT "PlanHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
