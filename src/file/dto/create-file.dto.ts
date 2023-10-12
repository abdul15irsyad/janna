import { IsNotEmpty } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';
import { i18nValidationMessage } from 'nestjs-i18n';
import fileConfig from '../file.config';

export class CreateFileDto {
  @MaxFileSize(fileConfig().MAX_UPLOAD_FILE_SIZE, {
    message: i18nValidationMessage('validation.MAX_FILE_SIZE', {
      property: 'FILE',
      maxFileSizeInMB: fileConfig().MAX_UPLOAD_FILE_SIZE / (1024 * 1024),
    }),
  })
  @IsFile({
    message: i18nValidationMessage('validation.IS_FILE', {
      property: 'FILE',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'FILE',
    }),
  })
  file: MemoryStoredFile;
}
