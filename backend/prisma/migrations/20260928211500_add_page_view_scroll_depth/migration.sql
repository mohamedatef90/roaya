ALTER TABLE "page_views"
ADD COLUMN "scroll_depth" INTEGER;

ALTER TABLE "page_views"
ADD CONSTRAINT "page_views_scroll_depth_check"
CHECK ("scroll_depth" IS NULL OR "scroll_depth" BETWEEN 0 AND 100);
