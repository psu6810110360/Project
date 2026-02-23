//app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './modules/courses/courses.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }), 

    
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',
    }),
    
   
    CoursesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}