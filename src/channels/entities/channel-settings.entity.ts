import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity("channel_settings")
export class ChannelSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "channelId" })
  channel: Channel;

  @Column()
  key: string;

  @Column("jsonb")
  value: any;

  @Column({ default: false })
  isInherited: boolean;

  @Column({ nullable: true })
  inheritedFromId: string;

  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: "inheritedFromId" })
  inheritedFrom: Channel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
