import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';

export class Idea {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string
}

export interface IdeaModel extends Idea, mongoose.Document { }

export const IdeaEntity = {
    name: 'Idea', schema: new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            default: new Date()
        }
    })
};
