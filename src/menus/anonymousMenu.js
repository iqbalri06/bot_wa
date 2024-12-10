// menus/anonymousMenu.js

// Convert to ES Module syntax
const anonymousMenu = {
    title: '📨 PESAN ANONIM',
    instructions: `📝 Cara Menggunakan:
• Ketik: *!kirim* <nomor> <pesan>
• Contoh: *!kirim* 6281291458031 Halo!`,
    rules: `⚠️ Ketentuan:
• Max 200 karakter 
• Tulis Nomor Tidak menggunakan Spasi dan tanda *-*
• No SARA/NSFW
• No spam/flood`,
    tips: `💡 Tips Penggunaan:
• Cek nomor tujuan
• Tunggu respon
• Jaga kesopanan`,

    // Method to get formatted menu
    getFormattedMenu() {
        return `┌─────「 ${this.title} 」────┐\n\n${this.instructions}\n\n${this.rules}\n\n${this.tips}`;
    }
};

export default anonymousMenu;