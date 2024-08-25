import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                service: 'gmail',
                auth: {
                    user: 'your-email@gmail.com', // Your Gmail address
                    pass: 'your-app-password-or-account-password', // Your App Password or account password
                },
            },
            defaults: {
                from: '"No Reply" <your-email@gmail.com>', // Default sender email
            },
            template: {
                dir: join(__dirname, 'templates'), // Directory for email templates
                adapter: new HandlebarsAdapter(), // Template engine adapter
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}