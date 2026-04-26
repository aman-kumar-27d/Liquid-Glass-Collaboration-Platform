import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminAndSubscriptionPhase61714200000000 implements MigrationInterface {
  name = 'AddAdminAndSubscriptionPhase61714200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "plan" varchar CHECK( "plan" IN ('trial','free','pro','enterprise') ) NOT NULL DEFAULT 'trial',
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "metadata" text,
        CONSTRAINT "PK_subscriptions_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_subscriptions_company_created_at" ON "subscriptions" ("company_id", "created_at") `);

    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "code" character varying(64) NOT NULL,
        "discount_percent" integer NOT NULL,
        "expiry_at" TIMESTAMP,
        "usage_limit" integer,
        "used_count" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_coupons_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "redeem_codes" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "code" character varying(64) NOT NULL,
        "plan" varchar CHECK( "plan" IN ('trial','free','pro','enterprise') ) NOT NULL,
        "expiry_at" TIMESTAMP,
        "usage_limit" integer,
        "used_count" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_redeem_codes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_redeem_codes_code" UNIQUE ("code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "redeem_codes"`);
    await queryRunner.query(`DROP TABLE "coupons"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_subscriptions_company_created_at"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
  }
}
