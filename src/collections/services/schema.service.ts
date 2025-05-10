import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { CreateFieldDto } from "../dto/create-field.dto";
import { Collection } from "../entities/collection.entity";
import { FieldType } from "../enums/field-type.enum";

@Injectable()
export class SchemaService {
  generateTableName(collectionName: string): string {
    return `col_${collectionName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
  }

  async createCollectionTable(collection: Collection, fields: CreateFieldDto[], queryRunner: QueryRunner): Promise<void> {
    const tableName = collection.tableName;

    await queryRunner.query(`
      CREATE TABLE "${tableName}" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdById" uuid REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TRIGGER "${tableName}_updated_at"
      BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    for (const field of fields) {
      await this.addFieldToTable(tableName, field, queryRunner);
    }
  }

  async addFieldToTable(tableName: string, field: CreateFieldDto, queryRunner: QueryRunner): Promise<void> {
    const columnDefinition = this.getColumnDefinition(field);

    await queryRunner.query(`
      ALTER TABLE "${tableName}"
      ADD COLUMN "${field.name}" ${columnDefinition};
    `);

    if (field.isUnique) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX "${tableName}_${field.name}_unique"
        ON "${tableName}" ("${field.name}");
      `);
    }
  }

  private getColumnDefinition(field: CreateFieldDto): string {
    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
      case FieldType.EMAIL:
      case FieldType.URL:
        return "text";
      case FieldType.NUMBER:
        return "numeric";
      case FieldType.BOOLEAN:
        return "boolean";
      case FieldType.DATE:
        return "date";
      case FieldType.DATETIME:
        return "timestamp with time zone";
      case FieldType.JSON:
      case FieldType.TRANSLATIONS:
        return "jsonb";
      case FieldType.DROPDOWN_SINGLE:
        return "text";
      case FieldType.DROPDOWN_MULTIPLE:
        return "text[]";
      case FieldType.FILE:
      case FieldType.IMAGE:
        return "text";
      case FieldType.RELATION_ONE_TO_ONE:
      case FieldType.RELATION_MANY_TO_ONE:
        return field.relatedCollectionId ? `uuid REFERENCES "${this.generateTableName(field.relatedCollectionId)}"(id) ON DELETE SET NULL` : "uuid";
      default:
        return "text";
    }
  }

  async dropCollectionTable(tableName: string, queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
  }
}
