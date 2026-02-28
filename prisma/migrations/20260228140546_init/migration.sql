-- CreateTable
CREATE TABLE "Champion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Champion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "championId" TEXT NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Synergy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "championId" TEXT NOT NULL,

    CONSTRAINT "Synergy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Synergy" ADD CONSTRAINT "Synergy_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
