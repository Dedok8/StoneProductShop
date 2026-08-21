-- CreateTable
CREATE TABLE "inspiration_images" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspiration_images_pkey" PRIMARY KEY ("id")
);
