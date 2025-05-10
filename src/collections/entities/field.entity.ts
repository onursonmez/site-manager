import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Collection } from "./collection.entity";
import { FieldType } from "../enums/field-type.enum";

@Entity("fields")
export class Field {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: FieldType,
  })
  type: FieldType;

  @Column("jsonb", { default: {} })
  options: Record<string, any>;

  @Column("jsonb", { default: {} })
  validation: Record<string, any>;

  @Column("jsonb", { default: {} })
  conditions: Record<string, any>;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: false })
  isUnique: boolean;

  @Column({ default: true })
  isVisible: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  collectionId: string;

  @ManyToOne(() => Collection, (collection) => collection.fields, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "collectionId" })
  collection: Collection;

  @ManyToOne(() => Collection, { nullable: true })
  @JoinColumn({ name: "relatedCollectionId" })
  relatedCollection: Collection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
