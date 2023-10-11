import { Injectable } from '@nestjs/common';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { File } from './entities/file.entity';
import { parseOrderBy } from '../shared/utils/string.util';
import { FindAllFile } from './interfaces/find-all-file.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import * as mime from 'mime-types';
import dayjs from 'dayjs';
import { generate } from 'randomstring';
import { IMAGE_MIMES, UPLOAD_PATH } from './file.config';
import webp from 'webp-converter';
import { fromFile } from 'file-type';
import { BaseService } from '../shared/services/base.service';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
export class FileService extends BaseService<File> {
  constructor(@InjectRepository(File) private fileRepo: Repository<File>) {
    super(fileRepo);
  }

  protected relations: FindOptionsRelations<File> = {
    user: true,
  };

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

  async uploadFile(file: MemoryStoredFile, uploadPath?: string) {
    const uploadPathWithPublic = uploadPath
      ? `public/${uploadPath}`
      : `public/${UPLOAD_PATH}`;
    if (!file) return null;
    const ext = mime.extension(file.mimeType);
    const timestamp = dayjs().valueOf();
    const newFileName = `${timestamp}${generate({
      length: 8,
      charset: 'numeric',
    })}`;
    let fileName = `${newFileName}.${ext}`;
    writeFileSync(`${uploadPathWithPublic}/${fileName}`, file.buffer);

    if (IMAGE_MIMES.find((mime) => mime == file.mimeType)) {
      // convert to webp
      webp.grant_permission();
      if (existsSync(`${uploadPathWithPublic}/${fileName}`)) {
        // compress image if size more than 500KB
        await webp.cwebp(
          `${uploadPathWithPublic}/${fileName}`,
          `${uploadPathWithPublic}/${newFileName}.webp`,
          file.size > 1024 * 500 ? `-q 50` : undefined,
        );
        // delete the original file
        if (
          fileName != `${newFileName}.webp` &&
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
      originalFileName: file.originalName,
      mime: (await fromFile(`${uploadPathWithPublic}/${fileName}`)).mime,
    };
  }

  async uploadAndCreate({
    fileDto,
    authUserId,
  }: {
    fileDto: MemoryStoredFile;
    authUserId: string;
  }) {
    const uploadedFile = fileDto ? await this.uploadFile(fileDto) : null;
    return uploadedFile
      ? await this.create({
          ...uploadedFile,
          userId: authUserId,
        })
      : null;
  }
}
