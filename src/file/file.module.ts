import { Global, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileResolver, FileService],
  exports: [FileService],
})
export class FileModule {}
