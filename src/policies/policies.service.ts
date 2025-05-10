import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Policy } from "./entities/policy.entity";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";
import { PermissionsService } from "../permissions/permissions.service";

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private readonly policiesRepository: Repository<Policy>,
    private readonly permissionsService: PermissionsService
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const { permissionId } = createPolicyDto;

    // Verify that the permission exists
    await this.permissionsService.findOne(permissionId);

    // Create the policy
    const policy = this.policiesRepository.create(createPolicyDto);
    return this.policiesRepository.save(policy);
  }

  async findAll(): Promise<Policy[]> {
    return this.policiesRepository.find({ relations: ["permission"] });
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policiesRepository.findOne({
      where: { id },
      relations: ["permission"],
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID "${id}" not found`);
    }
    return policy;
  }

  async findByPermissionId(permissionId: string): Promise<Policy[]> {
    return this.policiesRepository.find({
      where: { permission: { id: permissionId } },
      relations: ["permission"],
    });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id);

    // If updating permissionId, verify that the permission exists
    if (updatePolicyDto.permissionId) {
      await this.permissionsService.findOne(updatePolicyDto.permissionId);
    }

    // Update the policy
    Object.assign(policy, updatePolicyDto);
    return this.policiesRepository.save(policy);
  }

  async remove(id: string): Promise<void> {
    const policy = await this.findOne(id);
    await this.policiesRepository.remove(policy);
  }
}
