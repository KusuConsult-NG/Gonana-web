import { NextRequest, NextResponse } from 'next/server';
import { uploadToStorage, deleteFromStorage } from '@/lib/firebase-admin';

/**
 * Example API route for file uploads to Firebase Storage
 * POST: Upload a file
 * DELETE: Delete a file
 */

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename
        const timestamp = Date.now();
        const filename = `uploads/${timestamp}-${file.name}`;

        // Upload to Firebase Storage
        const publicUrl = await uploadToStorage(buffer, filename, file.type);

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: publicUrl,
            filename,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json(
                { error: 'No file path provided' },
                { status: 400 }
            );
        }

        await deleteFromStorage(filePath);

        return NextResponse.json({
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Delete failed' },
            { status: 500 }
        );
    }
}
