import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1689687085879 implements MigrationInterface {
  name = 'Users1689687085879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "email_verified_at" TIMESTAMP WITH TIME ZONE, "password" character varying NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b2fec6877ca9cafd88bc55ee89" ON "users" ("username") WHERE deleted_at is null`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_10cea423e3e4924f7a3c24b7ba" ON "users" ("email") WHERE deleted_at is null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10cea423e3e4924f7a3c24b7ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2fec6877ca9cafd88bc55ee89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
