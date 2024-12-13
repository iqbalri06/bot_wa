// handlers/instagramHandler.js
const igdl  = require('btch-downloader')

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function isValidInstagramUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel)\/([^/?#&]+)/;
    return regex.test(url);
}

async function downloadInstagramMedia(url) {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1} of ${MAX_RETRIES}`);
            
            const result = await igdl(url);
            console.log('API Response:', JSON.stringify(result, null, 2));

            if (!result || !result.length) {
                throw new Error('No media found in response');
            }

            // Get highest quality video/image
            const media = result[0];

            return {
                success: true,
                mediaData: media.url,
                isVideo: media.type === 'video',
                thumbnail: media.thumbnail || '',
                caption: media.caption || ''
            };

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            
            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            }
        }
    }

    return {
        success: false,
        error: `Download failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
    };
}

async function handleInstagramCommand(sock, senderId, url) {
    try {
        if (!isValidInstagramUrl(url)) {
            await sock.sendMessage(senderId, {
                text: '❌ URL tidak valid! Harap berikan URL Instagram yang benar.'
            });
            return;
        }

        await sock.sendMessage(senderId, {
            text: '⏳ Sedang mengunduh media...'
        });

        const result = await downloadInstagramMedia(url);

        if (result.success) {
            // Check if URL is an image by extension
            const isImage = result.mediaData.match(/\.(jpg|jpeg|png|webp)/i);
            
            if (isImage) {
                await sock.sendMessage(senderId, {
                    image: { url: result.mediaData },
                    caption: `✅ *Download Berhasil!*\n\n`
                });
            } else {
                await sock.sendMessage(senderId, {
                    video: { url: result.mediaData },
                    caption: `✅ *Download Berhasil!*\n\n`,
                    mimetype: 'video/mp4'
                });
            }
        } else {
            await sock.sendMessage(senderId, {
                text: '❌ ' + result.error
            });
        }
    } catch (error) {
        console.error('Instagram handler error:', error);
        await sock.sendMessage(senderId, {
            text: '❌ Terjadi kesalahan! Silakan coba lagi nanti.'
        });
    }
}

module.exports = { handleInstagramCommand };