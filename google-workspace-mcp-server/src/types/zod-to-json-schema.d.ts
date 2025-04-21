declare module 'zod-to-json-schema' {
  import { ZodType } from 'zod';

  export function zodToJsonSchema(
    schema: ZodType<any, any, any>,
    name?: string
  ): any;
}