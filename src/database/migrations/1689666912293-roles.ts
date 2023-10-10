import { MigrationInterface, QueryRunner } from 'typeorm';

export class Roles1689666912293 implements MigrationInterface {
  name = 'Roles1689666912293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_222ff81ddc616527f4ea946c1d" ON "roles" ("slug") WHERE deleted_at is null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_222ff81ddc616527f4ea946c1d"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
