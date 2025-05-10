import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { ChannelUser } from '../entities/channel-user.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { AssignChannelUserDto } from '../dto/assign-channel-user.dto';
import { Collection } from '../../collections/entities/collection.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { LoggingService } from '../../logging/logging.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelUser)
    private readonly channelUserRepository: Repository<ChannelUser>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
    private readonly loggingService: LoggingService,
  ) {}

  async create(createChannelDto: CreateChannelDto, userId: string): Promise<Channel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const channel = this.channelRepository.create({
        ...createChannelDto,
        createdById: userId,
      });

      if (createChannelDto.parentId) {
        const parent = await this.findOne(createChannelDto.parentId);
        channel.depth = parent.depth + 1;
        channel.path = [...parent.path, parent.id];
      } else {
        channel.depth = 0;
        channel.path = [];
      }

      const savedChannel = await queryRunner.manager.save(channel);

      if (createChannelDto.collectionIds) {
        const collections = await this.collectionRepository.findByIds(
          createChannelDto.collectionIds,
        );
        savedChannel.collections = collections;
        await queryRunner.manager.save(savedChannel);
      }

      await queryRunner.commitTransaction();
      return savedChannel;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find({
      relations: ['parent', 'children', 'collections'],
      order: { depth: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'collections'],
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID "${id}" not found`);
    }

    return channel;
  }

  async findDescendants(id: string): Promise<Channel[]> {
    const channel = await this.findOne(id);
    return this.channelRepository
      .createQueryBuilder('channel')
      .where('channel.path @> ARRAY[:id]', { id })
      .orderBy('channel.depth', 'ASC')
      .getMany();
  }

  async assignUser(
    channelId: string,
    assignChannelUserDto: AssignChannelUserDto,
  ): Promise<ChannelUser> {
    const { userId, roleId } = assignChannelUserDto;

    // Check if channel exists
    const channel = await this.findOne(channelId);

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.channelUserRepository.findOne({
      where: { channelId, userId },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `User is already assigned to channel "${channel.name}"`,
      );
    }

    // Create channel user assignment
    const channelUser = this.channelUserRepository.create({
      channelId,
      userId,
      roleId,
    });

    return this.channelUserRepository.save(channelUser);
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    const channelUsers = await this.channelUserRepository.find({
      where: { userId },
      relations: ['channel'],
    });

    return channelUsers.map((cu) => cu.channel);
  }
}