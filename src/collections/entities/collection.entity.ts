import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Field } from "./field.entity";
import { User } from "../../users/entities/user.entity";

@Entity("collections")
export class Collection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  tableName: string;

  @Column("jsonb", { default: {} })
  metadata: Record<string, any>;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => Field, (field) => field.collection, {
    cascade: true,
    eager: true,
  })
  fields: Field[];

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
