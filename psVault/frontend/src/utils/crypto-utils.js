// -------------------------------------------------------------
//  CRYPTO UTILS – ECDH + AES + LOCALSTORAGE PRIVATE KEY
// -------------------------------------------------------------

export async function generateECDHKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

export async function exportPublicKey(publicKey) {
  const raw = await crypto.subtle.exportKey("raw", publicKey);
  return arrayBufferToBase64(raw);
}

export async function importPublicKey(base64Key) {
  console.log("📌 importPublicKey received:", base64Key);
  try {
    return await crypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(base64Key),
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
  } catch (err) {
    console.error("❌ importPublicKey failed:", err);
    return null;
  }
}

export async function savePrivateKey(privateKey) {
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  localStorage.setItem("psvault-private-key", arrayBufferToBase64(pkcs8));
}

export async function loadPrivateKey() {
  const stored = localStorage.getItem("psvault-private-key");
  if (!stored) return null;

  return await crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(stored),
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
}

export async function deriveSharedSecret(myPrivateKey, theirPublicKey) {
  return await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: theirPublicKey,
    },
    myPrivateKey,
    256
  );
}

export async function createAESKey(sharedSecretBits) {
  return await crypto.subtle.importKey(
    "raw",
    sharedSecretBits,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAES(aesKey, plainText) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(cipher),
  };
}

export async function decryptAES(aesKey, encryptedObj) {
  try {
    const { iv, ciphertext } = encryptedObj;
    if (!ciphertext || ciphertext.length < 20) {
      return "";
    }
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
      aesKey,
      base64ToArrayBuffer(ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("decryptAES failed:", err);
    return null;
  }
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let b of bytes) binary += String.fromCharCode(b);
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function getAESKeyForConversation(
  conversationId,
  myPrivateKey,
  theirPublicKeyBase64
) {
  const storageKey = `psvault-aeskey-${conversationId}`;
  const cached = localStorage.getItem(storageKey);
  if (cached) {
    try {
      return await crypto.subtle.importKey(
        "raw",
        base64ToArrayBuffer(cached),
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );
    } catch (err) {
      console.warn("Invalid cached AES key, clearing:", err);
      localStorage.removeItem(storageKey);
    }
  }

  const theirPubKey = await importPublicKey(theirPublicKeyBase64);
  const sharedBits = await deriveSharedSecret(myPrivateKey, theirPubKey);
  const aesKey = await createAESKey(sharedBits);

  const exported = await crypto.subtle.exportKey("raw", aesKey);
  localStorage.setItem(storageKey, arrayBufferToBase64(exported));

  return aesKey;
}
