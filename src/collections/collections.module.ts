import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Field } from './entities/field.entity';
import { CollectionService } from './services/collection.service';
import { SchemaService } from './services/schema.service';
import { FieldFactory } from './factories/field.factory';
import { CollectionsController } from './collections.controller';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, Field]),
    LoggingModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionService, SchemaService, FieldFactory],
  exports: [CollectionService],
})
export class CollectionsModule {}