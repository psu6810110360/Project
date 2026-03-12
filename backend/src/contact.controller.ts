import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {
    @Post()
    async sendEmail(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('phone') phone: string,
        @Body('message') message: string,
    ) {
        try {

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'famzaza420@gmail.com',
                    pass: 'hsrv eqaj fuuy yjov',
                },
            });


            const mailOptions = {
                from: `"${name}" <${email}>`,
                to: 'famzaza420@gmail.com',
                subject: `[ข้อความใหม่จากหน้าเว็บ] ติดต่อจากคุณ ${name}`,
                text: `
          มีผู้ติดต่อใหม่จากเว็บไซต์ Smart Science Pro:
          
          ชื่อ-นามสกุล: ${name}
          อีเมล: ${email}
          เบอร์โทร: ${phone || 'ไม่ได้ระบุ'}
          
          ข้อความ:
          ${message}
        `,
            };


            await transporter.sendMail(mailOptions);

            return { success: true, message: 'ส่งอีเมลสำเร็จ' };
        } catch (error) {
            console.error('Email error:', error);
            throw new HttpException('ไม่สามารถส่งอีเมลได้', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}