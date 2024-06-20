export type FindAllResponse<T> = { count: number; items: T[] };
export interface IBaseEntity {
  id: string;
}

export interface IDataWithError {
  error: string | Error;
}
