import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Version, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CollectionService } from "./services/collection.service";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { CreateFieldDto } from "./dto/create-field.dto";
import { Request } from "express";

@ApiTags("collections")
@Controller({
  path: "collections",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @Version("1")
  create(@Body() createCollectionDto: CreateCollectionDto, @Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    return this.collectionService.create(createCollectionDto, userId);
  }

  @Get()
  @Version("1")
  findAll() {
    return this.collectionService.findAll();
  }

  @Get(":id")
  @Version("1")
  findOne(@Param("id") id: string) {
    return this.collectionService.findOne(id);
  }

  @Delete(":id")
  @Version("1")
  remove(@Param("id") id: string) {
    return this.collectionService.remove(id);
  }

  @Post(":id/fields")
  @Version("1")
  addField(@Param("id") id: string, @Body() createFieldDto: CreateFieldDto) {
    return this.collectionService.addField(id, createFieldDto);
  }

  @Patch(":id/fields/:fieldId")
  @Version("1")
  updateField(@Param("id") id: string, @Param("fieldId") fieldId: string, @Body() updateFieldDto: Partial<CreateFieldDto>) {
    return this.collectionService.updateField(id, fieldId, updateFieldDto);
  }

  @Delete(":id/fields/:fieldId")
  @Version("1")
  removeField(@Param("id") id: string, @Param("fieldId") fieldId: string) {
    return this.collectionService.removeField(id, fieldId);
  }
}
