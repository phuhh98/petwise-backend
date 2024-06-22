import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';

export interface Write<T> {
  create(item: T | any): Promise<T>;
  remove(id: string): Promise<boolean>;
  update(id: string, item: Partial<T>): Promise<T>;
}

export interface Read<T> {
  findAll(
    filter: object,
    options?: object,
  ): Promise<FindManyReturnFormatDto<T>>;
  findOne(id: string): Promise<T>;
}

export interface IBaseService<T> extends Write<T>, Read<T> {}
