import { MigrationInterface, QueryRunner } from 'typeorm';

export class Seeders1689666889583 implements MigrationInterface {
  name = 'Seeders1689666889583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "seeders" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c47f92b5ea524850088945b62cf" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "seeders"`);
  }
}
