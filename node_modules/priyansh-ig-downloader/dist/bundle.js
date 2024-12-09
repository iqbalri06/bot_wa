(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["insta-package"] = factory());
})(this, (function () { 'use strict';

    const CryptoJS = require('crypto-js');
    const { fetch } = require('undici'); // Import fetch from undici
                       

    function encrypt (input) {

        const key = CryptoJS.enc.Utf8.parse('qwertyuioplkjhgf');

        const iv = CryptoJS.lib.WordArray.random(16); // IV length is 16 bytes



        const encrypted = CryptoJS.AES.encrypt(input, key, {

            iv: iv,

            mode: CryptoJS.mode.ECB,

            padding: CryptoJS.pad.Pkcs7,

        });



        // Convert the encrypted bytes to a hex string

        const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

        return encryptedHex;

    }

    async function main (url) {



        return new Promise(async (resolve, reject) => {

            try {

                const base_url = "https://backend.instavideosave.com/allinone";

                const headers = {

                    'url': encrypt(url)

                };

                const response = await fetch(base_url, {

                    method: "GET",

                    headers,

                });

                const data = await response.json();



                if (!data) reject({ result: null });

                delete data.fetch;

                resolve(data);

            } catch (err) {

                reject(err);

            }

        })



    }

    return main;

}));
