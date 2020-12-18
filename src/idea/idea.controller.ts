import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { Idea } from "./idea.model";
import { IdeaService } from "./idea.service";
import { ValidationPipe } from "../shared/validation.pipe";
import { AuthGaurd } from "src/shared/auth.gaurd";
import { UserSession } from "src/user/user.session";

@Controller('api/ideas')
export class IdeaController {
    constructor(private ideaService: IdeaService) { }

    @Get()
    async getAllIdeas() {
        const result = await this.ideaService.getAll();
        return result;
    }

    @Post()
    @UseGuards(new AuthGaurd())
    @UsePipes(new ValidationPipe())
    async createIdea(@UserSession('id') userId: string, @Body() data: Idea) {
        const result = await this.ideaService.create(userId, data);
        return result;
    }

    @Get(':id')
    async getIdea(@Param('id') id: string) {
        const result = await this.ideaService.read(id);
        return result;
    }

    @Put(':id')
    @UseGuards(new AuthGaurd())
    @UsePipes(new ValidationPipe())
    async updateIdea(@Param('id') id: string, @UserSession('id') userId: string, @Body() data: Partial<Idea>) {
        const result = await this.ideaService.update(id, userId, data);
        return result;
    }

    @Delete(':id')
    @UseGuards(new AuthGaurd())
    async deleteIdea(@Param('id') id: string, @UserSession('id') userId: string) {
        const result = await this.ideaService.delete(id, userId);
        return result;
    }

    @Post(':id/bookmark')
    @UseGuards(new AuthGaurd())
    async bookmarkIdea(@Param('id') id: string, @UserSession('id') userId: string) {
        return this.ideaService.bookmark(id, userId);
    }

    @Delete(':id/bookmark')
    @UseGuards(new AuthGaurd())
    async unbookmarkIdea(@Param('id') id: string, @UserSession('id') userId: string) {
        return this.ideaService.unbookmark(id, userId);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGaurd())
    async upvoteIdea(@Param('id') id: string, @UserSession('id') userId: string) {
        return this.ideaService.upvote(id, userId);
     }

    @Post(':id/downvote')
    @UseGuards(new AuthGaurd())
    async downvoteIdea(@Param('id') id: string, @UserSession('id') userId: string) { 
        return this.ideaService.downvote(id, userId);
    }
}