import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsPhase71715200000000 implements MigrationInterface {
  name = 'AddAnalyticsPhase71715200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usage_events" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid,
        "user_id" uuid,
        "event_type" character varying(64) NOT NULL,
        "entity_type" character varying(64),
        "entity_id" uuid,
        "occurred_at" TIMESTAMP NOT NULL,
        "metadata" text,
        CONSTRAINT "PK_usage_events_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_events_company_event_occurred" ON "usage_events" ("company_id", "event_type", "occurred_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_events_user_occurred" ON "usage_events" ("user_id", "occurred_at") `
    );

    await queryRunner.query(`
      CREATE TABLE "analytics_daily_snapshots" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid,
        "scope" character varying(32) NOT NULL,
        "snapshot_date" date NOT NULL,
        "summary" text NOT NULL,
        CONSTRAINT "PK_analytics_daily_snapshots_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_analytics_daily_scope_date_company" ON "analytics_daily_snapshots" ("scope", "snapshot_date", "company_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_analytics_daily_scope_date_company"`);
    await queryRunner.query(`DROP TABLE "analytics_daily_snapshots"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usage_events_user_occurred"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_usage_events_company_event_occurred"`);
    await queryRunner.query(`DROP TABLE "usage_events"`);
  }
}
