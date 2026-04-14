import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCallsAndScreenSharesPhase51713119400000 implements MigrationInterface {
  name = 'AddCallsAndScreenSharesPhase51713119400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "video_calls" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "started_by" uuid NOT NULL,
        "ended_at" TIMESTAMP,
        CONSTRAINT "PK_video_calls_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_video_calls_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_video_calls_started_by" FOREIGN KEY ("started_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_video_calls_room_created_at" ON "video_calls" ("room_id", "created_at") `);

    await queryRunner.query(`
      CREATE TABLE "call_participants" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "call_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        "left_at" TIMESTAMP,
        CONSTRAINT "PK_call_participants_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_call_participants_call_id" FOREIGN KEY ("call_id") REFERENCES "video_calls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_call_participants_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_call_participants_call_user" ON "call_participants" ("call_id", "user_id") `);

    await queryRunner.query(`
      CREATE TABLE "screen_shares" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "call_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "ended_at" TIMESTAMP,
        CONSTRAINT "PK_screen_shares_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_screen_shares_call_id" FOREIGN KEY ("call_id") REFERENCES "video_calls"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_screen_shares_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_screen_shares_call_user" ON "screen_shares" ("call_id", "user_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_screen_shares_call_user"`);
    await queryRunner.query(`DROP TABLE "screen_shares"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_call_participants_call_user"`);
    await queryRunner.query(`DROP TABLE "call_participants"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_video_calls_room_created_at"`);
    await queryRunner.query(`DROP TABLE "video_calls"`);
  }
}
