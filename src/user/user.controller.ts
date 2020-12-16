import { Body, Controller, Get, Injectable, Post, UsePipes } from '@nestjs/common';
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
