import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KeepaService } from './keepa.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [KeepaService],
  exports: [KeepaService],
})
export class KeepaModule {} 