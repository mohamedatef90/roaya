-- CreateTable
CREATE TABLE "session_recording_events" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_recording_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_recording_events_session_id_idx" ON "session_recording_events"("session_id");

-- CreateIndex
CREATE INDEX "session_recording_events_session_id_sequence_idx" ON "session_recording_events"("session_id", "sequence");
