import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';

export class User {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string

    created: Date;

    say() {
        console.log('Hello')
    }
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

export interface UserRO {
    id: string;
    username: string;
    created: Date;
    token?: string;
}
