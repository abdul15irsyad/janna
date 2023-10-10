import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { File } from './entities/file.entity';
import { parseOrderBy } from '../shared/utils/string.util';
import { FindAllFile } from './interfaces/find-all-file.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import * as mime from 'mime-types';
import { FileUpload } from 'graphql-upload-ts';
import dayjs from 'dayjs';
import { generate } from 'randomstring';
import { join } from 'path';
import { IMAGE_MIMES, UPLOAD_PATH } from './file.config';
import webp from 'webp-converter';
import { fromFile } from 'file-type';

@Injectable()
export class FileService {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {}

  protected relations: FindOptionsRelations<File> = {
    user: true,
  };

  async create(createFile: DeepPartial<File>) {
    const newFile = this.fileRepo.create(createFile);
    console.log('start create file database', createFile, newFile);
    await this.fileRepo.save(newFile);
    return this.findOneById(newFile.id);
  }

  async findWithPagination({
    page,
    limit,
    search,
    orderBy,
    orderDir,
    userId,
  }: FindAllFile = {}) {
    page = page ?? 1;
    orderBy = orderBy ?? 'createdAt';
    orderDir = orderDir ?? 'desc';
    const filter: FindOptionsWhere<File> = {
      userId: userId ?? undefined,
    };
    const findOptionsWhere: FindOptionsWhere<File> | FindOptionsWhere<File>[] =
      search ? [{ fileName: ILike(`%${search}%`), ...filter }] : filter;
    const totalAllData = await this.fileRepo.countBy(findOptionsWhere);
    const data = await this.fileRepo.find({
      where: findOptionsWhere,
      take: limit,
      skip: limit ? (page - 1) * limit : undefined,
      order: parseOrderBy(orderBy, orderDir),
      relations: this.relations,
    });
    const totalPage = limit
      ? Math.ceil(totalAllData / limit)
      : data.length > 0
      ? 1
      : null;
    return {
      totalPage,
      totalAllData,
      data,
    };
  }

  async findOneById(id: string) {
    const file = await this.fileRepo.findOne({
      where: { id },
      relations: this.relations,
    });
    return file;
  }

  async uploadFile(fileUpload: FileUpload, uploadPath?: string) {
    const uploadPathWithPublic = uploadPath
      ? `./public/${uploadPath}`
      : `./public/${UPLOAD_PATH}`;
    if (!fileUpload) return null;
    const { createReadStream, filename, mimetype } = fileUpload;
    const ext = mime.extension(mimetype);
    const timestamp = dayjs().valueOf();
    const newFileName = `${timestamp}${generate({
      length: 8,
      charset: 'numeric',
    })}`;
    let fileName = `${newFileName}.${ext}`;
    // writeFileSync(`${uploadPathWithPublic}/${fileName}`, file.buffer);
    await new Promise((resolve, reject) => {
      return createReadStream()
        .pipe(createWriteStream(join(uploadPathWithPublic, fileName)))
        .on('finish', () => resolve(true))
        .on('error', (error) => reject(error));
    });

    if (IMAGE_MIMES.find((mime) => mime === mimetype)) {
      // convert to webp
      webp.grant_permission();
      if (existsSync(`${uploadPathWithPublic}/${fileName}`)) {
        // compress image if size more than 500KB
        await webp.cwebp(
          `${uploadPathWithPublic}/${fileName}`,
          `${uploadPathWithPublic}/${newFileName}.webp`,
          `-q 75`,
        );
        // delete the original file
        if (
          fileName !== `${newFileName}.webp` &&
          existsSync(`${uploadPathWithPublic}/${fileName}`)
        ) {
          const path = `${uploadPathWithPublic}/${fileName}`;
          if (existsSync(path)) unlinkSync(path);
        }
        fileName = `${newFileName}.webp`;
      }
    }

    return {
      path: uploadPath ?? UPLOAD_PATH,
      fileName,
      originalFileName: filename,
      mime: (await fromFile(`${uploadPathWithPublic}/${fileName}`)).mime,
    };
  }
}
