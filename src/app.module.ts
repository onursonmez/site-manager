import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { PoliciesModule } from "./policies/policies.module";
import { AuthModule } from "./auth/auth.module";
import { AuthorizationModule } from "./authorization/authorization.module";
import { LoggingModule } from "./logging/logging.module";
import { CollectionsModule } from "./collections/collections.module";
import { EventsModule } from "./events/events.module";
import { ChannelsModule } from "./channels/channels.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "role_policy_api"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        migrations: [__dirname + "/migrations/*{.ts,.js}"],
        // synchronize: configService.get('NODE_ENV') !== 'production',
        synchronize: false,
        logging: configService.get("NODE_ENV") !== "production",
      }),
    }),
    UsersModule,
    RolesModule,
    PermissionsModule,
    PoliciesModule,
    AuthModule,
    AuthorizationModule,
    LoggingModule,
    CollectionsModule,
    EventsModule,
    ChannelsModule,
  ],
})
export class AppModule {}
