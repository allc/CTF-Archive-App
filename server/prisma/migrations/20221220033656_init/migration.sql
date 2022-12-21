-- CreateTable
CREATE TABLE "Ctf" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "link" VARCHAR(255),
    "ctftime_link" VARCHAR(255),
    "date" DATE,

    CONSTRAINT "Ctf_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Ctf" ("name", "slug") VALUES ('Random Challenges', 'random-challenges');
