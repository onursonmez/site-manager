import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEvents1712345678905 implements MigrationInterface {
  name = "AddEvents1712345678905";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for event types
    await queryRunner.query(`
      CREATE TYPE "event_type_enum" AS ENUM (
        'collection_create',
        'collection_update',
        'collection_delete',
        'field_update'
      );
    `);

    // Create enum for event status
    await queryRunner.query(`
      CREATE TYPE "event_status_enum" AS ENUM (
        'pending',
        'processing',
        'completed',
        'failed',
        'retrying'
      );
    `);

    // Add example event definition and webhook
    await queryRunner.query(`
      INSERT INTO "event_definitions" (
        "name",
        "description",
        "type",
        "collectionId",
        "conditions"
      )
      SELECT
        'BlogPostCreated',
        'Triggered when a new blog post is created',
        'collection_create',
        id,
        '{"status": "published"}'
      FROM "collections"
      WHERE "name" = 'blog_posts'
      RETURNING "id"
    `);

    const eventDefinitionResult = await queryRunner.query(`SELECT id FROM "event_definitions" WHERE "name" = 'BlogPostCreated'`);
    const eventDefinitionId = eventDefinitionResult[0].id;

    await queryRunner.query(
      `
      INSERT INTO "webhooks" (
        "name",
        "url",
        "headers",
        "eventDefinitionId"
      )
      VALUES (
        'Notification Webhook',
        'https://api.example.com/webhooks/blog-posts',
        '{"Content-Type": "application/json", "X-API-Key": "example-key"}',
        $1
      )
    `,
      [eventDefinitionId]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_type_enum" CASCADE`);
  }
}
