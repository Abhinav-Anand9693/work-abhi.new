"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  FileCheck,
  Hash,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import {
  generatePassword,
  evaluatePasswordStrength,
  computeHash,
  computeFileChecksum,
  encodeBase64,
  decodeBase64,
  inspectJWT,
  generateCryptoTokens,
  generateDicewarePassphrase,
  encryptTextAES,
  decryptTextAES,
  escapeHtml,
  unescapeHtml,
} from "@/engine/security/securityEngine";

interface SecurityToolProps {
  toolId: string;
}

export default function SecurityTool({ toolId }: SecurityToolProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string = "default") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Route to sub-tool
  switch (toolId) {
    case "password-generator":
    case "strong-password-generator":
    case "random-password-generator":
      return <PasswordGeneratorView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "password-strength-checker":
    case "password-entropy-analyzer":
      return <PasswordStrengthView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "hash-generator":
    case "sha256-hash-generator":
    case "sha512-hash-generator":
    case "md5-hash-generator":
      return <HashGeneratorView initialAlgo={toolId.includes("512") ? "SHA-512" : toolId.includes("md5") ? "MD5" : "SHA-256"} onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "file-checksum-verifier":
    case "file-hash-checker":
      return <FileChecksumView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "base64-encoder-decoder":
    case "base64-encoder":
    case "base64-decoder":
      return <Base64View onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "jwt-decoder":
    case "jwt-inspector":
      return <JwtDecoderView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "token-generator":
    case "api-key-generator":
    case "uuid-generator":
    case "uuid-v4-generator":
      return <TokenGeneratorView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "aes-encryptor":
    case "aes-encryption-tool":
      return <AesEncryptorView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "diceware-passphrase-generator":
    case "passphrase-generator":
      return <DicewareView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "url-encoder-decoder":
      return <UrlEncoderView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    case "html-entity-encoder":
    case "xss-filter-encoder":
      return <HtmlEntityView onCopy={copyToClipboard} copiedId={copiedIndex} />;

    default:
      return <PasswordGeneratorView onCopy={copyToClipboard} copiedId={copiedIndex} />;
  }
}

/* =========================================================================
   1. PASSWORD GENERATOR
========================================================================= */
function PasswordGeneratorView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeLookalikes, setExcludeLookalikes] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);

  const handleGenerate = () => {
    const list = generatePassword({
      length,
      includeUppercase: uppercase,
      includeLowercase: lowercase,
      includeNumbers: numbers,
      includeSymbols: symbols,
      excludeLookalikes,
      count,
    });
    setPasswords(list);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, uppercase, lowercase, numbers, symbols, excludeLookalikes, count]);

  const primaryPassword = passwords[0] || "";
  const strength = evaluatePasswordStrength(primaryPassword);

  return (
    <div className="space-y-6">
      {/* Primary Highlight Card */}
      <div className="p-6 rounded-2xl border border-primary/25 bg-card/80 backdrop-blur shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 font-mono text-lg sm:text-2xl font-bold tracking-wider break-all text-primary select-all">
            {primaryPassword}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopy(primaryPassword, "primary")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              {copiedId === "primary" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedId === "primary" ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleGenerate}
              className="p-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground transition-colors"
              title="Generate New Password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strength bar */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Strength: <strong className="text-foreground">{strength.label}</strong> ({strength.entropyBits} bits entropy)</span>
            <span>Est. Crack Time: <strong className="text-foreground">{strength.crackTimeDisplay}</strong></span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 rounded-full transition-colors ${
                  strength.score > step
                    ? strength.score === 4
                      ? "bg-emerald-500"
                      : strength.score === 3
                      ? "bg-blue-500"
                      : strength.score === 2
                      ? "bg-amber-500"
                      : "bg-rose-500"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Password Configuration
        </h3>

        <div>
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Password Length</span>
            <span className="font-bold text-primary">{length} characters</span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Symbols (!@#$%)</span>
          </label>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={excludeLookalikes}
              onChange={(e) => setExcludeLookalikes(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Exclude Lookalikes (0, O, l, 1)</span>
          </label>
        </div>
      </div>

      {/* Batch Generated Passwords */}
      {passwords.length > 1 && (
        <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Alternative Generated Passwords</h4>
            <span className="text-xs text-muted-foreground">{passwords.length} items</span>
          </div>
          <div className="space-y-2">
            {passwords.slice(1).map((pw, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 text-sm font-mono"
              >
                <span className="text-foreground/90 break-all select-all">{pw}</span>
                <button
                  onClick={() => onCopy(pw, `batch-${i}`)}
                  className="ml-2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copy password"
                >
                  {copiedId === `batch-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. PASSWORD STRENGTH & ENTROPY ANALYZER
========================================================================= */
function PasswordStrengthView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [password, setPassword] = useState("K9#vR2$mP9x!aQ");
  const [showPassword, setShowPassword] = useState(true);

  const result = evaluatePasswordStrength(password);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <label className="text-sm font-semibold text-foreground flex items-center justify-between">
          <span>Enter Password to Inspect:</span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste any password..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-mono text-base focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Dynamic score summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-background border border-border/60">
            <span className="text-xs text-muted-foreground block">Overall Rating</span>
            <span className={`text-lg font-bold mt-1 block ${
              result.score >= 3 ? "text-emerald-500" : result.score === 2 ? "text-amber-500" : "text-rose-500"
            }`}>
              {result.label}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60">
            <span className="text-xs text-muted-foreground block">Information Entropy</span>
            <span className="text-lg font-bold mt-1 text-foreground block">
              {result.entropyBits} bits
            </span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/60">
            <span className="text-xs text-muted-foreground block">Estimated Crack Time</span>
            <span className="text-lg font-bold mt-1 text-foreground block">
              {result.crackTimeDisplay}
            </span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Security Recommendations</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {result.feedback.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. CRYPTO HASH GENERATOR (SHA-256, SHA-512, MD5, HMAC)
========================================================================= */
function HashGeneratorView({
  initialAlgo = "SHA-256",
  onCopy,
  copiedId,
}: {
  initialAlgo?: "SHA-256" | "SHA-512" | "SHA-384" | "SHA-1" | "MD5";
  onCopy: (t: string, id?: string) => void;
  copiedId: string | null;
}) {
  const [input, setInput] = useState("Hello WorkAbhi Security");
  const [algo, setAlgo] = useState(initialAlgo);
  const [hmacKey, setHmacKey] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    computeHash(input, algo, hmacKey).then((res) => {
      if (active) {
        setHashResult(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [input, algo, hmacKey]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Input Text:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Type text to hash..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Algorithm:</label>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
            >
              <option value="SHA-256">SHA-256 (Recommended / Standard)</option>
              <option value="SHA-512">SHA-512 (High Security 512-bit)</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-1">SHA-1 (Legacy / Git checksums)</option>
              <option value="MD5">MD5 (Checksums & Cache)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Optional HMAC Secret Key:</label>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Leave blank for standard hash..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono"
            />
          </div>
        </div>

        {/* Output */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground">
              {hmacKey ? `HMAC-${algo} Signature` : `${algo} Checksum`}:
            </span>
            <button
              onClick={() => onCopy(hashResult, "hash")}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              {copiedId === "hash" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === "hash" ? "Copied" : "Copy Hash"}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border font-mono text-sm break-all text-primary select-all">
            {loading ? "Computing..." : hashResult}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. FILE CHECKSUM VERIFIER
========================================================================= */
function FileChecksumView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [algo, setAlgo] = useState<"SHA-256" | "SHA-512" | "SHA-1" | "MD5">("SHA-256");
  const [calculatedHash, setCalculatedHash] = useState("");
  const [expectedHash, setExpectedHash] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (selected: File) => {
    setFile(selected);
    setLoading(true);
    try {
      const hash = await computeFileChecksum(selected, algo);
      setCalculatedHash(hash);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isMatch =
    calculatedHash && expectedHash.trim()
      ? calculatedHash.toLowerCase() === expectedHash.trim().toLowerCase()
      : null;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        {/* Dropzone */}
        <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="checksum-file-input"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />
          <label htmlFor="checksum-file-input" className="cursor-pointer flex flex-col items-center">
            <FileCheck className="w-10 h-10 text-primary mb-2" />
            <span className="text-sm font-semibold text-foreground">
              {file ? file.name : "Click to select or drop any file"}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "100% processed locally in your browser - zero upload"}
            </span>
          </label>
        </div>

        {file && (
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-foreground mb-1 block">Algorithm:</span>
              <div className="flex gap-2">
                {(["SHA-256", "SHA-512", "SHA-1", "MD5"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      setAlgo(a);
                      if (file) {
                        setLoading(true);
                        computeFileChecksum(file, a).then((h) => {
                          setCalculatedHash(h);
                          setLoading(false);
                        });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      algo === a ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">Calculated {algo} Checksum:</span>
                {calculatedHash && (
                  <button
                    onClick={() => onCopy(calculatedHash, "checksum")}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {copiedId === "checksum" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                )}
              </div>
              <div className="p-3 rounded-xl bg-background border border-border font-mono text-xs break-all select-all text-primary">
                {loading ? "Calculating cryptographic checksum..." : calculatedHash}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Compare Against Expected Checksum (Optional):
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected checksum to verify match..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>

            {isMatch !== null && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  isMatch
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {isMatch ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {isMatch
                  ? "Integrity Verified: Checksum matches expected hash exactly!"
                  : "Mismatch Detected: Calculated checksum does NOT match expected hash!"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   5. BASE64 ENCODER / DECODER
========================================================================= */
function Base64View({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello WorkAbhi!");
  const [urlSafe, setUrlSafe] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (tab === "encode") {
        setOutput(encodeBase64(input, urlSafe));
      } else {
        setOutput(decodeBase64(input));
      }
    } catch (e: any) {
      setError(e?.message || "Invalid Base64 sequence");
      setOutput("");
    }
  }, [input, tab, urlSafe]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => setTab("encode")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "encode" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            Encode to Base64
          </button>
          <button
            onClick={() => setTab("decode")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "decode" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            Decode from Base64
          </button>
        </div>

        {tab === "encode" && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="accent-primary rounded"
            />
            <span>URL-Safe Base64 (replace + and / with - and _)</span>
          </label>
        )}

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Input Text:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-sm"
          />
        </div>

        {error && <div className="text-xs text-destructive">{error}</div>}

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-foreground">Output:</span>
            {output && (
              <button
                onClick={() => onCopy(output, "base64")}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedId === "base64" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-primary font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. JWT TOKEN DECODER & INSPECTOR
========================================================================= */
function JwtDecoderView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFiaGkgV29yayIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.4S_z4n1nK-x4QyXqg"
  );
  const [decoded, setDecoded] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (!token.trim()) {
      setDecoded(null);
      return;
    }
    try {
      setDecoded(inspectJWT(token));
    } catch (e: any) {
      setError(e?.message || "Invalid JWT format");
      setDecoded(null);
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-1 block">Paste JWT Token:</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            placeholder="eyJhbGciOi..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-xs"
          />
        </div>

        {error && <div className="text-xs text-destructive">{error}</div>}

        {decoded && (
          <div className="space-y-4 pt-2">
            {/* Validity badge */}
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  decoded.validityStatus === "VALID"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : decoded.validityStatus === "EXPIRED"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {decoded.validityStatus}
              </span>
              {decoded.expiresAtFormatted && (
                <span className="text-xs text-muted-foreground">Expires: {decoded.expiresAtFormatted}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border">
                <span className="text-xs font-semibold text-rose-500 block mb-2">HEADER: ALGORITHM & TOKEN TYPE</span>
                <pre className="text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <span className="text-xs font-semibold text-indigo-500 block mb-2">PAYLOAD: DATA CLAIMS</span>
                <pre className="text-xs font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   7. RANDOM TOKEN & API KEY GENERATOR
========================================================================= */
function TokenGeneratorView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [type, setType] = useState<"hex" | "base64" | "uuid" | "alphanumeric" | "apikey">("apikey");
  const [count, setCount] = useState(5);
  const [tokens, setTokens] = useState<string[]>([]);

  const handleGenerate = () => {
    setTokens(generateCryptoTokens(type, count, 32));
  };

  useEffect(() => {
    handleGenerate();
  }, [type, count]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { id: "apikey", label: "API Key (sk_live_...)" },
                { id: "hex", label: "Hexadecimal (256-bit)" },
                { id: "uuid", label: "UUID v4" },
                { id: "base64", label: "URL-Safe Base64" },
                { id: "alphanumeric", label: "Alphanumeric" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  type === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>

        <div className="space-y-2 pt-2">
          {tokens.map((token, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60 text-xs font-mono"
            >
              <span className="text-foreground break-all select-all">{token}</span>
              <button
                onClick={() => onCopy(token, `token-${i}`)}
                className="ml-2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
              >
                {copiedId === `token-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   8. AES TEXT ENCRYPTOR & DECRYPTOR (AES-GCM 256-bit)
========================================================================= */
function AesEncryptorView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [text, setText] = useState("Confidential message for WorkAbhi users");
  const [password, setPassword] = useState("MySecretEncryptionKey@2026");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setError("");
    if (!text.trim() || !password.trim()) {
      setError("Please provide both text and a secret passphrase.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "encrypt") {
        const encrypted = await encryptTextAES(text, password);
        setResult(encrypted);
      } else {
        const decrypted = await decryptTextAES(text, password);
        setResult(decrypted);
      }
    } catch (e: any) {
      setError(e?.message || "Operation failed. Make sure your passphrase is correct.");
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div className="flex gap-2 border-b border-border pb-3">
          <button
            onClick={() => {
              setMode("encrypt");
              setResult("");
              setError("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              mode === "encrypt" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            AES-256 Encrypt
          </button>
          <button
            onClick={() => {
              setMode("decrypt");
              setResult("");
              setError("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              mode === "decrypt" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            AES-256 Decrypt
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">
            {mode === "encrypt" ? "Plaintext Message:" : "Encrypted Ciphertext (Base64):"}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Secret Passphrase (PBKDF2 Derived):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-mono"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {loading ? "Processing..." : mode === "encrypt" ? "Encrypt Text" : "Decrypt Text"}
        </button>

        {error && <div className="text-xs text-destructive">{error}</div>}

        {result && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground">Result:</span>
              <button
                onClick={() => onCopy(result, "aes")}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedId === "aes" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Result
              </button>
            </div>
            <textarea
              readOnly
              value={result}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-primary text-sm font-mono select-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   9. DICEWARE PASSPHRASE GENERATOR
========================================================================= */
function DicewareView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [passphrase, setPassphrase] = useState("");

  const handleGenerate = () => {
    setPassphrase(generateDicewarePassphrase(wordCount, separator, capitalize));
  };

  useEffect(() => {
    handleGenerate();
  }, [wordCount, separator, capitalize]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-primary/25 bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-mono text-xl sm:text-2xl font-bold text-primary select-all break-all">
            {passphrase}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopy(passphrase, "diceware")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              {copiedId === "diceware" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </button>
            <button
              onClick={handleGenerate}
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Number of Words: {wordCount}</label>
            <input
              type="range"
              min="3"
              max="8"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Word Separator:</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Period (.)</option>
              <option value=" ">Space ( )</option>
            </select>
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(e) => setCapitalize(e.target.checked)}
                className="accent-primary rounded"
              />
              <span>Capitalize Each Word</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   10. URL ENCODER / DECODER
========================================================================= */
function UrlEncoderView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [input, setInput] = useState("https://workabhi.com/search?query=hello world & security=100%");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");

  useEffect(() => {
    try {
      setEncoded(encodeURIComponent(input));
      setDecoded(decodeURIComponent(input));
    } catch {
      // ignore
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Input URL or Text:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-sm"
          />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-semibold text-foreground">
              <span>Encoded URL:</span>
              <button onClick={() => onCopy(encoded, "url-enc")} className="text-primary hover:underline">
                {copiedId === "url-enc" ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              readOnly
              value={encoded}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-primary font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-semibold text-foreground">
              <span>Decoded URL:</span>
              <button onClick={() => onCopy(decoded, "url-dec")} className="text-primary hover:underline">
                {copiedId === "url-dec" ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              readOnly
              value={decoded}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-primary font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   11. HTML ENTITY ENCODER (XSS SANITIZER)
========================================================================= */
function HtmlEntityView({ onCopy, copiedId }: { onCopy: (t: string, id?: string) => void; copiedId: string | null }) {
  const [input, setInput] = useState('<script>alert("XSS Protected & Safe!")</script>');
  const [escaped, setEscaped] = useState("");

  useEffect(() => {
    setEscaped(escapeHtml(input));
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Input HTML / Text:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1 font-semibold text-foreground">
            <span>Escaped HTML Entities (Safe against XSS injection):</span>
            <button onClick={() => onCopy(escaped, "html")} className="text-primary hover:underline">
              {copiedId === "html" ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={escaped}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-primary font-mono text-xs select-all"
          />
        </div>
      </div>
    </div>
  );
}
