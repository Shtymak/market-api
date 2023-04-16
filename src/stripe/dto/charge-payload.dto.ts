import { ApiProperty } from '@nestjs/swagger';

export class ChargePlayloadDto {
  @ApiProperty({ example: 1000, description: 'Amount of payment' })
  amount: number;
  @ApiProperty({ example: 'usd', description: 'Currency of payment' })
  paymentMethodId: string;
  @ApiProperty({ example: 'cus_123', description: 'Id of customer' })
  customerId: string;
  @ApiProperty({ example: 'John', description: 'Name of customer' })
  name: string;
  @ApiProperty({ example: 'mail@com.ts', description: 'Email of customer' })
  email: string;
}
