-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "contentMDX" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modules_courseId_order_key" ON "modules"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_moduleId_slug_key" ON "lessons"("moduleId", "slug");

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing lessons to a default module
-- First, create a default module for each course that has lessons
INSERT INTO "modules" ("id", "courseId", "title", "summary", "order", "createdAt", "updatedAt")
SELECT 
    'mod_' || "courseId" || '_default',
    "courseId",
    'Módulo Principal',
    'Módulo por defecto para lecciones existentes',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "courseId" FROM "lessons"
) AS courses_with_lessons;

-- Update lessons to reference the new module
UPDATE "lessons" l
SET "moduleId" = 'mod_' || l."courseId" || '_default'
WHERE EXISTS (
    SELECT 1 FROM "modules" m 
    WHERE m."courseId" = l."courseId" 
    AND m."id" = 'mod_' || l."courseId" || '_default'
);

-- Drop the old foreign key and column from lessons
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_courseId_fkey";
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "courseId";

-- Drop the old unique constraint
DROP INDEX IF EXISTS "lessons_courseId_slug_key";
