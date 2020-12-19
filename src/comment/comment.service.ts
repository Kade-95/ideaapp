import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentModel, CommentRO } from './comment.model';

const ObjectId = Types.ObjectId;
@Injectable()
export class CommentService {
    constructor(@InjectModel('Comment') private readonly commentModel: Model<CommentModel>) { }

    private async find(id) {
        const found = await this.commentModel.aggregate([
            { $project: { __v: 0 } },
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $lookup: {
                    from: 'ideas',
                    localField: 'idea',
                    foreignField: '_id',
                    as: 'idea'
                }
            },
            {
                $unwind: "$idea"
            }
        ]);

        if (found.length <= 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        return found[0];
    }

    private ensureOwnership(comment: CommentRO, userId: string) {
        if (comment.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    async read(id: string) {
        const found = await this.find(id);
        return new CommentRO(found as Comment, { author: found.author, idea: found.idea });
    }

    async readByIdea(id: string, page: number = 1) {
        const found = await this.commentModel.aggregate([
            { $project: { __v: 0 } },
            { $match: { idea: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $lookup: {
                    from: 'ideas',
                    localField: 'idea',
                    foreignField: '_id',
                    as: 'idea'
                }
            },
            {
                $unwind: "$idea"
            },
            { $skip: 25 * (page - 1) },
            { $limit: 25 },
        ]);

        if (found.length <= 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        return found.map(comment =>
            new CommentRO(comment as Comment, { author: comment.author, idea: comment.idea })
        );
    }

    async readByUser(id: string, page: number = 1) {
        const found = await this.commentModel.aggregate([
            { $project: { __v: 0 } },
            { $match: { author: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $lookup: {
                    from: 'ideas',
                    localField: 'idea',
                    foreignField: '_id',
                    as: 'idea'
                }
            },
            {
                $unwind: "$idea"
            },
            { $skip: 25 * (page - 1) },
            { $limit: 25 },
        ]);

        if (found.length <= 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        return found.map(comment =>
            new CommentRO(comment as Comment, { author: comment.author, idea: comment.idea })
        );
    }

    async create(ideaId: string, userId: string, data: Comment) {
        data.author = new ObjectId(userId);
        data.idea = new ObjectId(ideaId);

        const comment = await this.commentModel.create(data);
        const saved = await comment.save();

        return this.read(saved._id);
    }

    async delete(id: string, userId: string) {
        const comment = await this.read(id);
        if (!comment) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(comment, userId);
        await this.commentModel.findOneAndDelete({ _id: id });

        return comment;
    }
}
