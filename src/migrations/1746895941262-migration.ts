import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746895941262 implements MigrationInterface {
    name = 'Migration1746895941262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."permissions_scope_enum" AS ENUM('all', 'own')`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "scope" "public"."permissions_scope_enum" NOT NULL DEFAULT 'all', "resource" character varying, "action" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "conditions" jsonb NOT NULL DEFAULT '{}', "filterExpression" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "permissionId" uuid, CONSTRAINT "PK_603e09f183df0108d8695c57e28" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "url" character varying NOT NULL, "headers" jsonb, "query" jsonb, "body" jsonb, "response" jsonb, "statusCode" integer, "ipAddress" character varying, "userAgent" character varying, "userId" character varying, "duration" interval, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1edd3815ae37a9b9511f5a26dca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fields_type_enum" AS ENUM('text', 'textarea', 'number', 'boolean', 'date', 'datetime', 'email', 'password', 'url', 'dropdown_single', 'dropdown_multiple', 'relation_one_to_one', 'relation_one_to_many', 'relation_many_to_one', 'relation_many_to_many', 'file', 'image', 'json', 'translations')`);
        await queryRunner.query(`CREATE TABLE "fields" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "type" "public"."fields_type_enum" NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', "validation" jsonb NOT NULL DEFAULT '{}', "conditions" jsonb NOT NULL DEFAULT '{}', "isRequired" boolean NOT NULL DEFAULT false, "isUnique" boolean NOT NULL DEFAULT false, "isVisible" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "collectionId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "relatedCollectionId" uuid, CONSTRAINT "PK_ee7a215c6cd77a59e2cb3b59d41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "tableName" character varying NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "version" integer NOT NULL DEFAULT '1', "createdById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ed225078e8bf65b448b69105b45" UNIQUE ("name"), CONSTRAINT "UQ_73411c82d4c6e2c01405923489e" UNIQUE ("tableName"), CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_triggers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "eventDefinitionId" uuid, "targetCollectionId" uuid, CONSTRAINT "PK_4407bb9f7b5cc2a8a26e7de271c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_definitions_type_enum" AS ENUM('collection_create', 'collection_update', 'collection_delete', 'field_update')`);
        await queryRunner.query(`CREATE TABLE "event_definitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "type" "public"."event_definitions_type_enum" NOT NULL, "conditions" jsonb NOT NULL DEFAULT '{}', "maxRetries" integer NOT NULL DEFAULT '3', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "collectionId" uuid, "fieldId" uuid, CONSTRAINT "PK_6bc486ae658c8aeb01041db1868" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "headers" jsonb NOT NULL DEFAULT '{}', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "eventDefinitionId" uuid, CONSTRAINT "PK_9e8795cfc899ab7bdaa831e8527" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_logs_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "event_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."event_logs_status_enum" NOT NULL DEFAULT 'pending', "payload" jsonb NOT NULL, "retryCount" integer NOT NULL DEFAULT '0', "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "processedAt" TIMESTAMP WITH TIME ZONE, "eventDefinitionId" uuid, CONSTRAINT "PK_b09cf1bb58150797d898076b242" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "slug" character varying, "parentId" uuid, "depth" integer NOT NULL DEFAULT '0', "path" text array NOT NULL DEFAULT '{}', "isActive" boolean NOT NULL DEFAULT true, "connectionString" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', "createdById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channelId" uuid NOT NULL, "userId" uuid NOT NULL, "roleId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2237cedc2591a4ad08535ec0f9c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" jsonb NOT NULL, "isInherited" boolean NOT NULL DEFAULT false, "inheritedFromId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "channelId" uuid, CONSTRAINT "PK_987e74a380da8234bb5881fb14a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON "role_permissions" ("permissionId") `);
        await queryRunner.query(`CREATE TABLE "users_roles" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_a472bd14ea5d26f611025418d57" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_776b7cf9330802e5ef5a8fb18d" ON "users_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4fb14631257670efa14b15a3d8" ON "users_roles" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "channel_collections" ("channelId" uuid NOT NULL, "collectionId" uuid NOT NULL, CONSTRAINT "PK_64a943d32114aab919b34abd66e" PRIMARY KEY ("channelId", "collectionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0d2f70ee9395d522b88f2ab7dc" ON "channel_collections" ("channelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff5a6c5b4b565b5b22f4bc3411" ON "channel_collections" ("collectionId") `);
        await queryRunner.query(`ALTER TABLE "policies" ADD CONSTRAINT "FK_581d5bdbc3e6de2cd07b9d2e363" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_a55ba1a49f7f5a59b3807f5d86f" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_4429bbbee96d772ee3d30a2d83e" FOREIGN KEY ("relatedCollectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_a14032a082010e4663568afd54b" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_triggers" ADD CONSTRAINT "FK_9e310c2066f63d74608c2d8cf0a" FOREIGN KEY ("eventDefinitionId") REFERENCES "event_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_triggers" ADD CONSTRAINT "FK_fa825e61d193a1dc9d059d15f1a" FOREIGN KEY ("targetCollectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_definitions" ADD CONSTRAINT "FK_48f5da60593cc71b2326d642882" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_definitions" ADD CONSTRAINT "FK_fadd8c01269a2959efa06c6dc00" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "FK_21010075134132ab095b26d853c" FOREIGN KEY ("eventDefinitionId") REFERENCES "event_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_logs" ADD CONSTRAINT "FK_b1feee6ae283b44089025c5b587" FOREIGN KEY ("eventDefinitionId") REFERENCES "event_definitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channels" ADD CONSTRAINT "FK_1f796baa5244d7da7d58c825803" FOREIGN KEY ("parentId") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channels" ADD CONSTRAINT "FK_be764a77b8e0ffc39f8816317d8" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_d12b993b093dcb8e2c440799803" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_3aa0c1e5049ac3cc786b39401d7" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_3fd6cc77560ea9d50c431c50ffd" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_settings" ADD CONSTRAINT "FK_23e0f34073aa57cc6cd9be7be86" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_settings" ADD CONSTRAINT "FK_f05efea1b1a6d7f30beac0706b4" FOREIGN KEY ("inheritedFromId") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_roles" ADD CONSTRAINT "FK_776b7cf9330802e5ef5a8fb18dc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_roles" ADD CONSTRAINT "FK_4fb14631257670efa14b15a3d86" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_collections" ADD CONSTRAINT "FK_0d2f70ee9395d522b88f2ab7dcd" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_collections" ADD CONSTRAINT "FK_ff5a6c5b4b565b5b22f4bc34114" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel_collections" DROP CONSTRAINT "FK_ff5a6c5b4b565b5b22f4bc34114"`);
        await queryRunner.query(`ALTER TABLE "channel_collections" DROP CONSTRAINT "FK_0d2f70ee9395d522b88f2ab7dcd"`);
        await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_4fb14631257670efa14b15a3d86"`);
        await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_776b7cf9330802e5ef5a8fb18dc"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "channel_settings" DROP CONSTRAINT "FK_f05efea1b1a6d7f30beac0706b4"`);
        await queryRunner.query(`ALTER TABLE "channel_settings" DROP CONSTRAINT "FK_23e0f34073aa57cc6cd9be7be86"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_3fd6cc77560ea9d50c431c50ffd"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_3aa0c1e5049ac3cc786b39401d7"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_d12b993b093dcb8e2c440799803"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP CONSTRAINT "FK_be764a77b8e0ffc39f8816317d8"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP CONSTRAINT "FK_1f796baa5244d7da7d58c825803"`);
        await queryRunner.query(`ALTER TABLE "event_logs" DROP CONSTRAINT "FK_b1feee6ae283b44089025c5b587"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_21010075134132ab095b26d853c"`);
        await queryRunner.query(`ALTER TABLE "event_definitions" DROP CONSTRAINT "FK_fadd8c01269a2959efa06c6dc00"`);
        await queryRunner.query(`ALTER TABLE "event_definitions" DROP CONSTRAINT "FK_48f5da60593cc71b2326d642882"`);
        await queryRunner.query(`ALTER TABLE "event_triggers" DROP CONSTRAINT "FK_fa825e61d193a1dc9d059d15f1a"`);
        await queryRunner.query(`ALTER TABLE "event_triggers" DROP CONSTRAINT "FK_9e310c2066f63d74608c2d8cf0a"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_a14032a082010e4663568afd54b"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_4429bbbee96d772ee3d30a2d83e"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_a55ba1a49f7f5a59b3807f5d86f"`);
        await queryRunner.query(`ALTER TABLE "policies" DROP CONSTRAINT "FK_581d5bdbc3e6de2cd07b9d2e363"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff5a6c5b4b565b5b22f4bc3411"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d2f70ee9395d522b88f2ab7dc"`);
        await queryRunner.query(`DROP TABLE "channel_collections"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4fb14631257670efa14b15a3d8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_776b7cf9330802e5ef5a8fb18d"`);
        await queryRunner.query(`DROP TABLE "users_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06792d0c62ce6b0203c03643cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "channel_settings"`);
        await queryRunner.query(`DROP TABLE "channel_users"`);
        await queryRunner.query(`DROP TABLE "channels"`);
        await queryRunner.query(`DROP TABLE "event_logs"`);
        await queryRunner.query(`DROP TYPE "public"."event_logs_status_enum"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
        await queryRunner.query(`DROP TABLE "event_definitions"`);
        await queryRunner.query(`DROP TYPE "public"."event_definitions_type_enum"`);
        await queryRunner.query(`DROP TABLE "event_triggers"`);
        await queryRunner.query(`DROP TABLE "collections"`);
        await queryRunner.query(`DROP TABLE "fields"`);
        await queryRunner.query(`DROP TYPE "public"."fields_type_enum"`);
        await queryRunner.query(`DROP TABLE "request_logs"`);
        await queryRunner.query(`DROP TABLE "policies"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_scope_enum"`);
    }

}
