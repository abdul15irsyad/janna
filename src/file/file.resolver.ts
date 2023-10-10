import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { handleError } from '../shared/utils/error.util';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { FindAllFileDto } from './dto/find-all-file.dto';
import { PaginatedFile } from './object-types/paginated-file.object-type';
import { Inject } from '@nestjs/common';

@Resolver(() => File)
export class FileResolver {
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  @Mutation(() => File, { name: 'createFile' })
  async create(
    @Args('file', { type: () => GraphQLUpload })
    fileUpload: FileUpload,
  ) {
    try {
      const uploadedFile = await this.fileService.uploadFile(fileUpload);
      return await this.fileService.create(uploadedFile);
    } catch (error) {
      console.error(error);
      handleError(error);
    }
  }

  @Query(() => PaginatedFile, { name: 'files', nullable: true })
  async findAll(
    @Args('findAllFileInput', { type: () => FindAllFileDto, nullable: true })
    findAllFileInput: FindAllFileDto,
  ) {
    try {
      const { data, totalAllData, totalPage } =
        await this.fileService.findWithPagination(findAllFileInput);
      return {
        meta: {
          currentPage: data.length > 0 ? findAllFileInput?.page ?? 1 : null,
          totalPage,
          totalData: data.length,
          totalAllData,
        },
        data,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
