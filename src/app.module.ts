import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
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
import { NODE_ENV, THROTTLE_LIMIT, THROTTLE_TTL } from './app.config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
// import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { PermissionModule } from './permission/permission.module';
import { NotificationModule } from './notification/notification.module';
import { SocketModule } from './socket/socket.module';

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
    ThrottlerModule.forRoot({
      ttl: THROTTLE_TTL,
      limit: THROTTLE_LIMIT,
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
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: '/graphql',
      driver: ApolloDriver,
      status400ForVariableCoercionErrors: true,
      sortSchema: true,
      playground: NODE_ENV !== 'production',
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      useGlobalPrefix: true,
      csrfPrevention: false,
      introspection: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (params) => ({ connectionParams: params }),
          path: '/graphql',
        },
      },
      context: ({ req, res }) => ({ req, res }),
      // formatError: (formattedError: GraphQLFormattedError) => {
      //   return (
      //     (formattedError?.extensions?.originalError as GraphQLError) ?? {
      //       ...formattedError,
      //       extensions: {
      //         ...formattedError.extensions,
      //         stacktrace: undefined,
      //       },
      //       locations: undefined,
      //     }
      //   );
      // },
    }),
    NestjsFormDataModule.config({
      storage: MemoryStoredFile,
      isGlobal: true,
    }),
    SocketModule,
    RedisModule,
    MailModule,
    UserModule,
    RoleModule,
    AuthModule,
    TokenModule,
    PermissionModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
