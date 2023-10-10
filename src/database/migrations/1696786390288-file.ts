import { MigrationInterface, QueryRunner } from 'typeorm';

export class File1696786390288 implements MigrationInterface {
  name = 'File1696786390288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "path" character varying NOT NULL, "file_name" character varying NOT NULL, "original_file_name" character varying NOT NULL, "mime" character varying NOT NULL, "user_id" uuid, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id")); COMMENT ON COLUMN "files"."path" IS 'path folder di server'; COMMENT ON COLUMN "files"."file_name" IS 'file name di server'; COMMENT ON COLUMN "files"."original_file_name" IS 'nama file asli'; COMMENT ON COLUMN "files"."mime" IS 'tipe mime'; COMMENT ON COLUMN "files"."user_id" IS 'yang menggupload'`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`,
    );
    await queryRunner.query(`DROP TABLE "files"`);
  }
}
