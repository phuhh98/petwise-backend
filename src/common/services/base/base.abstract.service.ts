import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';

import { IBaseService } from './base.interface.service';

export abstract class BaseServiceAbstract<T> implements IBaseService<T> {
  constructor(private readonly repository: IBaseRepository<T>) {}

  async create(create_dto: T | any): Promise<T> {
    return await this.repository.create(create_dto).catch((err) => {
      throw err;
    });
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

  async remove(id: string) {
    return await this.repository.permanentlyDelete(id);
  }

  async update(id: string, update_dto: Partial<T>) {
    return await this.repository.update(id, update_dto);
  }
}
