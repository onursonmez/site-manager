import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column('jsonb', { nullable: true })
  headers: Record<string, any>;

  @Column('jsonb', { nullable: true })
  query: Record<string, any>;

  @Column('jsonb', { nullable: true })
  body: Record<string, any>;

  @Column('jsonb', { nullable: true })
  response: Record<string, any>;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'interval', nullable: true })
  duration: string;

  @CreateDateColumn()
  createdAt: Date;
}