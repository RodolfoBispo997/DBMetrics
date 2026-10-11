-- The application serializes JavaScript Dates as UTC wall-clock values in the
-- legacy timestamp-without-time-zone columns. Interpret existing values as UTC
-- instants during conversion so their historical instants are preserved.
ALTER TABLE "alert_outbox_events"
    ALTER COLUMN "availableAt" DROP DEFAULT,
    ALTER COLUMN "createdAt" DROP DEFAULT;

ALTER TABLE "alert_outbox_events"
    ALTER COLUMN "availableAt" TYPE TIMESTAMPTZ(3)
        USING "availableAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "publishedAt" TYPE TIMESTAMPTZ(3)
        USING "publishedAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "claimedAt" TYPE TIMESTAMPTZ(3)
        USING "claimedAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "claimExpiresAt" TYPE TIMESTAMPTZ(3)
        USING "claimExpiresAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "failedAt" TYPE TIMESTAMPTZ(3)
        USING "failedAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3)
        USING "createdAt" AT TIME ZONE 'UTC',
    ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3)
        USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "alert_outbox_events"
    ALTER COLUMN "availableAt" SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
