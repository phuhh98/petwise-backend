import { IDataWithError } from '../entities/common.interface';

export interface IAppStandardReponseFormat<T> extends IDataWithError {
  data: T;
  message: string;
  status: number | string;
}
