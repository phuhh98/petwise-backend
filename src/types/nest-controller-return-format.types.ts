export namespace ControllerReturn {
  export interface CrudCompletedMessage<T extends unknown = {}> {
    [key: string]: string | T;
    message: string;
  }

  export interface LLMCompletedMessage<T extends unknown = {}> {
    message: string;
    data: string | T;
  }
}

export interface CustomResponseReturn<T> {
  message: string;
  data?: T;
  status: number | string;
}
