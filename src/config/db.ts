import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import 'dotenv/config';

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(
        connectionName?: string,
    ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: false
            },
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: process.env.DB_SYNC === 'true',
            dropSchema: false,
            logging: false,
        };
    }
}
