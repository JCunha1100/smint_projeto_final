-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sportType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "distance" REAL,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "intensity" TEXT NOT NULL,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("createdAt", "date", "distance", "duration", "id", "intensity", "location", "notes", "score", "sportType", "updatedAt", "userId") SELECT "createdAt", "date", "distance", "duration", "id", "intensity", "location", "notes", "score", "sportType", "updatedAt", "userId" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");
CREATE INDEX "Activity_sportType_idx" ON "Activity"("sportType");
CREATE INDEX "Activity_date_idx" ON "Activity"("date");
CREATE INDEX "Activity_intensity_idx" ON "Activity"("intensity");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
