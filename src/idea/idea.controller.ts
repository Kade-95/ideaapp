import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes } from "@nestjs/common";
import { Idea } from "./idea.model";
import { IdeaService } from "./idea.service";
import { ValidationPipe } from "../shared/validation.pipe";

@Controller('api/ideas')
export class IdeaController {
    constructor(private ideaService: IdeaService) { }

    @Get()
    async getAllIdeas() {
        const result = await this.ideaService.getAll();
        return result;
    }

    @Post()
    @UsePipes(new ValidationPipe())
    async createIdea(@Body() data: Idea) {
        const result = await this.ideaService.create(data);
        return result;
    }

    @Get(':id')
    async getIdea(@Param('id') id: string) {
        const result = await this.ideaService.read(id);
        return result;
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    async updateIdea(@Param('id') id: string, @Body() data: Partial<Idea>) {
        const result = await this.ideaService.update(id, data);
        return result;
    }

    @Delete(':id')
    async deleteIdea(@Param('id') id: string) {
        const result = await this.ideaService.delete(id);
        return result;
    }
}