import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Collection } from "../entities/collection.entity";
import { Field } from "../entities/field.entity";
import { CreateCollectionDto } from "../dto/create-collection.dto";
import { CreateFieldDto } from "../dto/create-field.dto";
import { UpdateCollectionDto } from "../dto/update-collection.dto";
import { SchemaService } from "./schema.service";
import { FieldFactory } from "../factories/field.factory";
import { LoggingService } from "../../logging/logging.service";

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private readonly schemaService: SchemaService,
    private readonly fieldFactory: FieldFactory,
    private readonly dataSource: DataSource,
    private readonly loggingService: LoggingService
  ) {}

  async create(createCollectionDto: CreateCollectionDto, userId: string): Promise<Collection> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if collection already exists
      const existingCollection = await this.collectionRepository.findOne({
        where: [{ name: createCollectionDto.name }],
      });

      if (existingCollection) {
        throw new ConflictException(`Collection "${createCollectionDto.name}" already exists`);
      }

      // Create collection
      const collection = this.collectionRepository.create({
        ...createCollectionDto,
        tableName: this.schemaService.generateTableName(createCollectionDto.name),
        createdById: userId,
      });

      // Save collection
      const savedCollection = await queryRunner.manager.save(collection);

      // Create database table
      await this.schemaService.createCollectionTable(savedCollection, createCollectionDto.fields || [], queryRunner);

      // Create fields if provided
      if (createCollectionDto.fields) {
        const fields = createCollectionDto.fields.map((fieldDto) => this.fieldFactory.createField(fieldDto, savedCollection));
        savedCollection.fields = await queryRunner.manager.save(fields);
      }

      await queryRunner.commitTransaction();
      return savedCollection;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Collection[]> {
    return this.collectionRepository.find({
      relations: ["fields", "createdBy"],
    });
  }

  async findOne(id: string): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
      relations: ["fields", "createdBy"],
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID "${id}" not found`);
    }

    return collection;
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const collection = await this.findOne(id);

      // Drop the collection table
      await this.schemaService.dropCollectionTable(collection.tableName, queryRunner);

      // Remove collection record
      await queryRunner.manager.remove(collection);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Creates a new record in the specified collection
   * @param collectionId The ID of the collection
   * @param data The data to insert
   * @returns The created record
   */
  async createRecord(collectionId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const collection = await this.findOne(collectionId);

    try {
      // Insert data into the collection's table
      const result = await this.dataSource.query(
        `INSERT INTO "${collection.tableName}" (${Object.keys(data)
          .map((key) => `"${key}"`)
          .join(", ")})
         VALUES (${Object.keys(data)
           .map((_, i) => `${i + 1}`)
           .join(", ")})
         RETURNING *`,
        Object.values(data)
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates records in the specified collection based on a filter
   * @param collectionId The ID of the collection
   * @param filter The filter to select records to update
   * @param data The data to update
   * @returns The number of updated records
   */
  async updateRecords(collectionId: string, filter: Record<string, any>, data: Record<string, any>): Promise<number> {
    const collection = await this.findOne(collectionId);

    try {
      // Build the SET clause for the update
      const setClause = Object.entries(data)
        .map(([key, _], index) => `"${key}" = ${index + 1}`)
        .join(", ");

      // Build the WHERE clause from the filter
      const whereConditions = Object.entries(filter)
        .map(([key, _], index) => `"${key}" = ${index + Object.keys(data).length + 1}`)
        .join(" AND ");

      // Execute the update query
      const result = await this.dataSource.query(
        `UPDATE "${collection.tableName}"
         SET ${setClause}
         WHERE ${whereConditions}
         RETURNING *`,
        [...Object.values(data), ...Object.values(filter)]
      );

      return result.length;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes records from the specified collection based on a filter
   * @param collectionId The ID of the collection
   * @param filter The filter to select records to delete
   * @returns The number of deleted records
   */
  async deleteRecords(collectionId: string, filter: Record<string, any>): Promise<number> {
    const collection = await this.findOne(collectionId);

    try {
      // Build the WHERE clause from the filter
      const whereConditions = Object.entries(filter)
        .map(([key, _], index) => `"${key}" = ${index + 1}`)
        .join(" AND ");

      // Execute the delete query
      const result = await this.dataSource.query(
        `DELETE FROM "${collection.tableName}"
         WHERE ${whereConditions}
         RETURNING *`,
        Object.values(filter)
      );

      return result.length;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Adds a new field to an existing collection
   * @param collectionId The ID of the collection to add the field to
   * @param createFieldDto The field definition to add
   * @returns The created field
   */
  async addField(collectionId: string, createFieldDto: CreateFieldDto): Promise<Field> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the collection
      const collection = await this.findOne(collectionId);

      // Check if field with the same name already exists
      const existingField = collection.fields.find((field) => field.name === createFieldDto.name);
      if (existingField) {
        throw new ConflictException(`Field with name "${createFieldDto.name}" already exists in collection "${collection.name}"`);
      }

      // Add the field to the database table
      await this.schemaService.addFieldToTable(collection.tableName, createFieldDto, queryRunner);

      // Create the field entity
      const field = this.fieldFactory.createField(createFieldDto, collection);
      const savedField = await queryRunner.manager.save(field);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedField;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates an existing field in a collection
   * @param collectionId The ID of the collection
   * @param fieldId The ID of the field to update
   * @param updateFieldDto The updated field data
   * @returns The updated field
   */
  async updateField(collectionId: string, fieldId: string, updateFieldDto: Partial<CreateFieldDto>): Promise<Field> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the collection
      const collection = await this.findOne(collectionId);

      // Find the field
      const field = collection.fields.find((f) => f.id === fieldId);
      if (!field) {
        throw new NotFoundException(`Field with ID "${fieldId}" not found in collection "${collection.name}"`);
      }

      // Check if trying to update name and if the new name already exists
      if (updateFieldDto.name && updateFieldDto.name !== field.name) {
        const existingField = collection.fields.find((f) => f.name === updateFieldDto.name);
        if (existingField) {
          throw new ConflictException(`Field with name "${updateFieldDto.name}" already exists in collection "${collection.name}"`);
        }

        // Rename column in the database table
        await queryRunner.query(`ALTER TABLE "${collection.tableName}" RENAME COLUMN "${field.name}" TO "${updateFieldDto.name}"`);
      }

      // Check if field type is changing
      if (updateFieldDto.type && updateFieldDto.type !== field.type) {
        // Get the new column type definition
        const newColumnType = this.schemaService.getColumnTypeForFieldType(updateFieldDto.type, updateFieldDto.relatedCollectionId || field.relatedCollection?.id);

        // Alter column type in the database table
        await queryRunner.query(
          `ALTER TABLE "${collection.tableName}" ALTER COLUMN "${field.name || updateFieldDto.name}" TYPE ${newColumnType} USING "${field.name || updateFieldDto.name}"::${newColumnType}`
        );
      }

      // Update field entity
      Object.assign(field, updateFieldDto);
      const savedField = await queryRunner.manager.save(field);

      // Handle uniqueness constraint changes
      if (updateFieldDto.isUnique !== undefined && updateFieldDto.isUnique !== field.isUnique) {
        const fieldName = field.name || updateFieldDto.name;
        const indexName = `${collection.tableName}_${fieldName}_unique`;

        if (updateFieldDto.isUnique) {
          // Add unique constraint
          await queryRunner.query(`CREATE UNIQUE INDEX "${indexName}" ON "${collection.tableName}" ("${fieldName}")`);
        } else {
          // Remove unique constraint
          await queryRunner.query(`DROP INDEX IF EXISTS "${indexName}"`);
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedField;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Removes a field from a collection
   * @param collectionId The ID of the collection
   * @param fieldId The ID of the field to remove
   */
  async removeField(collectionId: string, fieldId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the collection
      const collection = await this.findOne(collectionId);

      // Find the field
      const field = collection.fields.find((f) => f.id === fieldId);
      if (!field) {
        throw new NotFoundException(`Field with ID "${fieldId}" not found in collection "${collection.name}"`);
      }

      // Drop column from the database table
      await queryRunner.query(`ALTER TABLE "${collection.tableName}" DROP COLUMN "${field.name}"`);

      // Remove field entity
      await queryRunner.manager.remove(field);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates a collection
   * @param id The ID of the collection to update
   * @param updateCollectionDto The updated collection data
   * @returns The updated collection
   */
  async update(id: string, updateCollectionDto: Partial<CreateCollectionDto>): Promise<Collection> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the collection
      const collection = await this.findOne(id);

      // Check if name is being updated and if it already exists
      if (updateCollectionDto.name && updateCollectionDto.name !== collection.name) {
        const existingCollection = await this.collectionRepository.findOne({
          where: [{ name: updateCollectionDto.name }],
        });

        if (existingCollection) {
          throw new ConflictException(`Collection "${updateCollectionDto.name}" already exists`);
        }

        // If renaming, we need to rename the table
        const newTableName = this.schemaService.generateTableName(updateCollectionDto.name);
        await queryRunner.query(`ALTER TABLE "${collection.tableName}" RENAME TO "${newTableName}"`);
        collection.tableName = newTableName;
      }

      // Update collection entity
      Object.assign(collection, updateCollectionDto);
      const savedCollection = await queryRunner.manager.save(collection);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedCollection;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
