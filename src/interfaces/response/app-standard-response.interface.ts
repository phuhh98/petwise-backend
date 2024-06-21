export interface IAppStandardReponseFormat<T> {
  data?: T;
  message: string;
  status: number | string;
}
