import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from "@prisma/client/extension";



const prisma = new PrismaClient();


// Configuration
    cloudinary.config({ 
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

interface cloudinaryUploadResult {
        public_id: string;
        bytes: number;
        duration?: number;
        [key: string]: any;
    }

export async function POST(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return NextResponse.json({ error: 'Missing Cloudinary credentials' }, { status: 500 });
    }

    try {

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const originalSize = formData.get('originalSize') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<cloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream =cloudinary.uploader.upload_stream(
                    {   
                        resource_type: 'video',
                        folder: 'video-cloud-saas',
                        transformation: [
                            {quality: "auto", fetch_format: "mp4"},
                        ]
                    }, 
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result as cloudinaryUploadResult);
                        }
                    }
                )
                uploadStream.end(buffer);
            }
        )

        const video = await prisma.video.create({
            data: {
                title,
                description,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                publicId: result.public_id,
                duration: result.duration || 0,
            }
        });
        return NextResponse.json(video);

    } catch (error) {
        console.log("upload video failed",error)
        return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }

}
