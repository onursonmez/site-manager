import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Collection } from "../../collections/entities/collection.entity";
import { Field } from "../../collections/entities/field.entity";
import { EventTrigger } from "./event-trigger.entity";
import { Webhook } from "./webhook.entity";
import { EventType } from "../enums/event-type.enum";

@Entity("event_definitions")
export class EventDefinition {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: EventType,
  })
  type: EventType;

  @ManyToOne(() => Collection, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collectionId" })
  collection: Collection;

  @ManyToOne(() => Field, { onDelete: "CASCADE" })
  @JoinColumn({ name: "fieldId" })
  field: Field;

  @Column("jsonb", { default: {} })
  conditions: Record<string, any>;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => EventTrigger, (trigger) => trigger.eventDefinition)
  triggers: EventTrigger[];

  @OneToMany(() => Webhook, (webhook) => webhook.eventDefinition)
  webhooks: Webhook[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
