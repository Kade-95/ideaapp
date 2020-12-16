import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserModel, UserRO } from './user.model';
import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User')
        private readonly userModel: Model<UserModel>
    ) { }

    async getAll(): Promise<UserRO[]> {
        const result = await this.userModel.find();
        if (result.length == 0) throw new HttpException("Users not found", HttpStatus.NOT_FOUND);
        return result.map(user => this.sanitize(user, false));
    }

    async login(data: User): Promise<UserRO> {
        const { username, password } = data;
        const user = await this.userModel.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new HttpException("Invalid username/password", HttpStatus.BAD_REQUEST);
        }

        return this.sanitize(user);
    }

    async register(data: User): Promise<UserRO> {
        let user = await this.userModel.findOne({ username: data.username });
        if (user) {
            throw new HttpException("Username has been taken", HttpStatus.BAD_REQUEST);
        }

        try {
            data.password = await bcrypt.hash(data.password, 10);
            user = await this.userModel.create(data);
            const saved = await user.save();

            return this.sanitize(saved);
        } catch (error) {
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        }
    }

    async read(id: string): Promise<UserRO> {
        return this.sanitize(await this.findUser(id));
    }

    async findUser(id: string) {
        try {
            const result = await this.userModel.findById(id);
            if (!result) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            return result;
        } catch (error) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
    }

    sanitize(user: User, showToken: boolean = true): UserRO {
        const { created, username } = user;
        const response: UserRO = { created, username, id: user['_id'] };

        if (showToken) {
            response.token = jwt.sign(
                {
                    id: response.id,
                    username
                }, process.env.SECRET, { expiresIn: '7d' }
            );
        }

        return response;
    }
}
