-- CreateIndex
CREATE INDEX "Job_clientId_idx" ON "Job"("clientId");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Proposal_jobId_idx" ON "Proposal"("jobId");

-- CreateIndex
CREATE INDEX "Proposal_freelancerId_idx" ON "Proposal"("freelancerId");
