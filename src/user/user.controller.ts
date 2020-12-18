import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller()
export class UserController {

    constructor(private userService: UserService) { }
    @Get('api/users')
    async getAllUsers() {
        return await this.userService.getAll();
    }

    @Get('api/users/:id')
    async getUser(@Param('id') id: string) {
        return await this.userService.read(id);
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body() data: User) {
        return await this.userService.login(data);
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    async register(@Body() data: User) {
        return await this.userService.register(data);
    }
}
