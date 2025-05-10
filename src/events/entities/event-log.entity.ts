import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { EventDefinition } from "./event-definition.entity";
import { EventStatus } from "../enums/event-status.enum";

@Entity("event_logs")
export class EventLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => EventDefinition)
  @JoinColumn({ name: "eventDefinitionId" })
  eventDefinition: EventDefinition;

  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column("jsonb")
  payload: Record<string, any>;

  @Column({ type: "int", default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  processedAt: Date;
}
