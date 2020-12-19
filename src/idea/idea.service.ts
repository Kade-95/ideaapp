import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Idea, IdeaModel, IdeaRO } from "./idea.model";
import { Votes } from "src/shared/vote.enum";
const ObjectId = Types.ObjectId;

@Injectable()
export class IdeaService {
    constructor(
        @InjectModel('Idea')
        private readonly ideaModel: Model<IdeaModel>
    ) { }

    private async find(id) {
        const found = await this.ideaModel.aggregate([
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
            }
        ]);

        if (found.length <= 0) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);

        return found[0];
    }

    private ensureOwnership(idea: IdeaRO, userId: string) {
        if (idea.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaRO, userId: string, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

        if (
            idea[opposite].find(user => user.toString() === userId) ||
            idea[vote].find(user => user.toString() === userId)
        ) {
            idea[opposite] = idea[opposite].filter(user => user.toString() !== userId);
            idea[vote] = idea[vote].filter(user => user.toString() !== userId);
            await this.ideaModel.findOneAndUpdate({ _id: idea.id }, { [opposite]: idea[opposite], [vote]: idea[vote] });
        }
        else if (!idea[opposite].find(user => user.toString() === userId)) {
            idea[vote].push(new ObjectId(userId));
            await this.ideaModel.findOneAndUpdate({ _id: idea.id }, { [vote]: idea[vote] });
        }
        else {
            throw new HttpException('Unable to vote', HttpStatus.BAD_REQUEST);
        }

        return await this.read(idea.id);
    }

    async getAll(page: number = 1, newest: boolean = false) {
        const sort: any = [
            { $skip: 25 * (page - 1) },
            { $limit: 25 }
        ];

        if (newest) sort.unshift({ $sort: { created: 1 } });

        const result = await this.ideaModel.aggregate([
            { $project: { __v: 0 } },
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
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'idea',
                    as: 'comments'
                }
            },
            ...sort
        ]);

        if (result.length == 0) throw new HttpException("Ideas not found", HttpStatus.NOT_FOUND);
        return result.map(idea => new IdeaRO(idea as Idea, { author: idea.author, comments: idea.comments }));
    }

    async create(userId: string, data: Idea) {
        data.author = new ObjectId(userId);

        const idea = await this.ideaModel.create(data);
        const saved = await idea.save();
        return await this.read(saved._id);
    }

    async read(id: string) {
        const idea = await this.find(id);
        return new IdeaRO(idea as Idea, { author: idea.author });
    }

    async update(id: string, userId: string, data: Partial<Idea>) {
        let idea = await this.read(id);
        if (!idea) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);

        data.updated = new Date();
        await this.ideaModel.findOneAndUpdate({ _id: id }, data);
        idea = await this.read(id);
        return idea;
    }

    async delete(id: string, userId: string) {
        const idea = await this.read(id);
        if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);
        await this.ideaModel.deleteOne({ _id: id });

        return idea;
    }

    async bookmark(id: string, userId: string) {
        const found = await this.find(id);
        const idea = new IdeaRO(found as Idea, { author: found.author, bookmarkers: found.bookmarkers });
        if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);

        if (!idea.bookmarkers.find(user => user.toString() === userId)) {
            idea.bookmarkers.push(new ObjectId(userId));
            await this.ideaModel.findOneAndUpdate({ _id: id }, { bookmarkers: idea.bookmarkers });
        }
        else {
            throw new HttpException('Idea not bookmarked', HttpStatus.BAD_REQUEST);
        }

        return idea;
    }

    async unbookmark(id: string, userId: string) {
        const found = await this.find(id);
        const idea = new IdeaRO(found as Idea, { author: found.author, bookmarkers: found.bookmarkers });
        if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);

        if (idea.bookmarkers.find(user => user.toString() === userId)) {
            idea.bookmarkers = idea.bookmarkers.filter(user => user.toString() !== userId);
            await this.ideaModel.findOneAndUpdate({ _id: id }, { bookmarkers: idea.bookmarkers });
        }
        else {
            throw new HttpException('Idea not bookmarked', HttpStatus.BAD_REQUEST);
        }

        return idea;
    }

    async upvote(id: string, userId: string) {
        const found = await this.find(id);
        const idea = new IdeaRO(found as Idea, { author: found.author, upvoters: found.upvoters, downvoters: found.downvoters });
        if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);

        return await this.vote(idea, userId, Votes.UP);
    }

    async downvote(id: string, userId: string) {
        const found = await this.find(id);
        const idea = new IdeaRO(found as Idea, { author: found.author, upvoters: found.upvoters, downvoters: found.downvoters });
        if (!idea) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        this.ensureOwnership(idea, userId);

        return await this.vote(idea, userId, Votes.DOWN);
    }
}