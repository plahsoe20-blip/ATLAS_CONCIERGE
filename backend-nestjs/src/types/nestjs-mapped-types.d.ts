// Temporary type declarations for @nestjs/mapped-types
// Remove this file after running: npm install @nestjs/mapped-types@^2.0.0

declare module '@nestjs/mapped-types' {
  export function PartialType<T>(classRef: new (...args: any[]) => T): new (...args: any[]) => Partial<T>;
  export function PickType<T, K extends keyof T>(classRef: new (...args: any[]) => T, keys: readonly K[]): new (...args: any[]) => Pick<T, typeof keys[number]>;
  export function OmitType<T, K extends keyof T>(classRef: new (...args: any[]) => T, keys: readonly K[]): new (...args: any[]) => Omit<T, typeof keys[number]>;
  export function IntersectionType<A, B>(classARef: new (...args: any[]) => A, classBRef: new (...args: any[]) => B): new (...args: any[]) => A & B;
}
