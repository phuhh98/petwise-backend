export type FindAllResponse<T> = { count: number; items: T[] };
export interface BaseEntity {
  id: string;
}
