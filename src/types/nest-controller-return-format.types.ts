export namespace ControllerReturn {
  export interface CrudCompletedMessage<T extends object> {
    [key: string]: string | T;
    message: string;
  }

  export interface LLMCompletedMessage<T extends object> {
    message: string;
    data: string | T;
  }
}

export interface CustomResponseReturn<T> {
  message: string;
  data?: T;
  status: number | string;
}
