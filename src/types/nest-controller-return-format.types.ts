// export namespace ControllerReturn {
//   export interface ICrudMessage<T extends object> {
//     [key: string]: string | T;
//     message: string;
//   }

//   export interface ILLMMessage<T extends object | string> {
//     message: string;
//     data: string | T;
//   }
// }

export interface CustomResponseReturn<T> {
  message: string;
  data?: T;
  status: number | string;
}
