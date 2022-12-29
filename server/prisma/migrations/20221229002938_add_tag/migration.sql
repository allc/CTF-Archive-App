-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "flag" VARCHAR(255);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChallengeToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengeToTag_AB_unique" ON "_ChallengeToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengeToTag_B_index" ON "_ChallengeToTag"("B");

-- AddForeignKey
ALTER TABLE "_ChallengeToTag" ADD CONSTRAINT "_ChallengeToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToTag" ADD CONSTRAINT "_ChallengeToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
