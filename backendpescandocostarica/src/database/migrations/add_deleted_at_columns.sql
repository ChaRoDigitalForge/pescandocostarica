-- Migration: Add deleted_at columns for soft delete functionality
-- Created: 2025-01-29
-- Description: Adds deleted_at timestamp columns to tables for soft delete pattern

-- Add deleted_at to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to tours table (if not exists)
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to tour_services table
ALTER TABLE tour_services
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to tour_inclusions table
ALTER TABLE tour_inclusions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to tour_requirements table
ALTER TABLE tour_requirements
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to tour_availability table
ALTER TABLE tour_availability
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add deleted_at to review_images table
ALTER TABLE review_images
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Create indexes for better query performance on deleted_at columns
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tours_deleted_at ON tours(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);

-- Add comment to explain the soft delete pattern
COMMENT ON COLUMN bookings.deleted_at IS 'Timestamp when record was soft deleted. NULL means active record.';
COMMENT ON COLUMN tours.deleted_at IS 'Timestamp when record was soft deleted. NULL means active record.';
COMMENT ON COLUMN reviews.deleted_at IS 'Timestamp when record was soft deleted. NULL means active record.';

-- Migration completed successfully
SELECT 'Soft delete columns added successfully!' AS status;
