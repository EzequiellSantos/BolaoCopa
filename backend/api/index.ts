import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    setupApp(app);
    await app.init();

    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
