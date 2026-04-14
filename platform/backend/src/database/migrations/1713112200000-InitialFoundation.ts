import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialFoundation1713112200000 implements MigrationInterface {
  name = 'InitialFoundation1713112200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('master_admin', 'company_admin', 'moderator', 'user')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."rooms_type_enum" AS ENUM('direct', 'group', 'channel')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."room_members_role_enum" AS ENUM('owner', 'moderator', 'member')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."messages_type_enum" AS ENUM('text', 'image', 'file', 'code', 'video', 'audio', 'system')
    `);

    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(160) NOT NULL,
        "domain" character varying(160) NOT NULL,
        "plan" character varying(32) NOT NULL DEFAULT 'trial',
        CONSTRAINT "PK_companies_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_companies_domain" UNIQUE ("domain")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "email" character varying(190) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "avatar_url" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_company_email" ON "users" ("company_id", "email") `);
    await queryRunner.query(`CREATE INDEX "IDX_users_company_role_active" ON "users" ("company_id", "role", "is_active") `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "user_id" uuid NOT NULL,
        "company_id" uuid NOT NULL,
        "refresh_token_hash" character varying(255) NOT NULL,
        "user_agent" character varying(255),
        "ip_address" character varying(64),
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_user_refresh" ON "sessions" ("user_id", "refresh_token_hash") `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid,
        "actor_user_id" uuid,
        "action" character varying(120) NOT NULL,
        "resource" character varying(120) NOT NULL,
        "resource_id" character varying(120),
        "metadata" jsonb,
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_company_created_at" ON "audit_logs" ("company_id", "created_at") `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "name" character varying(160) NOT NULL,
        "type" "public"."rooms_type_enum" NOT NULL,
        "created_by" uuid NOT NULL,
        CONSTRAINT "PK_rooms_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rooms_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_rooms_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_company_type" ON "rooms" ("company_id", "type") `);

    await queryRunner.query(`
      CREATE TABLE "room_members" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "room_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "public"."room_members_role_enum" NOT NULL DEFAULT 'member',
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_room_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_room_members_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_room_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_room_members_room_user" ON "room_members" ("room_id", "user_id") `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "content" text NOT NULL,
        "type" "public"."messages_type_enum" NOT NULL DEFAULT 'text',
        "parent_message_id" uuid,
        "edited_at" TIMESTAMPTZ,
        "metadata" jsonb,
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_messages_sender_id" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_messages_parent_id" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_messages_room_created_at" ON "messages" ("room_id", "created_at") `);

    await queryRunner.query(`
      CREATE TABLE "message_reactions" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        "message_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "emoji" character varying(32) NOT NULL,
        CONSTRAINT "PK_message_reactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_message_reactions_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_message_reactions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_message_reactions_unique" ON "message_reactions" ("message_id", "user_id", "emoji") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_message_reactions_unique"`);
    await queryRunner.query(`DROP TABLE "message_reactions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_room_created_at"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_room_members_room_user"`);
    await queryRunner.query(`DROP TABLE "room_members"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_rooms_company_type"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_company_created_at"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_user_refresh"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_company_role_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_company_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."room_members_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."rooms_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
