import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { EventDefinition } from "./event-definition.entity";
import { Collection } from "../../collections/entities/collection.entity";

@Entity("event_triggers")
export class EventTrigger {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => EventDefinition, (event) => event.triggers)
  @JoinColumn({ name: "eventDefinitionId" })
  eventDefinition: EventDefinition;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: "targetCollectionId" })
  targetCollection: Collection;

  @Column("jsonb")
  action: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
