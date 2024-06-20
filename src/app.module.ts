import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseFormattingInterceptor } from './common/interceptors/response-formatting.interceptor';
import { LLMModule } from './llm/llm.module';
import { PetModule } from './pet/pet.module';
import { TypeGuards } from './common/services/type-guards.service';
import { ProviderTokens } from './common/constants/provider-token.constant';
import { FirestoreService } from './common/services/firebase/firestore.service';
import { FirebaseAuthService } from './common/services/firebase/firebase-auth.service';
import { FirestorageService } from './common/services/firebase/firebase-storage.service';

@Global()
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env'],
      isGlobal: true,
    }),
    LLMModule,
    PetModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormattingInterceptor,
    },
    {
      provide: ProviderTokens['TYPE_GUARDS'],
      useClass: TypeGuards,
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
  exports: [
    FirestoreService,
    FirestorageService,
    ProviderTokens['FIREBASE_AUTH'],
    ProviderTokens['TYPE_GUARDS'],
    ProviderTokens['CONFIG_SERVICE'],
  ],
})
export class AppModule {}
