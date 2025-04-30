import { Keyring } from "@polkadot/keyring";
import { mnemonicValidate } from "@polkadot/util-crypto";
import { u8aToHex, hexToU8a } from "@polkadot/util";

const SS58_FORMAT = 13116; // Bittensor Network Prefix
const MNEMONIC_LENGTH = 12;
const KEY_TYPE = 'sr25519';
const plaintext = 'The quick brown fox jumps over the lazy dog';
let salt = window.crypto.getRandomValues(new Uint8Array(16));

export const generateKeyPair = (mnemonic) => {
    const keyring = new Keyring({ type: KEY_TYPE, ss58Format: SS58_FORMAT });
    const pair = keyring.addFromMnemonic(mnemonic);
    pair.mnemonic = mnemonic;
    return {
        ss58Address: pair.address,
        publicKey: pair.publicKey,
        ss58Format: SS58_FORMAT,
        mnemonic: mnemonic,
        pair: pair
    };
}

export const validatePassword = (password) => {
    if (password.length < 8) return false
    else return true;
}

export const encodeText = (text) => {
    const encoder = new TextEncoder();
    return encoder.encode(text);
}

export const getKeyMaterial = async (password) => {
    return window.crypto.subtle.importKey(
        "raw",
        encodeText(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
    );
}

export const getKey = async (keyMaterial) => {
    return window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            salt: salt,
            "iterations": 100000,
            "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export const encrypt = async (password) => {
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, encodeText(plaintext)
    );
    return {
        ciphertext: ciphertext,
        iv: iv
        // ciphertext: Buffer.from(ciphertext).toString('base64'),
        // iv: Buffer.from(iv).toString('base64')
    }
}

export const decrypt = async (password, ciphertext, iv) => {
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);

    try {
        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            ciphertext
        );

        let dec = new TextDecoder();
        const decryptedText = dec.decode(decrypted)
        return decryptedText;
    } catch (e) {
        console.error("Decryption failed:", e);
        return null; // or handle the error as needed
    }
}

export const validatePlaintext = async (password, ciphertext, iv) => {
    const res = await decrypt(password, ciphertext, iv);
    if (res === plaintext) return true
    else return false;
}

/**
 * Error class for keyfile operations
 */
class KeyFileError extends Error {
    constructor(type, message) {
        super(message);
        this.name = "KeyFileError";
        this.type = type;
    }

    static serializationError(message) {
        return new KeyFileError("SerializationError", message);
    }

    static deserializationError(message) {
        return new KeyFileError("DeserializationError", message);
    }

    static genericError(message) {
        return new KeyFileError("Generic", message);
    }
}

/**
 * @returns {Uint8Array} - Serialized keyfile data as bytes
 */
export const serializedKeypairToKeyfileData = (keypair) => {
    try {
        const data = {};

        // Handle public key (add 0x prefix)
        if (keypair.publicKey) {
            const publicKeyHex = typeof keypair.publicKey === 'string'
                ? keypair.publicKey.startsWith('0x') ? keypair.publicKey : `0x${keypair.publicKey}`
                : `0x${u8aToHex(keypair.publicKey).substring(2)}`;

            data.accountId = publicKeyHex;
            data.publicKey = publicKeyHex;
        }

        // Handle private key (add 0x prefix)
        if (keypair.privateKey) {
            const privateKeyHex = typeof keypair.privateKey === 'string'
                ? keypair.privateKey.startsWith('0x') ? keypair.privateKey : `0x${keypair.privateKey}`
                : `0x${u8aToHex(keypair.privateKey).substring(2)}`;

            data.privateKey = privateKeyHex;
        }

        // Handle mnemonic
        if (keypair.mnemonic) {
            data.secretPhrase = keypair.mnemonic;
        }

        // Handle seed (add 0x prefix)
        if (keypair.seedHex) {
            let seedHexStr;

            // Check if seedHex is a UTF-8 string or bytes
            try {
                // If it's a Uint8Array, try to decode as UTF-8
                if (keypair.seedHex instanceof Uint8Array) {
                    const decoder = new TextDecoder('utf-8');
                    seedHexStr = decoder.decode(keypair.seedHex);
                } else {
                    // Otherwise use as is
                    seedHexStr = keypair.seedHex;
                }
            } catch (e) {
                // If UTF-8 decoding fails, treat as hex bytes
                seedHexStr = u8aToHex(keypair.seedHex).substring(2); // Remove leading 0x
            }

            data.secretSeed = `0x${seedHexStr}`;
        }

        // Handle SS58 address
        if (keypair.ss58Address) {
            data.ss58Address = keypair.ss58Address;
        }

        // Serialize to JSON string and convert to bytes
        const jsonData = JSON.stringify(data);
        const encoder = new TextEncoder();
        return encoder.encode(jsonData);
    } catch (error) {
        throw KeyFileError.serializationError(`Serialization error: ${error.message}`);
    }
};

/**
 * @returns {Object} - Reconstructed keypair object
 */
export const deserializeKeypairFromKeyfileData = (keyfileData) => {
    try {
        // Decode keyfile data from bytes to string
        const decoder = new TextDecoder();
        const decoded = decoder.decode(keyfileData);

        // Parse the JSON string
        const keyfileDict = JSON.parse(decoded);

        // Extract data from the keyfile
        const secretPhrase = keyfileDict.secretPhrase;

        // Create Keypair based on available data
        if (secretPhrase) {
            // Validate mnemonic
            if (!mnemonicValidate(secretPhrase)) {
                throw KeyFileError.genericError("Invalid mnemonic phrase");
            }
            const keyring = new Keyring({ type: KEY_TYPE, ss58Format: SS58_FORMAT });
            const pair = keyring.addFromMnemonic(secretPhrase);
            return pair;
        } else {
            throw KeyFileError.genericError("Keypair could not be created from keyfile data");
        }
    } catch (error) {
        if (error instanceof KeyFileError) {
            throw error;
        }
        throw KeyFileError.deserializationError(`Failed to deserialize keyfile data: ${error.message}`);
    }
};