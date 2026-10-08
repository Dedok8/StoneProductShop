import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { LeadsService } from '@/model/leads/application';
import { LEAD_REPOSITORY } from '@/model/leads/domain/interfaces';
import { LeadRepository } from '@/model/leads/infrastructure';
import { LeadController } from '@/model/leads/presentation';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get('MAIL_PORT'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: config.get('MAIL_FROM'),
        },
      }),
    }),
  ],
  controllers: [LeadController],
  providers: [
    LeadsService,
    {
      provide: LEAD_REPOSITORY,
      useClass: LeadRepository,
    },
  ],
})
export class LeadsModule {}
