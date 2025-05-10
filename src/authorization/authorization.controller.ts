import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { CheckPermissionDto } from './dto/check-permission.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('authorization')
@Controller('authorization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Post('check')
  checkPermission(@Body() checkPermissionDto: CheckPermissionDto) {
    return this.authorizationService.checkPermission(checkPermissionDto);
  }
}