import { Controller, Post, Body, UseGuards, Request, Get } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginDto } from "./dto/login.dto"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @ApiOperation({ summary: "Login user" })
    @ApiResponse({ status: 200, description: "User successfully logged in" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(@Body() loginDto: LoginDto, @Request() req) {
        return this.authService.login(req.user)
    }

    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile returned' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}

