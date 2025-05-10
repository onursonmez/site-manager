import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollectionsAndFields1712345678904 implements MigrationInterface {
  name = "AddCollectionsAndFields1712345678904";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for field types
    await queryRunner.query(`
      CREATE TYPE "field_type_enum" AS ENUM (
        'text', 'textarea', 'number', 'boolean', 'date', 'datetime',
        'email', 'password', 'url', 'dropdown_single', 'dropdown_multiple',
        'relation_one_to_one', 'relation_one_to_many', 'relation_many_to_one',
        'relation_many_to_many', 'file', 'image', 'json', 'translations'
      );
    `);

    // Create function for updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Add example collection and fields
    await queryRunner.query(`
      INSERT INTO "collections" ("name", "description", "tableName", "createdById")
      SELECT 
        'blog_posts',
        'Blog posts collection',
        'col_blog_posts',
        id
      FROM "users"
      WHERE "username" = 'admin'
      RETURNING "id"
    `);

    const collectionResult = await queryRunner.query(`SELECT id FROM "collections" WHERE "name" = 'blog_posts'`);
    const collectionId = collectionResult[0].id;

    // Create blog posts table
    await queryRunner.query(`
      CREATE TABLE "col_blog_posts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "content" text,
        "published" boolean DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdById" uuid REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TRIGGER "col_blog_posts_updated_at"
      BEFORE UPDATE ON "col_blog_posts"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add fields for blog posts
    await queryRunner.query(
      `
      INSERT INTO "fields" (
        "name", "description", "type", "isRequired", "isUnique",
        "collectionId", "sortOrder"
      )
      VALUES 
        (
          'title',
          'Post title',
          'text',
          true,
          true,
          $1,
          0
        ),
        (
          'content',
          'Post content',
          'textarea',
          false,
          false,
          $1,
          1
        ),
        (
          'published',
          'Publication status',
          'boolean',
          false,
          false,
          $1,
          2
        )
    `,
      [collectionId]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop example collection table
    await queryRunner.query(`DROP TABLE IF EXISTS "col_blog_posts" CASCADE`);

    // Drop enum and function
    await queryRunner.query(`DROP TYPE IF EXISTS "field_type_enum" CASCADE`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`);
  }
}
