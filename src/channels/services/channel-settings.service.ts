import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChannelSettings } from "../entities/channel-settings.entity";
import { CreateChannelSettingsDto } from "../dto/create-channel-settings.dto";
import { ChannelService } from "./channel.service";

@Injectable()
export class ChannelSettingsService {
  constructor(
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    private readonly channelService: ChannelService
  ) {}

  async create(createChannelSettingsDto: CreateChannelSettingsDto): Promise<ChannelSettings> {
    const { channelId } = createChannelSettingsDto;

    // Verify that the channel exists
    await this.channelService.findOne(channelId);

    const settings = this.channelSettingsRepository.create(createChannelSettingsDto);
    return this.channelSettingsRepository.save(settings);
  }

  async findByChannel(channelId: string): Promise<ChannelSettings[]> {
    return this.channelSettingsRepository.find({
      where: { channel: { id: channelId } },
      relations: ["inheritedFrom"],
    });
  }

  async findOne(id: string): Promise<ChannelSettings> {
    const settings = await this.channelSettingsRepository.findOne({
      where: { id },
      relations: ["channel", "inheritedFrom"],
    });

    if (!settings) {
      throw new NotFoundException(`Channel settings with ID "${id}" not found`);
    }

    return settings;
  }

  async inheritSettings(channelId: string, parentId: string): Promise<ChannelSettings[]> {
    const parentSettings = await this.findByChannel(parentId);
    const inheritedSettings: ChannelSettings[] = [];

    for (const setting of parentSettings) {
      const inherited = this.channelSettingsRepository.create({
        channel: { id: channelId },
        key: setting.key,
        value: setting.value,
        isInherited: true,
        inheritedFromId: parentId,
      });

      inheritedSettings.push(await this.channelSettingsRepository.save(inherited));
    }

    return inheritedSettings;
  }
}
