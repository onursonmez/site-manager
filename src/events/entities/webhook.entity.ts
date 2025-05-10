import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { EventDefinition } from "./event-definition.entity";

@Entity("webhooks")
export class Webhook {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column("jsonb", { default: {} })
  headers: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => EventDefinition, (event) => event.webhooks)
  @JoinColumn({ name: "eventDefinitionId" })
  eventDefinition: EventDefinition;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
