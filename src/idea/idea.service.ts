import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Idea, IdeaDTO } from "./idea.dto";

@Injectable()
export class IdeaService {
    constructor(
        @InjectModel('Idea')
        private readonly ideaModel: Model<Idea>
    ) { }

    async getAll() {
        return await this.ideaModel.find();
    }

    async create(data: IdeaDTO) {
        const idea = await this.ideaModel.create(data);
        const result = await idea.save();
        return result;
    }

    async read(id: string) {
        return await this.findIdea(id);
    }

    async update(id: string, data: Partial<IdeaDTO>) {
        try {
            await this.ideaModel.findOneAndUpdate({ _id: id }, data);
            const result = await this.ideaModel.findById(id);
            if (!result) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
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

    async findIdea(id: string) {
        try {
            const result = await this.ideaModel.findById(id);
            if (!result) throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
            return result;
        } catch (error) {
            throw new HttpException('Idea not found', HttpStatus.NOT_FOUND);
        }
    }
}