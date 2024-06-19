import { FindAllResponse, BaseEntity } from 'src/types/common.type';
import { BaseServiceInterface } from './base.interface.service';
import { BaseRepositoryInterface } from 'src/common/repositories/base/base.interface.repository';

export abstract class BaseServiceAbstract<T extends BaseEntity>
  implements BaseServiceInterface<T>
{
  constructor(private readonly repository: BaseRepositoryInterface<T>) {}

  async create(create_dto: T | any): Promise<T> {
    return await this.repository.create(create_dto);
  }

  async findAll(
    filter: Parameters<BaseRepositoryInterface<T>['findAll']>[0],
    options?: Parameters<BaseRepositoryInterface<T>['findAll']>[1],
  ): Promise<FindAllResponse<T>> {
    return await this.repository.findAll(filter, options);
  }
  async findOne(id: string) {
    return await this.repository.findOneById(id);
  }

  async update(id: string, update_dto: Partial<T>) {
    return await this.repository.update(id, update_dto);
  }

  async remove(id: string) {
    return await this.repository.permanentlyDelete(id);
  }
}
