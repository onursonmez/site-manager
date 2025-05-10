import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Collection } from "../../collections/entities/collection.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity("channels")
export class Channel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Channel, (channel) => channel.children)
  @JoinColumn({ name: "parentId" })
  parent: Channel;

  @OneToMany(() => Channel, (channel) => channel.parent)
  children: Channel[];

  @Column({ default: 0 })
  depth: number;

  @Column("text", { array: true, default: "{}" })
  path: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  connectionString: string;

  @Column("jsonb", { default: {} })
  metadata: Record<string, any>;

  @ManyToMany(() => Collection)
  @JoinTable({
    name: "channel_collections",
    joinColumn: {
      name: "channelId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "collectionId",
      referencedColumnName: "id",
    },
  })
  collections: Collection[];

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
