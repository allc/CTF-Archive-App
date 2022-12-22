-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "access_level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordUser" (
    "discord_id" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "discriminator" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DiscordUser_pkey" PRIMARY KEY ("discord_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordUser_userId_key" ON "DiscordUser"("userId");

-- AddForeignKey
ALTER TABLE "DiscordUser" ADD CONSTRAINT "DiscordUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
