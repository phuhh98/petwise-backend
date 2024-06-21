export interface IAppStandardReponseFormat<T> {
  message: string;
  data?: T;
  status: number | string;
}
