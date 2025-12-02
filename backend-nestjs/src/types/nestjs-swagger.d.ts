// Temporary type declarations for @nestjs/swagger
// Remove this file after running: npm install @nestjs/swagger@^10.0.0

declare module '@nestjs/swagger' {
  export class DocumentBuilder {
    setTitle(title: string): this;
    setDescription(description: string): this;
    setVersion(version: string): this;
    setContact(name: string, url: string, email: string): this;
    addTag(name: string, description?: string): this;
    addBearerAuth(options?: any, name?: string): this;
    addApiKey(options?: any, name?: string): this;
    build(): any;
  }

  export class SwaggerModule {
    static setup(path: string, app: any, document: any, options?: any): void;
    static createDocument(app: any, config: any, options?: any): any;
  }

  export function ApiTags(...tags: string[]): ClassDecorator;
  export function ApiOperation(options: { summary: string; description?: string }): MethodDecorator;
  export function ApiResponse(options: { status: number; description: string; schema?: any }): MethodDecorator;
  export function ApiProperty(options?: any): PropertyDecorator;
  export function ApiBearerAuth(name?: string): MethodDecorator & ClassDecorator;
}
