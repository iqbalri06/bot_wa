import igdownloader from 'priyansh-ig-downloader';

// handlers/instagramHandler.js
// Configuration constants
const CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    RETRY_MULTIPLIER: 2,
    SUPPORTED_IMAGE_FORMATS: /\.(jpg|jpeg|png|webp)/i,
    MESSAGES: {
        DOWNLOADING: '⏳ Sedang mengunduh media...',
        SUCCESS: '✅ *Download Berhasil!*',
        INVALID_URL: '❌ URL tidak valid! Format yang benar: https://www.instagram.com/p/XXXXX atau https://www.instagram.com/reel/XXXXX',
        SYSTEM_ERROR: '❌ Terjadi kesalahan sistem! Silakan coba lagi nanti.',
        PROCESSING: '⌛ Memproses media...'
    }
};

/**
 * Validates if the provided URL is a valid Instagram post/reel URL
 */
function isValidInstagramUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        if (!['instagram.com', 'www.instagram.com'].includes(hostname)) {
            return false;
        }
        
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts.length >= 2 && ['p', 'reel'].includes(pathParts[0]);
    } catch {
        return false;
    }
}

/**
 * Downloads media from Instagram URL with retry mechanism
 */
async function downloadInstagramMedia(url) {
    let lastError = null;
    
    if (!url) {
        return {
            success: false,
            error: 'URL is required'
        };
    }

    for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1} of ${CONFIG.MAX_RETRIES}`);
            
            const result = await igdownloader(url);
            console.log('API Response:', JSON.stringify(result, null, 2));

            if (!result?.data?.length) {
                throw new Error('No media found in response');
            }

            const uniqueMediaMap = new Map();
            result.data.forEach(media => {
                if (!uniqueMediaMap.has(media.url)) {
                    uniqueMediaMap.set(media.url, media);
                }
            });

            const uniqueMediaItems = Array.from(uniqueMediaMap.values());

            return {
                success: true,
                mediaItems: uniqueMediaItems.map(media => ({
                    url: media.url,
                    isVideo: media.type === 'video',
                    thumbnail: media.thumbnail || '',
                    caption: result.caption || ''
                }))
            };

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            
            if (attempt < CONFIG.MAX_RETRIES - 1) {
                const delay = CONFIG.RETRY_DELAY * Math.pow(CONFIG.RETRY_MULTIPLIER, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    return {
        success: false,
        error: `Download failed after ${CONFIG.MAX_RETRIES} attempts: ${lastError?.message}`
    };
}

/**
 * Handles Instagram download command
 */
async function handleInstagramCommand(sock, senderId, url) {
    if (!sock || !senderId) {
        console.error('Invalid parameters provided');
        return;
    }

    try {
        if (!isValidInstagramUrl(url)) {
            await sock.sendMessage(senderId, {
                text: CONFIG.MESSAGES.INVALID_URL
            });
            return;
        }

        await sock.sendMessage(senderId, {
            text: CONFIG.MESSAGES.DOWNLOADING
        });

        const result = await downloadInstagramMedia(url);

        if (result.success) {
            if (result.mediaItems.length > 1) {
                await sock.sendMessage(senderId, {
                    text: `${CONFIG.MESSAGES.PROCESSING}\nDitemukan ${result.mediaItems.length} media...`
                });
            }

            // Kirim media dengan delay
            for (const [index, media] of result.mediaItems.entries()) {
                const isImage = media.url.match(CONFIG.SUPPORTED_IMAGE_FORMATS);
                const caption = `${CONFIG.MESSAGES.SUCCESS}${
                    media.caption ? `\n\n📝 Caption: ${media.caption}` : ''
                }${
                    result.mediaItems.length > 1 
                        ? `\n\nMedia ${index + 1} dari ${result.mediaItems.length}` 
                        : ''
                }`;

                try {
                    // Tambahkan delay 1 detik antara pengiriman
                    if (index > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    await sock.sendMessage(senderId, {
                        [isImage ? 'image' : 'video']: { url: media.url },
                        caption,
                        ...(isImage ? {} : { mimetype: 'video/mp4' })
                    });
                } catch (mediaError) {
                    console.error(`Failed to send media ${index + 1}:`, mediaError);
                    await sock.sendMessage(senderId, {
                        text: `❌ Gagal mengirim media ${index + 1}: ${mediaError.message}`

                    });
                }
            }
        } else {
            await sock.sendMessage(senderId, {
                text: `❌ ${result.error}`
            });
        }
    } catch (error) {
        console.error('Instagram handler error:', error);
        await sock.sendMessage(senderId, {
            text: CONFIG.MESSAGES.SYSTEM_ERROR
        });
    }
}

module.exports = { handleInstagramCommand };