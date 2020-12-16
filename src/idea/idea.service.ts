import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Idea, IdeaModel } from "./idea.model";
import * as mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class IdeaService {
    constructor(
        @InjectModel('Idea')
        private readonly ideaModel: Model<IdeaModel>
    ) { }

    async getAll() {
        const result = await this.ideaModel.aggregate([
            { $project: { __v: 0 } }
        ]);

        if (result.length == 0) throw new HttpException("Ideas not found", HttpStatus.NOT_FOUND);
        return result;
    }

    async create(data: Idea) {
        const idea = await this.ideaModel.create(data);
        const result = await idea.save();
        return result;
    }

    async read(id: string) {
        return await this.findIdea(id);
    }

    async update(id: string, data: Partial<Idea>) {
        try {
            await this.findIdea(id);
            await this.ideaModel.findOneAndUpdate({ _id: id }, data);
            const result = await this.findIdea(id);
            return result;
        } catch (error) {
            throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
        }
    }

    async delete(id: string) {
        const result = await this.ideaModel.deleteOne({ _id: id });
        if (result.n === 0) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
        return { deleted: true };
    }

    async findIdea(_id: string) {
        try {
            const query = { _id: new ObjectId(_id) };
            const result = await this.ideaModel.aggregate([
                { $project: { __v: 0 } },
                { $match: query },
            ]);

            if (result.length == 0) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
            return result[0];
        } catch (error) {
            throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
        }
    }
}