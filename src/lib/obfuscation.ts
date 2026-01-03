import crypto from "crypto";

// Use a fixed key for consistency. In production, this should be in .env
// Fallback ensures it works immediately without restarting dev server
const SECRET_KEY = process.env.OBFUSCATION_SECRET || process.env.NEXTAUTH_SECRET || "default_secret_key_at_least_32_bytes_long_!!";
const ALGORITHM = "aes-256-cbc";

// Ensure key is 32 bytes
const key = crypto.createHash("sha256").update(String(SECRET_KEY)).digest();

export function encodeId(id: string): string {
    if (!id) return "";
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(id, "utf8", "base64");
        encrypted += cipher.final("base64");

        // access IV + Encrypted data
        const combined = iv.toString("hex") + ":" + encrypted;

        // Make URL safe (replace + with -, / with _, remove =)
        return combined.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
        console.error("Error encoding ID:", e);
        return id; // Fallback to plain ID if error (shouldn't happen)
    }
}

export function decodeId(obfuscatedId: string): string | null {
    if (!obfuscatedId) return null;

    try {
        // Ensure we work with decoded string (Next.js usually does this, but being safe)
        const cleanId = decodeURIComponent(obfuscatedId);

        // Check if it's potentially an encrypted ID (has IV:Cypher structure)
        if (cleanId.includes(":")) {
            // Restore URL safe chars
            let str = cleanId.replace(/-/g, "+").replace(/_/g, "/");

            // Pad base64 if needed
            while (str.length % 4) {
                str += "=";
            }

            const parts = str.split(":");
            if (parts.length !== 2) {
                console.warn("[Obfuscation] Invalid format:", cleanId);
                return null;
            }

            const iv = Buffer.from(parts[0], "hex");
            const encrypted = parts[1];

            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            let decrypted = decipher.update(encrypted, "base64", "utf8");
            decrypted += decipher.final("utf8");

            return decrypted;
        }

        // Fallback: If it doesn't look like an encrypted ID, assume it's a plain ID (legacy support)
        // But strictly, if we demand obfuscation, we might want to reject this too. 
        // For now, let's allow it if it looks like a Mongo ID (24 hex chars)
        if (/^[a-fA-F0-9]{24}$/.test(cleanId)) {
            return cleanId;
        }
    } catch (e) {
        console.error("[Obfuscation] Decryption failed for:", obfuscatedId, e);
        return null;
    }

    // If neither, it's invalid
    console.warn("[Obfuscation] ID rejected:", obfuscatedId);
    return null;
}
