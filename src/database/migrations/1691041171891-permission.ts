import { MigrationInterface, QueryRunner } from 'typeorm';

export class Permission1691041171891 implements MigrationInterface {
  name = 'Permission1691041171891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "actions" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "UQ_5b7a1018ad270b36e66dd412b1c" UNIQUE ("slug"), CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "modules" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, "desc" text, CONSTRAINT "UQ_503404f7e2e602815906fa62e59" UNIQUE ("slug"), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "action_id" uuid NOT NULL, "module_id" uuid NOT NULL, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_roles" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "permission_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_1c354345d93728c25adca19d717" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e07d497132709affeef715a2b6" ON "permission_roles" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9173e2102ae416a0d07b0c574f" ON "permission_roles" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_b260ff500cf388b8c01569a97e1" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_738f46bb9ac6ea356f1915835d0" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_738f46bb9ac6ea356f1915835d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_b260ff500cf388b8c01569a97e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9173e2102ae416a0d07b0c574f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e07d497132709affeef715a2b6"`,
    );
    await queryRunner.query(`DROP TABLE "permission_roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "modules"`);
    await queryRunner.query(`DROP TABLE "actions"`);
  }
}
