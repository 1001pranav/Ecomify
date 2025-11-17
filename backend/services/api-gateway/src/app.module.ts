import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { StoresProxyModule } from './modules/stores/stores-proxy.module';
import { ProductsProxyModule } from './modules/products/products-proxy.module';

@Module({
  imports: [
    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Service Proxies
    StoresProxyModule,
    ProductsProxyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
