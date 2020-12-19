import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';
import { IdeaRO } from 'src/idea/idea.model';
import { UserRO } from 'src/user/user.model';

export class Comment {
    @IsNotEmpty()
    comment: string;

    created: Date;

    author: mongoose.Types.ObjectId;

    idea: mongoose.Types.ObjectId;
}

export interface CommentModel extends Comment, mongoose.Document { }

export const CommentEntity = {
    name: 'Comment', schema: new mongoose.Schema({
        comment: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            default: new Date()
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        idea: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
    })
};


export class CommentRO {
    public id: string;
    public comment: string;
    public created: Date;
    public author?: UserRO;
    public idea?: Partial<IdeaRO>;

    constructor(idea: Comment, set?: any) {
        this.id = idea['_id'].toString();
        this.comment = idea.comment;
        this.created = idea.created;

        if (set && set instanceof Object) {
            for (let i in set) {
                this[i] = set[i];
            }
        }

        if (this.author && this.author.constructor !== UserRO) {
            const { _id, username, created } = this.author as any;
            this.author = { id: _id.toString(), username, created };
        }

        if (this.idea && this.idea.constructor !== IdeaRO) {
            const { _id, title, created } = this.idea as any;
            this.idea = { id: _id.toString(), title, created };
        }
    }
}
