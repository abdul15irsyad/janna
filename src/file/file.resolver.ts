import { Resolver, Query, Args } from '@nestjs/graphql';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { handleError } from '../shared/utils/error.util';
import { FindAllFileDto } from './dto/find-all-file.dto';
import { PaginatedFile } from './object-types/paginated-file.object-type';
import { setMeta } from '../shared/utils/object.util';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => File)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  @Query(() => PaginatedFile, { name: 'files', nullable: true })
  async findAll(
    @Args('findAllFileInput', { type: () => FindAllFileDto, nullable: true })
    findAllFileInput: FindAllFileDto,
  ) {
    try {
      const files = await this.fileService.findWithPagination(findAllFileInput);
      return {
        meta: setMeta({ page: findAllFileInput?.page, ...files }),
        data: files.data,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
