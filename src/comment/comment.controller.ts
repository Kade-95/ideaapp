import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGaurd } from 'src/shared/auth.gaurd';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { UserSession } from 'src/user/user.session';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService) { }

    @Get('idea/:id')
    getCommentByIdea(@Param('id') ideaId: string, @Query('page') page: number = 1) {
        return this.commentService.readByIdea(ideaId, page);
    }

    @Get('user/:id')
    getCommentByUser(@Param('id') userId: string, @Query('page') page: number = 1) {
        return this.commentService.readByUser(userId, page);
    }

    @Get(':id')
    getIdea(@Param('id') id: string) {
        return this.commentService.read(id);
    }

    @Post('idea/:id')
    @UseGuards(new AuthGaurd())
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') ideaId: string, @UserSession('id') userId: string, @Body() data: Comment) {
        return this.commentService.create(ideaId, userId, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGaurd())
    @UsePipes(new ValidationPipe())
    deleteComment(@Param('id') id: string, @UserSession('id') userId: string) {
        return this.commentService.delete(id, userId);
    }
}
