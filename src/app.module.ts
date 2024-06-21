import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProviderTokens } from './common/constants/provider-token.constant';
import { ResponseFormattingInterceptor } from './common/interceptors/response-formatting.interceptor';
import { FirebaseAuthService } from './common/services/firebase/firebase-auth.service';
import { FirestorageService } from './common/services/firebase/firebase-storage.service';
import { FirestoreService } from './common/services/firebase/firestore.service';
import { DiaryModule } from './modules/diary/diary.module';
import { LLMModule } from './modules/llm/llm.module';
import { PetModule } from './modules/pet/pet.module';

/**
 * This modules is marked as Global so that all of it exported modules/provider is shared globally
 * and can be accessed via constructor or class prop initialize injection
 */
@Global()
@Module({
  controllers: [AppController],
  /**
   * Export a string name so that it could be injected by class prop init injection
   * Export a class itself so that it could be injected by passing class instance to Injectable constructor
   */
  exports: [
    FirestoreService,
    FirestorageService,
    ProviderTokens['FIREBASE_AUTH'],
    ProviderTokens['CONFIG_SERVICE'],
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env'],
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { options: ['lang'], use: QueryResolver },
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        __dirname,
        '../src/generated/i18n.generated.ts',
      ),
    }),
    LLMModule,
    PetModule,
    DiaryModule,
  ],

  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormattingInterceptor,
    },
    {
      provide: FirestoreService,
      useClass: FirestoreService,
    },
    {
      provide: FirestorageService,
      useClass: FirestorageService,
    },
    {
      provide: ProviderTokens['FIREBASE_AUTH'],
      useClass: FirebaseAuthService,
    },
    {
      provide: ProviderTokens['CONFIG_SERVICE'],
      useClass: ConfigService,
    },
  ],
})
export class AppModule {}
