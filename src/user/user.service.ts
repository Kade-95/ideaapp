import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { User, UserModel, UserRO } from './user.model';
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User')
        private readonly userModel: Model<UserModel>
    ) { }

    async getAll(): Promise<UserRO[]> {
        const result = await this.userModel.find();

        if (result.length == 0) throw new HttpException("Users not found", HttpStatus.NOT_FOUND);
        return result.map(user => new UserRO(user));
    }

    async login(data: User): Promise<UserRO> {
        const { username, password } = data;
        const user = await this.userModel.findOne({ username }, true);
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new HttpException("Invalid username/password", HttpStatus.BAD_REQUEST);
        }
        return new UserRO(user, { token: true });
    }

    async register(data: User): Promise<UserRO> {
        let check = await this.userModel.findOne({ username: data.username });
        if (check) {
            throw new HttpException("Username has been taken", HttpStatus.BAD_REQUEST);
        }

        try {
            data.password = await bcrypt.hash(data.password, 10);
            const user = await this.userModel.create(data);
            const saved = await user.save();

            return new UserRO(saved, { token: true });
        } catch (error) {
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        }
    }

    async read(id: string): Promise<UserRO> {
        const found: any[] = await this.userModel.aggregate([
            { $project: { __v: 0 } },
            { $match: { _id: new mongo.ObjectId(id) } },
            {
                $lookup: {
                    from: 'ideas',
                    localField: '_id',
                    foreignField: 'author',
                    as: 'ideas'
                }
            },
            {
                $lookup: {
                    from: 'ideas',
                    localField: '_id',
                    foreignField: 'bookmarkers',
                    as: 'bookmarks'
                }
            }
        ]);

        if (found.length <= 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        const ideas = found[0].ideas;
        const bookmarks = found[0].bookmarks;

        const user = found[0] as User;
        return new UserRO(user, { token: true }, { ideas, bookmarks });
    }
}