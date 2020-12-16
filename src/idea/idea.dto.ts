import { IsString } from 'class-validator';
import * as mongoose from 'mongoose';

export class IdeaDTO {
    @IsString()
    title: string;

    @IsString()
    description: string
}

export interface Idea extends IdeaDTO, mongoose.Document { }