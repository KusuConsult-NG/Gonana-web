import { NextRequest, NextResponse } from 'next/server';
import { uploadToStorage, deleteFromStorage } from '@/lib/firebase-admin';
import { isValidImage } from '@/lib/validators';

/**
 * File upload API with validation and security checks
 * POST: Upload a file
 * DELETE: Delete a file
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF' },
                { status: 400 }
            );
        }

        // Additional validation using filename
        const imageValidation = isValidImage(file.name, file.size);
        if (!imageValidation.valid) {
            return NextResponse.json(
                { error: imageValidation.error },
                { status: 400 }
            );
        }

        // Sanitize filename - remove special characters
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Basic security check - check for malicious patterns in first few bytes
        const header = buffer.toString('utf8', 0, Math.min(100, buffer.length));
        if (header.includes('<?php') || header.includes('<script')) {
            return NextResponse.json(
                { error: 'Potentially malicious file detected' },
                { status: 400 }
            );
        }

        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const filename = `uploads/${timestamp}-${sanitizedName}`;

        // Upload to Firebase Storage
        const publicUrl = await uploadToStorage(buffer, filename, file.type);

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: publicUrl,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
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

        // Validate file path to prevent directory traversal
        if (filePath.includes('..') || !filePath.startsWith('uploads/')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }

        await deleteFromStorage(filePath);

        return NextResponse.json({
            message: 'File deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}
