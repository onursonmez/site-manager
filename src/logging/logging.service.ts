import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RequestLog } from "./entities/request-log.entity";

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(RequestLog)
    private readonly requestLogRepository: Repository<RequestLog>
  ) {}

  async logRequest(logData: Partial<RequestLog>): Promise<RequestLog> {
    console.log(logData);
    const log = this.requestLogRepository.create(logData);

    return this.requestLogRepository.save(log);
  }

  async findAll(): Promise<RequestLog[]> {
    return this.requestLogRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findByUserId(userId: string): Promise<RequestLog[]> {
    return this.requestLogRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }
}
