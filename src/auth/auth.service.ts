import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UsersService } from "../users/users.service"
import { CreateUserDto } from "../users/dto/create-user.dto"
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user
            return result
        }
        return null
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role }
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            access_token: this.jwtService.sign(payload),
        }
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto)
        const { password, ...result } = user
        return result
    }
}

