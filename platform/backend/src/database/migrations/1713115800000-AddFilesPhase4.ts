import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesPhase41713115800000 implements MigrationInterface {
  name = 'AddFilesPhase41713115800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "message_id" uuid,
        "uploaded_by" uuid NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "stored_name" character varying(255) NOT NULL,
        "file_url" character varying(500),
        "mime_type" character varying(160) NOT NULL,
        "size" bigint NOT NULL,
        "storage_driver" character varying(32) NOT NULL DEFAULT 'local',
        "storage_path" character varying(500) NOT NULL,
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_files_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_files_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_files_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_files_message_id" ON "files" ("message_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_files_message_id"`);
    await queryRunner.query(`DROP TABLE "files"`);
  }
}
