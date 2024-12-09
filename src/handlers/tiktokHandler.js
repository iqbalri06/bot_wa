// handlers/tiktokHandler.js
const tik = require('rahad-media-downloader');
const axios = require('axios');

function isValidTikTokUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const regex = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com(?:\/[@\w.-]+\/video\/\d+|\/@[\w.-]+\/video\/\d+|\/\w+)/i;
    return regex.test(url);
}

async function downloadTiktok(url) {
    try {
        console.log('Downloading from URL:', url);
        
        const result = await tik.rahadtikdl(url);
        console.log('API Response:', JSON.stringify(result, null, 2));

        // Check if response has data and noWatermarkMp4 URL
        if (!result?.data?.noWatermarkMp4) {
            throw new Error('Video URL not found in response');
        }

        // Get direct video URL from response
        const videoUrl = result.data.noWatermarkMp4;
        
        // Download video buffer
        const videoBuffer = await downloadVideoBuffer(videoUrl);

        return {
            success: true,
            videoData: videoBuffer,
            title: result.data.title || 'No Title',
            stats: {
                plays: result.data.play_count || 0,
                likes: result.data.react_count || 0,
                comments: result.data.comment_count || 0,
                shares: result.data.share_count || 0
            }
        };

    } catch (error) {
        console.error('Download error:', error);
        return {
            success: false,
            error: `Failed to download: ${error.message}`
        };
    }
}

async function downloadVideoBuffer(url) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Video download failed: ${error.message}`);
    }
}

async function handleTiktokCommand(sock, senderId, url) {
    try {
        if (!isValidTikTokUrl(url)) {
            await sock.sendMessage(senderId, {
                text: '❌ URL tidak valid!'
            });
            return;
        }

        await sock.sendMessage(senderId, {
            text: '⏳ Sedang mengunduh video...'
        });

        const result = await downloadTiktok(url);

        if (result.success) {
            await sock.sendMessage(senderId, {
                video: result.videoData,
                caption: `✅ *Download Berhasil!*\n\n` +
                        `📝 *Caption:* ${result.title}\n\n` +
                        `📊 *Stats:*\n` +
                        `▢ Views: ${result.stats.plays}\n` +
                        `▢ Likes: ${result.stats.likes}\n` +
                        `▢ Comments: ${result.stats.comments}\n` +
                        `▢ Shares: ${result.stats.shares}`,
                mimetype: 'video/mp4'
            });
        } else {
            await sock.sendMessage(senderId, {
                text: '❌ ' + result.error
            });
        }
    } catch (error) {
        console.error('TikTok handler error:', error);
        await sock.sendMessage(senderId, {
            text: '❌ Terjadi kesalahan! Silakan coba lagi nanti.'
        });
    }
}

module.exports = { handleTiktokCommand };