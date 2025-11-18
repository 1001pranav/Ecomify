import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailProviderFactory } from '../adapters/email-provider.factory';
import { SendGridAdapter } from '../adapters/sendgrid.adapter';
import { SmtpAdapter } from '../adapters/smtp.adapter';
import { EmailTemplateService } from '../templates/template.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailProviderFactory,
    SendGridAdapter,
    SmtpAdapter,
    EmailTemplateService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
