import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseFormattingInterceptor } from './response-formatting/response-formatting.interceptor';
import { LLMModule } from './llm/llm.module';
import { PetModule } from './pet/pet.module';
import { ErrorValidatorService } from './error-validator/error-validator.service';
import { ProviderTokens } from './constants/provider-token.constant';
import { FirestoreService } from './firebase/firestore.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';

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
    // GlobalConfigModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormattingInterceptor,
    },
    {
      provide: ProviderTokens['ERROR_VALIDATOR'],
      useClass: ErrorValidatorService,
    },
    {
      provide: ProviderTokens['FIRESTORE'],
      useClass: FirestoreService,
    },
    {
      provide: ProviderTokens['FIREBASE_AUTH'],
      useClass: FirebaseAuthService,
    },
  ],
  exports: [
    ProviderTokens['FIRESTORE'],
    ProviderTokens['FIREBASE_AUTH'],
    ProviderTokens['ERROR_VALIDATOR'],
  ],
})
export class AppModule {}
