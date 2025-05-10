import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelSettings } from './entities/channel-settings.entity';
import { ChannelUser } from './entities/channel-user.entity';
import { ChannelService } from './services/channel.service';
import { ChannelSettingsService } from './services/channel-settings.service';
import { ChannelsController } from './channels.controller';
import { Collection } from '../collections/entities/collection.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChannelSettings,
      ChannelUser,
      Collection,
      User,
      Role,
    ]),
    LoggingModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelService, ChannelSettingsService],
  exports: [ChannelService, ChannelSettingsService],
})
export class ChannelsModule {}