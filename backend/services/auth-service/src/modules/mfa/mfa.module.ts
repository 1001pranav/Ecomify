/**
 * MFA Module
 */

import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
