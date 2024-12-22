const { removeBackground } = require('@imgly/background-removal-node');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeFile, unlink, mkdir } = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const path = require('path');

// Update path configuration using Node's path resolution
const BASE_PATH = path.resolve(__dirname, '../../node_modules/@imgly/background-removal-node');
const DIST_PATH = path.join(BASE_PATH, 'dist');
const RESOURCE_PATH = path.join(BASE_PATH, 'dist', 'resources.json');

async function convertToValidImage(buffer) {
    try {
        // Convert to raw RGB/RGBA format
        const image = await sharp(buffer)
            .toColorspace('srgb')
            .removeAlpha()
            .jpeg({ quality: 100 })
            .toBuffer();

        // Verify the image was converted successfully
        const metadata = await sharp(image).metadata();
        console.log('Converted image metadata:', metadata);
        
        return image;
    } catch (error) {
        console.error('Image conversion error:', error);
        throw new Error('Failed to convert image to valid format');
    }
}

async function handleRemoveBackground(sock, senderId, messageType, message) {
    const tempFiles = [];
    try {
        if (!messageType || !messageType.includes('image')) {
            await sock.sendMessage(senderId, { text: '❌ Please send an image with the command.' });
            return;
        }

        await sock.sendMessage(senderId, { text: '⏳ Processing your image...' });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            if (!buffer || buffer.length === 0) {
                throw new Error('Failed to download image');
            }

            // Convert image first
            const validBuffer = await convertToValidImage(buffer);
            
            // Create temporary input file
            const inputFile = `./temp/${uuidv4()}_input.jpg`;
            await writeFile(inputFile, validBuffer);
            tempFiles.push(inputFile);

            await mkdir('./temp', { recursive: true });

            // Updated configuration with correct paths
            const config = {
                debug: true,
                proxyToWorker: false,
                model: 'medium',
                output: {
                    format: 'image/png',
                    quality: 0.8
                },
                input: {
                    format: 'image/jpeg'
                },
                progress: (key, current, total) => {
                    if (current === total) {
                        sock.sendMessage(senderId, { 
                            text: '🔄 Processing complete, generating image...' 
                        }).catch(() => {});
                    }
                }
            };

            // Verify resources exist before processing
            if (!require('fs').existsSync(RESOURCE_PATH)) {
                throw new Error('Background removal resources not found. Please reinstall @imgly/background-removal-node');
            }

            // Process the image using the file path instead of buffer
            const blob = await removeBackground(inputFile, config);
            
            // Save blob to file
            const outputFile = `./temp/${uuidv4()}.png`;
            tempFiles.push(outputFile);
            await writeFile(outputFile, Buffer.from(await blob.arrayBuffer()));

            await sock.sendMessage(senderId, {
                image: { url: outputFile },
                caption: '✅ Background removed successfully!'
            });

        } catch (error) {
            console.error('Processing error details:', error);
            await sock.sendMessage(senderId, { 
                text: `❌ Failed to process image: ${error.message}` 
            });
        }
    } catch (error) {
        console.error('Background removal error:', error);
        await sock.sendMessage(senderId, { 
            text: '❌ Failed to process the image. Please try again later.' 
        });
    } finally {
        // Cleanup temp files
        for (const file of tempFiles) {
            try {
                await unlink(file).catch(() => {});
            } catch (error) {}
        }
    }
}

module.exports = { handleRemoveBackground };