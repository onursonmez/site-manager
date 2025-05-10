import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Permission } from "../../permissions/entities/permission.entity";

@Entity("policies")
export class Policy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "jsonb", default: "{}" })
  conditions: Record<string, any>;

  @Column({ nullable: true })
  filterExpression: string;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: "permissionId" })
  permission: Permission;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
