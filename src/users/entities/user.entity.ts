import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Exclude } from "class-transformer"
import { Role } from "../enums/role.enum"

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ unique: true })
    email: string

    @Column()
    @Exclude()
    password: string

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER,
    })
    role: Role

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

