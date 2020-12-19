import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';
import * as jwt from "jsonwebtoken";
import { IdeaRO } from 'src/idea/idea.model';

export class User {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string

    created: Date;
}

export interface UserModel extends User, mongoose.Document { }

export const UserEntity = {
    name: 'User',
    schema: new mongoose.Schema({
        username: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            default: new Date()
        }
    })
};

export class UserRO {
    public id: string;
    public username: string;
    public created: Date;
    public token?: string;
    public ideas?: Partial<IdeaRO>[];

    constructor(user: User, get: any = {}, set: any = {}) {
        this.id = user['_id'].toString();
        this.username = user.username;
        this.created = user.created;

        if (get.token) {
            this.token = jwt.sign(
                {
                    id: this.id,
                    username: this.username
                }, process.env.SECRET, { expiresIn: '7d' }
            );
        }

        for (let i in set) {
            this[i] = set[i];
        }

        if (this.ideas) {
            for (let i in this.ideas) {
                if (this.ideas[i].constructor !== IdeaRO) {
                    const { _id, title, created } = this.ideas[i] as any;
                    this.ideas[i] = { id: _id.toString(), title, created };
                }
            }
        }
    }
}
