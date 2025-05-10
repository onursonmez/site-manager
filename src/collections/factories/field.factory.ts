import { Injectable } from '@nestjs/common';
import { Field } from '../entities/field.entity';
import { CreateFieldDto } from '../dto/create-field.dto';
import { Collection } from '../entities/collection.entity';

@Injectable()
export class FieldFactory {
  createField(fieldDto: CreateFieldDto, collection: Collection): Field {
    const field = new Field();
    Object.assign(field, {
      ...fieldDto,
      collection,
      collectionId: collection.id,
    });
    return field;
  }
}