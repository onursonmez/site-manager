import { Controller, Get, Post, Body, Param, UseGuards, Req, Version } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChannelService } from "./services/channel.service";
import { ChannelSettingsService } from "./services/channel-settings.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { CreateChannelSettingsDto } from "./dto/create-channel-settings.dto";
import { AssignChannelUserDto } from "./dto/assign-channel-user.dto";
import { Request } from "express";

@ApiTags("channels")
@Controller({
  path: "channels",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly channelSettingsService: ChannelSettingsService
  ) {}

  @Post()
  @Version("1")
  create(@Body() createChannelDto: CreateChannelDto, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.channelService.create(createChannelDto, userId);
  }

  @Get()
  @Version("1")
  findAll() {
    return this.channelService.findAll();
  }

  @Get(":id")
  @Version("1")
  findOne(@Param("id") id: string) {
    return this.channelService.findOne(id);
  }

  @Get(":id/descendants")
  @Version("1")
  findDescendants(@Param("id") id: string) {
    return this.channelService.findDescendants(id);
  }

  @Post(":id/users")
  @Version("1")
  assignUser(@Param("id") id: string, @Body() assignChannelUserDto: AssignChannelUserDto) {
    return this.channelService.assignUser(id, assignChannelUserDto);
  }

  @Post(":id/settings")
  @Version("1")
  createSettings(@Param("id") id: string, @Body() createChannelSettingsDto: CreateChannelSettingsDto) {
    return this.channelSettingsService.create({
      ...createChannelSettingsDto,
      channelId: id,
    });
  }

  @Get(":id/settings")
  @Version("1")
  findSettings(@Param("id") id: string) {
    return this.channelSettingsService.findByChannel(id);
  }
}
