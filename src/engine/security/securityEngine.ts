/**
 * WorkAbhi Security Tools Engine
 * 100% Browser-based, cryptographically secure algorithms using Web Crypto API.
 */

// Safe word list for Diceware passphrase generation
const DICEWARE_WORDS = [
  "apple", "arrow", "badge", "baker", "beach", "beard", "beast", "blend", "blink", "bloom",
  "board", "brave", "brick", "cabin", "cable", "camel", "candle", "cargo", "cedar", "chalk",
  "charm", "chase", "chess", "chief", "cloud", "clover", "coach", "coast", "coral", "crane",
  "creek", "crown", "delta", "drift", "eagle", "earth", "ember", "falcon", "fence", "flame",
  "flash", "flint", "forest", "frost", "garden", "giant", "glade", "globe", "grace", "grain",
  "grass", "grove", "guard", "harbor", "haven", "hawk", "hazel", "honey", "hound", "island",
  "ivory", "jasper", "jewel", "jolly", "karma", "knight", "latch", "lemon", "light", "lodge",
  "lotus", "lunar", "magic", "mango", "maple", "marsh", "meadow", "melon", "merit", "meteor",
  "mint", "mirror", "monarch", "moss", "motel", "native", "nectar", "noble", "north", "oasis",
  "ocean", "olive", "onyx", "orbit", "orchid", "otter", "palace", "panda", "pearl", "pebble",
  "phoenix", "pilot", "pine", "pixel", "planet", "plaza", "polar", "prism", "pulse", "quarry",
  "quartz", "quest", "quiet", "quill", "radar", "raven", "reef", "rhino", "ridge", "river",
  "robin", "rocket", "royal", "ruby", "saddle", "safari", "sailor", "salmon", "scale", "scout",
  "shadow", "shield", "silver", "sketch", "solar", "spark", "spirit", "spring", "stable", "steel",
  "stone", "storm", "summit", "sunset", "swift", "table", "talon", "target", "temple", "thistle",
  "thunder", "tiger", "timber", "titan", "topaz", "torch", "tower", "trail", "tulip", "tunnel",
  "turtle", "valley", "vapor", "velvet", "vessel", "vigor", "violet", "viper", "vision", "walnut",
  "wave", "willow", "winter", "wisdom", "wizard", "wolf", "yacht", "zenith", "zephyr", "zodiac"
];

// Lightweight pure JS MD5 implementation for non-security hash comparisons
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTempOne = lMessageLength + 8;
    const lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue: number) {
    let wordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeLookalikes: boolean; // e.g. 0, O, l, 1, I
  count?: number;
}

export function generatePassword(options: PasswordGeneratorOptions): string[] {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeLookalikes = false,
    count = 1,
  } = options;

  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let numbers = "0123456789";
  let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (excludeLookalikes) {
    upper = upper.replace(/[IO]/g, "");
    lower = lower.replace(/[lo]/g, "");
    numbers = numbers.replace(/[01]/g, "");
    symbols = symbols.replace(/[|;:]/g, "");
  }

  const pools: string[] = [];
  if (includeUppercase && upper) pools.push(upper);
  if (includeLowercase && lower) pools.push(lower);
  if (includeNumbers && numbers) pools.push(numbers);
  if (includeSymbols && symbols) pools.push(symbols);

  if (pools.length === 0) {
    pools.push(lower || "abcdefghijklmnopqrstuvwxyz");
  }

  const allChars = pools.join("");
  const safeLength = Math.max(4, Math.min(128, length));
  const safeCount = Math.max(1, Math.min(20, count));
  const results: string[] = [];

  for (let c = 0; c < safeCount; c++) {
    const chars: string[] = [];
    const randomBytes = new Uint32Array(safeLength + pools.length);
    crypto.getRandomValues(randomBytes);

    // Guarantee at least one from each selected pool
    pools.forEach((pool, idx) => {
      chars.push(pool[randomBytes[idx] % pool.length]);
    });

    // Fill remaining
    for (let i = chars.length; i < safeLength; i++) {
      chars.push(allChars[randomBytes[i] % allChars.length]);
    }

    // Shuffle using Fisher-Yates
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomBytes[i] % (i + 1);
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }

    results.push(chars.join(""));
  }

  return results;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  entropyBits: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  crackTimeDisplay: string;
  feedback: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      entropyBits: 0,
      label: "Very Weak",
      crackTimeDisplay: "Instant",
      feedback: ["Enter a password to analyze its strength."],
    };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  const entropyBits = Math.round(password.length * Math.log2(Math.max(2, poolSize)));
  const feedback: string[] = [];

  if (password.length < 8) feedback.push("Password is too short (use at least 12 characters).");
  if (!hasUpper) feedback.push("Add uppercase letters.");
  if (!hasLower) feedback.push("Add lowercase letters.");
  if (!hasDigits) feedback.push("Add numeric digits.");
  if (!hasSymbols) feedback.push("Add special symbols.");

  // Common dictionary patterns
  if (/^[a-zA-Z]+$/.test(password)) feedback.push("Avoid using only letters.");
  if (/^[0-9]+$/.test(password)) feedback.push("Avoid using only numbers.");
  if (/(.)\1{2,}/.test(password)) feedback.push("Avoid repeating characters.");

  let score = 0;
  let label: PasswordStrengthResult["label"] = "Very Weak";
  let crackTimeDisplay = "Instant";

  if (entropyBits < 28) {
    score = 0;
    label = "Very Weak";
    crackTimeDisplay = "< 1 second";
  } else if (entropyBits < 42) {
    score = 1;
    label = "Weak";
    crackTimeDisplay = "A few seconds";
  } else if (entropyBits < 60) {
    score = 2;
    label = "Fair";
    crackTimeDisplay = "A few hours to days";
  } else if (entropyBits < 80) {
    score = 3;
    label = "Strong";
    crackTimeDisplay = "Several years";
    if (feedback.length === 0) feedback.push("Strong password with high entropy.");
  } else {
    score = 4;
    label = "Very Strong";
    crackTimeDisplay = "Centuries / Uncrackable";
    feedback.push("Exceptional security and cryptographic entropy.");
  }

  return { score, entropyBits, label, crackTimeDisplay, feedback };
}

export async function computeHash(
  text: string,
  algorithm: "SHA-256" | "SHA-512" | "SHA-384" | "SHA-1" | "MD5",
  hmacKey?: string
): Promise<string> {
  if (algorithm === "MD5") {
    return md5(text);
  }

  const enc = new TextEncoder();
  const data = enc.encode(text);

  if (hmacKey && hmacKey.trim()) {
    const keyData = enc.encode(hmacKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: algorithm } },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeFileChecksum(
  file: File,
  algorithm: "SHA-256" | "SHA-512" | "SHA-1" | "MD5" = "SHA-256"
): Promise<string> {
  if (algorithm === "MD5") {
    const text = await file.text();
    return md5(text);
  }
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function encodeBase64(input: string, urlSafe = false): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return base64;
}

export function decodeBase64(input: string): string {
  let clean = input.trim();
  clean = clean.replace(/-/g, "+").replace(/_/g, "/");
  while (clean.length % 4 !== 0) {
    clean += "=";
  }
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const dec = new TextDecoder();
  return dec.decode(bytes);
}

export interface DecodedJWT {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  isExpired: boolean;
  expiresAtFormatted?: string;
  issuedAtFormatted?: string;
  validityStatus: "VALID" | "EXPIRED" | "NOT_YET_VALID" | "NO_EXPIRY";
}

export function inspectJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT format: Token must have at least header and payload separated by a dot.");
  }

  const decodePart = (str: string) => {
    let clean = str.replace(/-/g, "+").replace(/_/g, "/");
    while (clean.length % 4 !== 0) clean += "=";
    return JSON.parse(decodeURIComponent(escape(atob(clean))));
  };

  const header = decodePart(parts[0]);
  const payload = decodePart(parts[1]);
  const signature = parts[2] || "";

  let isExpired = false;
  let validityStatus: DecodedJWT["validityStatus"] = "NO_EXPIRY";
  let expiresAtFormatted: string | undefined = undefined;
  let issuedAtFormatted: string | undefined = undefined;

  const nowSec = Math.floor(Date.now() / 1000);

  if (payload.exp && typeof payload.exp === "number") {
    expiresAtFormatted = new Date(payload.exp * 1000).toLocaleString();
    if (payload.exp < nowSec) {
      isExpired = true;
      validityStatus = "EXPIRED";
    } else {
      validityStatus = "VALID";
    }
  }

  if (payload.nbf && typeof payload.nbf === "number" && payload.nbf > nowSec) {
    validityStatus = "NOT_YET_VALID";
  }

  if (payload.iat && typeof payload.iat === "number") {
    issuedAtFormatted = new Date(payload.iat * 1000).toLocaleString();
  }

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresAtFormatted,
    issuedAtFormatted,
    validityStatus,
  };
}

export function generateCryptoTokens(
  type: "hex" | "base64" | "uuid" | "alphanumeric" | "apikey",
  count: number = 5,
  byteLength: number = 32
): string[] {
  const safeCount = Math.max(1, Math.min(30, count));
  const safeBytes = Math.max(8, Math.min(128, byteLength));
  const tokens: string[] = [];

  for (let i = 0; i < safeCount; i++) {
    if (type === "uuid") {
      tokens.push(crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      ));
      continue;
    }

    const arr = new Uint8Array(safeBytes);
    crypto.getRandomValues(arr);

    if (type === "hex") {
      tokens.push(Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join(""));
    } else if (type === "base64") {
      let bin = "";
      arr.forEach((b) => (bin += String.fromCharCode(b)));
      tokens.push(btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
    } else if (type === "apikey") {
      const hex = Array.from(arr.slice(0, 24)).map((b) => b.toString(16).padStart(2, "0")).join("");
      tokens.push(`sk_live_${hex}`);
    } else {
      // Alphanumeric
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let res = "";
      arr.forEach((b) => (res += chars[b % chars.length]));
      tokens.push(res);
    }
  }

  return tokens;
}

export function generateDicewarePassphrase(
  wordCount: number = 4,
  separator: string = "-",
  capitalize: boolean = true
): string {
  const safeCount = Math.max(2, Math.min(10, wordCount));
  const words: string[] = [];
  const randomIndices = new Uint32Array(safeCount);
  crypto.getRandomValues(randomIndices);

  for (let i = 0; i < safeCount; i++) {
    let word = DICEWARE_WORDS[randomIndices[i] % DICEWARE_WORDS.length];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  return words.join(separator);
}

export async function encryptTextAES(plaintext: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  // Pack salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  let binary = "";
  combined.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function decryptTextAES(encryptedBase64: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const binary = atob(encryptedBase64.trim());
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  if (combined.length < 28) {
    throw new Error("Invalid encrypted payload: Data is too short to contain salt and IV.");
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return dec.decode(decrypted);
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
}

export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&#x2F;": "/",
    "&#39;": "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#039|#x2F|#39);/g, (m) => map[m]);
}
