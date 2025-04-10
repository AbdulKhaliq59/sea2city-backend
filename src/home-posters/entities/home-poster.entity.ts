// src/home-posters/entities/home-poster.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("home_posters")
export class HomePoster {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bannerText: string; // Renamed from title to bannerText

    @Column()
    imageUrl: string; // Not nullable since posters need an image

    @Column({ default: false })
    isActive: boolean; // To control which posters are displayed

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
