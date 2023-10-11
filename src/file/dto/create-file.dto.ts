import { IsNotEmpty } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MAX_UPLOAD_FILE_SIZE } from '../file.config';

export class CreateFileDto {
  @MaxFileSize(MAX_UPLOAD_FILE_SIZE, {
    message: i18nValidationMessage('validation.MAX_FILE_SIZE', {
      property: 'FILE',
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
