-- CreateEnum
CREATE TYPE "public"."TableType" AS ENUM ('REGULAR', 'VIP', 'FAMILY');

-- CreateEnum
CREATE TYPE "public"."TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."WalkInStatus" AS ENUM ('WAITING', 'SEATED', 'LEFT');

-- CreateTable
CREATE TABLE "public"."tables" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "minSeats" INTEGER NOT NULL,
    "maxSeats" INTEGER NOT NULL,
    "type" "public"."TableType" NOT NULL DEFAULT 'REGULAR',
    "status" "public"."TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "description" TEXT,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "shape" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guests" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reservations" (
    "id" UUID NOT NULL,
    "guestId" UUID NOT NULL,
    "tableId" UUID NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 120,
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "specialRequests" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" UUID NOT NULL,
    "tableId" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "totalGuests" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION,
    "peakHourStart" INTEGER,
    "peakHourEnd" INTEGER,
    "avgDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."walk_in_guests" (
    "id" UUID NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "guestName" TEXT,
    "phone" TEXT,
    "tableId" UUID,
    "status" "public"."WalkInStatus" NOT NULL DEFAULT 'WAITING',
    "estimatedWait" INTEGER,
    "seatedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "walk_in_guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."waiting_queue" (
    "id" UUID NOT NULL,
    "walkInId" UUID NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "preferredTableType" "public"."TableType",
    "estimatedWait" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tables_number_key" ON "public"."tables"("number");

-- CreateIndex
CREATE UNIQUE INDEX "guests_phone_key" ON "public"."guests"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_date_tableId_key" ON "public"."analytics"("date", "tableId");

-- AddForeignKey
ALTER TABLE "public"."reservations" ADD CONSTRAINT "reservations_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservations" ADD CONSTRAINT "reservations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analytics" ADD CONSTRAINT "analytics_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."walk_in_guests" ADD CONSTRAINT "walk_in_guests_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."waiting_queue" ADD CONSTRAINT "waiting_queue_walkInId_fkey" FOREIGN KEY ("walkInId") REFERENCES "public"."walk_in_guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
