-- Allow curriculum_id to be NULL in course_lessons
-- This enables unlinking a lesson from a course without deleting the lesson itself.

ALTER TABLE course_lessons ALTER COLUMN curriculum_id DROP NOT NULL;

-- Optional: Update the foreign key to SET NULL on delete instead of CASCADE
-- To preserve lessons even if a course (curriculum) is deleted.
-- 1. Find the current constraint name (likely course_lessons_curriculum_id_fkey)
-- 2. Drop and recreate with ON DELETE SET NULL

-- DO NOT drop if you want to keep CASCADE for total cleanup, 
-- but since the user wants to keep content, let's make it SET NULL.

ALTER TABLE course_lessons 
DROP CONSTRAINT IF EXISTS course_lessons_curriculum_id_fkey,
ADD CONSTRAINT course_lessons_curriculum_id_fkey 
  FOREIGN KEY (curriculum_id) 
  REFERENCES course_curriculums(id) 
  ON DELETE SET NULL;
