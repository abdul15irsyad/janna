import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederEntity } from './entities/seeder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeederEntity])],
})
export class DatabaseModule {}
