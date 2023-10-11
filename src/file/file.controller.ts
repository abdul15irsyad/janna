import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { handleError } from '../shared/utils/error.util';
import { CreateFileDto } from './dto/create-file.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../user/entities/user.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post()
  async create(
    @Body() createFileDto: CreateFileDto,
    @AuthUser() authUser: User,
  ) {
    try {
      const file = await this.fileService.uploadAndCreate({
        fileDto: createFileDto.file,
        authUserId: authUser.id,
      });
      return {
        message: this.i18n.t('common.CREATE_SUCCESSFULL', {
          args: { property: 'FILE' },
          lang: I18nContext.current().lang,
        }),
        data: file,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
