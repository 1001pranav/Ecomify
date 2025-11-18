import { IsString } from 'class-validator';

export class CapturePaymentDto {
  @IsString()
  intentId: string;
}
