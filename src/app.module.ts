import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from './role/role.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RedisModule } from './redis/redis.module';
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
import { BullModule } from '@nestjs/bull';
import { REDIS_OPTIONS } from './redis/redis.config';
import { FileModule } from './file/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig, { NodeEnvironment } from './app.config';
import authConfig from './auth/auth.config';
import datasource from './database/database.datasource';
import databaseConfig from './database/database.config';
import fileConfig from './file/file.config';
import mailConfig from './mail/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [appConfig, authConfig, databaseConfig, fileConfig, mailConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...datasource.options,
      autoLoadEntities: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      renderPath: '/',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('app.THROTTLE_TTL'),
        limit: configService.get<number>('app.THROTTLE_LIMIT'),
      }),
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      useFactory: async (configService: ConfigService) => ({
        fallbackLanguage: 'en',
        logging:
          configService.get<NodeEnvironment>('app.NODE_ENV') !== 'production',
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true,
        },
        typesOutputPath: join(__dirname, '..', 'src/i18n/i18n.generated.ts'),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => ({
        path: '/graphql',
        status400ForVariableCoercionErrors: true,
        sortSchema: true,
        playground:
          configService.get<NodeEnvironment>('app.NODE_ENV') !== 'production',
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
    }),
    NestjsFormDataModule.config({
      storage: MemoryStoredFile,
      isGlobal: true,
      // limits: {
      //   fileSize: 100_000,
      // },
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: { ...REDIS_OPTIONS, lazyConnect: false },
      }),
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
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
