import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Channel } from "./channel.entity";
import { User } from "../../users/entities/user.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity("channel_users")
export class ChannelUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  channelId: string;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "channelId" })
  channel: Channel;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "roleId" })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
