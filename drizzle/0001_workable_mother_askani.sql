ALTER TABLE
    "challenge" DROP COLUMN "id";

ALTER TABLE
    "challenge"
ADD
    COLUMN "id" integer NOT NULL;

ALTER TABLE
    "challenge"
ALTER COLUMN
    "id"
ADD
    GENERATED ALWAYS AS IDENTITY (
        sequence name "challenge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1
    );

-- Add pkey
ALTER TABLE
    "challenge"
ADD
    PRIMARY KEY ("id");