import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import {
  AcceptLanguageResolver,
  GraphQLWebsocketResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './database/database.config';
import { RoleModule } from './role/role.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RedisModule } from './redis/redis.module';
import { NODE_ENV } from './app.config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      autoLoadEntities: true,
      // entities: [join(__dirname, '**', 'entities', '*.entity.{ts,js}')],
      synchronize: false,
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      renderPath: '/',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      logging: NODE_ENV !== 'production',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      typesOutputPath: join(__dirname, '..', 'src/i18n/i18n.generated.ts'),
      resolvers: [
        GraphQLWebsocketResolver,
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: '/graphql',
      driver: ApolloDriver,
      // autoTransformHttpErrors: true,
      status400ForVariableCoercionErrors: true,
      sortSchema: true,
      playground: NODE_ENV !== 'production',
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      useGlobalPrefix: true,
      csrfPrevention: false,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    RedisModule,
    MailModule,
    UserModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
