import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { BaseEntity } from 'src/common/entities/base.entity';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';

import { IBaseService } from './base.interface.service';

export abstract class BaseServiceAbstract<T extends BaseEntity>
  implements IBaseService<T>
{
  constructor(private readonly repository: BaseRepositoryAbstract<T>) {}

  async create(createDto: Partial<T>): Promise<T> {
    return await this.repository.create(createDto as T).catch((err) => {
      throw err;
    });
  }

  async createMany(
    createManyDto: Omit<T, 'created_at' | 'id' | 'updated_at'>[],
  ): Promise<boolean> {
    return await this.repository.createMany(createManyDto);
  }

  async findAll(
    filter: Parameters<IBaseRepository<T>['findAll']>[0],
    options?: Parameters<IBaseRepository<T>['findAll']>[1],
  ): Promise<FindManyReturnFormatDto<T>> {
    return await this.repository.findAll(filter, options);
  }
  async findOne(id: string) {
    return await this.repository.findOneById(id);
  }

  async remove(id: string, ..._: unknown[]) {
    return await this.repository.delete(id);
  }

  async update(id: string, update_dto: Partial<T>) {
    return await this.repository.update(id, update_dto);
  }
}
