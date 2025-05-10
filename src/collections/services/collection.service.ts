import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Collection } from "../entities/collection.entity";
import { CreateCollectionDto } from "../dto/create-collection.dto";
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
  async createRecord(collectionId: string, data: Record<string, any>): Promise<any> {
    const collection = await this.findOne(collectionId);

    try {
      // Execute an INSERT query on the collection's table
      const result = await this.dataSource.query(
        `INSERT INTO "${collection.tableName}" (${Object.keys(data)
          .map((key) => `"${key}"`)
          .join(", ")}) 
         VALUES (${Object.keys(data)
           .map((_, index) => `${index + 1}`)
           .join(", ")}) 
         RETURNING *`,
        Object.values(data)
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateRecords(collectionId: string, filter: Record<string, any>, data: Record<string, any>): Promise<any> {
    const collection = await this.findOne(collectionId);

    try {
      // Build the SET clause for the UPDATE query
      const setClause = Object.entries(data)
        .map(([key, _], index) => `"${key}" = ${index + 1}`)
        .join(", ");

      // Build the WHERE clause from the filter
      const whereConditions = Object.entries(filter)
        .map(([key, _], index) => `"${key}" = ${index + Object.keys(data).length + 1}`)
        .join(" AND ");

      // Execute the UPDATE query
      const result = await this.dataSource.query(
        `UPDATE "${collection.tableName}" 
         SET ${setClause} 
         WHERE ${whereConditions || "true"} 
         RETURNING *`,
        [...Object.values(data), ...Object.values(filter)]
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteRecords(collectionId: string, filter: Record<string, any>): Promise<any> {
    const collection = await this.findOne(collectionId);

    try {
      // Build the WHERE clause from the filter
      const whereConditions = Object.entries(filter)
        .map(([key, _], index) => `"${key}" = ${index + 1}`)
        .join(" AND ");

      // Execute the DELETE query
      const result = await this.dataSource.query(
        `DELETE FROM "${collection.tableName}" 
         WHERE ${whereConditions || "true"} 
         RETURNING *`,
        Object.values(filter)
      );

      return result;
    } catch (error) {
      throw error;
    }
  }
}
