import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageUploadService {
    constructor() { }

    async uploadImage(file: Express.Multer.File): Promise<null> {
        if (!file) {
            return null;
        }

        
        const formData = new FormData();
        formData.append('file', new Blob([file.buffer]), file.originalname);
        
        try {
            const response = await axios.post("https://api.storage.ishema.rw/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Basic ${Buffer.from("admin:password123").toString("base64")}`,
                },
                params: {
                    dir: "pet_shop/",
                },
            });

            return response.data.file_url;
        } catch (error) {
            throw new BadRequestException("Failed to upload image");
        }
    }
}