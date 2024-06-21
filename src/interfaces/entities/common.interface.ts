export interface IBaseEntity {
  id: string;
}

export interface IDataWithError {
  error: Error | null | object | string;
}
