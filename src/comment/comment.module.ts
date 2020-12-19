import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { CommentEntity } from './comment.model';
import { CommentService } from './comment.service';

@Module({
  imports: [MongooseModule.forFeature([CommentEntity])],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule { }
