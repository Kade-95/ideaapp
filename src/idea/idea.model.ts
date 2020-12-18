import { IsNotEmpty, IsString } from 'class-validator';
import * as mongoose from 'mongoose';
import { UserRO } from 'src/user/user.model';

export class Idea {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    created: Date;

    updated: Date;

    author: mongoose.Types.ObjectId;

    upvoters: mongoose.Types.ObjectId[];

    downvoters: mongoose.Types.ObjectId[];

    bookmarkers: mongoose.Types.ObjectId[];
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
        },
        updated: {
            type: Date,
            default: new Date()
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        upvoters: {
            type: [mongoose.Types.ObjectId],
        },
        downvoters: {
            type: [mongoose.Types.ObjectId],
        },
        bookmarkers: {
            type: [mongoose.Types.ObjectId],
        }
    })
};


export class IdeaRO {
    public id: string;
    public title: string;
    public description: string;
    public created: Date;
    public updated: Date;
    public author?: UserRO;
    public bookmarkers?: mongoose.Types.ObjectId[];
    public upvoters?: mongoose.Types.ObjectId[];
    public downvoters?: mongoose.Types.ObjectId[];
    public upvotes?: number;
    public downvotes?: number;
    public bookmarkedBy?: number;

    constructor(idea: Idea, set?: any) {
        this.id = idea['_id'].toString();
        this.title = idea.title;
        this.description = idea.description;
        this.created = idea.created;
        this.updated = idea.updated;

        if (idea.upvoters) {
            this.upvotes = idea.upvoters.length;
        }

        if (idea.downvoters) {
            this.downvotes = idea.downvoters.length;
        }

        if(idea.bookmarkers){
            this.bookmarkedBy = idea.bookmarkers.length;
        }

        if (set && set instanceof Object) {
            for (let i in set) {
                this[i] = set[i];
            }
        }

        if (this.author && this.author.constructor !== UserRO) {
            const { _id, username, created } = this.author as any;
            this.author = { id: _id.toString(), username, created };
        }
    }
}
