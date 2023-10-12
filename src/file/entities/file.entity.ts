import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import appConfig from 'src/app.config';

@ObjectType()
@Entity('files')
export class File extends BaseEntity {
  @Field(() => String, { description: 'path folder di server' })
  @Column('varchar', { comment: 'path folder di server' })
  path: string;

  @Field(() => String, { description: 'file name di server' })
  @Column('varchar', { name: 'file_name', comment: 'file name di server' })
  fileName: string;

  @Field(() => String, { nullable: true, description: 'url lengkap' })
  url: string;

  @Field(() => String, { description: 'nama file asli' })
  @Column('varchar', { name: 'original_file_name', comment: 'nama file asli' })
  originalFileName: string;

  @Field(() => String, { description: 'tipe mime' })
  @Column('varchar', { comment: 'tipe mime' })
  mime: string;

  @Field(() => String, { nullable: true })
  @Column('uuid', {
    name: 'user_id',
    nullable: true,
    comment: 'yang menggupload',
  })
  userId?: string;

  @Field(() => User, {
    complexity: 2,
    nullable: true,
    description: 'yang menggupload',
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @AfterLoad()
  setFile() {
    this.url =
      this.url ??
      `${appConfig().BASE_URL}/${this.path}/${encodeURIComponent(
        this.fileName,
      )}`;
  }
}
