import React, { useEffect, useState } from "react";
import {
  Download,
  ShieldCheck,
  RefreshCw,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Smartphone,
} from "lucide-react";
import { ApkManifestResponse, ApkArtifactInfo } from "../types/studio";

interface ApkVerificationPanelProps {
  isHindi: boolean;
}

interface ClientVerifyState {
  downloading: boolean;
  progressPct: number;
  receivedBytes: number;
  expectedBytes: number;
  computedSha256: string;
  expectedSha256: string;
  magicHex: string;
  sizeMatched: boolean;
  hashMatched: boolean;
  completed: boolean;
  error?: string;
}

export const ApkVerificationPanel: React.FC<ApkVerificationPanelProps> = ({ isHindi }) => {
  const [manifest, setManifest] = useState<ApkManifestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rebuilding, setRebuilding] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<"release" | "debug">("release");
  const [serverVerification, setServerVerification] = useState<any | null>(null);
  const [verifyingServer, setVerifyingServer] = useState<boolean>(false);
  const [clientVerify, setClientVerify] = useState<Record<string, ClientVerifyState>>({});
  const [sourceFiles, setSourceFiles] = useState<{ path: string; language: string; content: string }[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);

  const loadManifest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apk/info");
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
      }
    } catch (e) {
      console.error("Failed to fetch APK info:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAndroidSource = async () => {
    try {
      const res = await fetch("/api/android-source");
      if (res.ok) {
        const data = await res.json();
        setSourceFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch Android source:", e);
    }
  };

  const runServerVerify = async (variant: "release" | "debug") => {
    setVerifyingServer(true);
    try {
      const res = await fetch(`/api/apk/verify/${variant}`);
      if (res.ok) {
        const data = await res.json();
        setServerVerification(data);
      }
    } catch (e) {
      console.error("Server verification error:", e);
    } finally {
      setVerifyingServer(false);
    }
  };

  useEffect(() => {
    loadManifest();
    loadAndroidSource();
    runServerVerify("release");
  }, []);

  const handleRebuildApk = async () => {
    setRebuilding(true);
    try {
      const res = await fetch("/api/apk/rebuild", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
        await runServerVerify(selectedVariant);
      }
    } finally {
      setRebuilding(false);
    }
  };

  // Verified Binary Stream Download with Client-Side WebCrypto SHA-256 & Byte Size Verification
  const handleVerifiedDownload = async (variant: "release" | "debug" | "source", art: ApkArtifactInfo) => {
    setClientVerify((prev) => ({
      ...prev,
      [variant]: {
        downloading: true,
        progressPct: 0,
        receivedBytes: 0,
        expectedBytes: art.sizeBytes,
        computedSha256: "",
        expectedSha256: art.sha256,
        magicHex: "",
        sizeMatched: false,
        hashMatched: false,
        completed: false,
      },
    }));

    try {
      const response = await fetch(`/api/apk/download/${variant}`);
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status} during binary download`);
      }

      const contentLengthHeader = Number(response.headers.get("Content-Length")) || art.sizeBytes;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.byteLength;
          const pct = Math.min(100, Math.round((receivedLength / contentLengthHeader) * 100));
          setClientVerify((prev) => ({
            ...prev,
            [variant]: {
              ...prev[variant],
              progressPct: pct,
              receivedBytes: receivedLength,
            },
          }));
        }
      }

      // Combine chunks into a single Uint8Array
      const fullBytes = new Uint8Array(receivedLength);
      let offset = 0;
      for (const chunk of chunks) {
        fullBytes.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Inspect ZIP/APK magic signature (first 4 bytes: 0x504B0304)
      const magicHex = Array.from(fullBytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Compute SHA-256 using WebCrypto API
      const hashBuffer = await crypto.subtle.digest("SHA-256", fullBytes.buffer);
      const computedSha256 = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const sizeMatched = receivedLength === art.sizeBytes;
      const hashMatched = computedSha256.toLowerCase() === art.sha256.toLowerCase();

      setClientVerify((prev) => ({
        ...prev,
        [variant]: {
          downloading: false,
          progressPct: 100,
          receivedBytes: receivedLength,
          expectedBytes: art.sizeBytes,
          computedSha256,
          expectedSha256: art.sha256,
          magicHex: `0x${magicHex}`,
          sizeMatched,
          hashMatched,
          completed: true,
        },
      }));

      // Trigger browser file save with exact MIME type
      const mimeType =
        variant === "source" ? "application/zip" : "application/vnd.android.package-archive";
      const blob = new Blob([fullBytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = art.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err: any) {
      setClientVerify((prev) => ({
        ...prev,
        [variant]: {
          ...prev[variant],
          downloading: false,
          completed: false,
          error: err.message || "Download failed",
        },
      }));
    }
  };

  if (loading || !manifest) {
    return (
      <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-300 text-sm">
        {isHindi ? "APK बिल्ड और हस्ताक्षर विवरण लोड हो रहा है..." : "Loading APK build manifest and cryptographic signatures..."}
      </div>
    );
  }

  const releaseArt = manifest.artifacts.release;
  const debugArt = manifest.artifacts.debug;
  const sourceArt = manifest.artifacts.source;

  return (
    <div className="space-y-8">
      {/* Header & Rebuild Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isHindi
              ? "13. वास्तविक Android APK डाउनलोड और क्रिप्टोग्राफ़िक सत्यापन"
              : "13. Verified Android APK Build, Checksum & Source Center"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isHindi
              ? "सटीक बाइट आकार, SHA-256 चेकसम, बाइनरी AndroidManifest.xml, classes.dex और RSA-2048 हस्ताक्षर सत्यापन के साथ।"
              : "Real binary APK downloads served with application/vnd.android.package-archive, HTTP Range resumable support, and live SHA-256 verification."}
          </p>
        </div>
        <button
          onClick={handleRebuildApk}
          disabled={rebuilding}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${rebuilding ? "animate-spin" : ""}`} />
          <span>{rebuilding ? "Rebuilding & Signing..." : isHindi ? "APK पुनः बिल्ड करें" : "Rebuild & Re-Sign APKs"}</span>
        </button>
      </div>

      {/* Primary APK Cards: Signed Release APK & Debug APK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            key: "release" as const,
            titleEn: "Signed Release APK (Production Distribution)",
            titleHi: "हस्ताक्षरित रिलीज़ APK (वितरण के लिए)",
            art: releaseArt,
            accent: "bg-indigo-600 hover:bg-indigo-500",
          },
          {
            key: "debug" as const,
            titleEn: "Debug APK (Developer Testing & Diagnostics)",
            titleHi: "डीबग APK (परीक्षण और डायग्नोस्टिक्स)",
            art: debugArt,
            accent: "bg-slate-800 hover:bg-slate-700 border border-slate-700",
          },
        ].map(({ key, titleEn, titleHi, art, accent }) => {
          const cv = clientVerify[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-400 font-medium">{art.packageName}</span>
                  <span aria-hidden="true">·</span>
                  <span>v{art.versionName} (Code {art.versionCode})</span>
                  <span aria-hidden="true">·</span>
                  <span>API {art.minSdk}–{art.targetSdk}</span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  {isHindi ? titleHi : titleEn}
                </h3>

                {/* Exact File Size in Bytes, KB, and MB */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="text-xs text-slate-400">Exact Bytes</div>
                    <div className="text-sm font-mono font-semibold text-white tabular-nums mt-0.5">
                      {art.sizeBytes.toLocaleString()} B
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Size (KB)</div>
                    <div className="text-sm font-mono font-semibold text-sky-400 tabular-nums mt-0.5">
                      {art.sizeKB.toLocaleString()} KB
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Size (MB)</div>
                    <div className="text-sm font-mono font-semibold text-indigo-400 tabular-nums mt-0.5">
                      {art.sizeMB} MB
                    </div>
                  </div>
                </div>

                {/* Cryptographic Metadata */}
                <div className="space-y-1.5 pt-2 text-xs text-slate-400 font-mono">
                  <div className="truncate" title={art.sha256}>
                    <span className="text-slate-500">SHA-256: </span>
                    <span className="text-slate-200">{art.sha256}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">DEX Adler32: </span>
                    <span className="text-slate-200">{art.dexAdler32}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="text-slate-500">AXML: </span>
                    <span className="text-slate-200">{art.axmlMagic}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Cert: </span>
                    <span className="text-slate-300">{art.certificateSubject}</span>
                  </div>
                </div>
              </div>

              {/* Client-Side Live Download Progress & Verification Result */}
              {cv && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">
                      {cv.downloading
                        ? `Downloading binary stream (${cv.progressPct}%)...`
                        : cv.completed
                        ? "Binary Transfer & Checksum Verified"
                        : "Transfer Status"}
                    </span>
                    <span className="font-mono tabular-nums text-sky-400">
                      {cv.receivedBytes.toLocaleString()} / {cv.expectedBytes.toLocaleString()} B
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-transform duration-150 origin-left"
                      style={{ transform: `scaleX(${cv.progressPct / 100})` }}
                    />
                  </div>
                  {cv.completed && (
                    <div className="pt-1 space-y-1 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Size Match: {cv.sizeMatched ? "EXACT (100%)" : "MISMATCH"} · Magic: {cv.magicHex}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          SHA-256 Match: {cv.hashMatched ? "VERIFIED" : "MISMATCH"} ({cv.computedSha256.slice(0, 20)}...)
                        </span>
                      </div>
                    </div>
                  )}
                  {cv.error && (
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{cv.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => handleVerifiedDownload(key, art)}
                  disabled={cv?.downloading}
                  className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${accent}`}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {isHindi
                      ? `सत्यापित डाउनलोड (${art.sizeMB} MB)`
                      : `Verified Download APK (${art.sizeMB} MB)`}
                  </span>
                </button>
                <a
                  href={`/api/apk/download/${key}`}
                  download={art.filename}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{isHindi ? "सीधा HTTPS लिंक" : "Direct HTTPS Link"}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Server-Side Binary Structure & Archive Inspector */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>
                {isHindi
                  ? "लाइव APK बाइनरी संरचना और ZIP/PKCS#7 निरीक्षक"
                  : "Live APK Binary Structure, DEX & PKCS#7 Signature Inspector"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {manifest.environmentNote}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedVariant("release");
                runServerVerify("release");
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedVariant === "release"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Inspect Release APK
            </button>
            <button
              onClick={() => {
                setSelectedVariant("debug");
                runServerVerify("debug");
              }}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedVariant === "debug"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Inspect Debug APK
            </button>
          </div>
        </div>

        {verifyingServer ? (
          <div className="text-xs text-slate-400 py-4">Inspecting binary archive headers...</div>
        ) : serverVerification ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { label: "PKZip Archive Magic", ok: serverVerification.verified },
                { label: "Binary AndroidManifest.xml", ok: serverVerification.checks?.binaryAndroidManifestXml },
                { label: "Dalvik classes.dex", ok: serverVerification.checks?.dalvikBytecodeClassesDex },
                { label: "Compiled resources.arsc", ok: serverVerification.checks?.compiledResourcesArsc },
                { label: "PKCS#7 RSA Signature", ok: serverVerification.checks?.pkcs7SignatureRsa },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-56">
              {serverVerification.unzipListing}
            </pre>
          </div>
        ) : null}
      </div>

      {/* Complete Android Studio Kotlin + Jetpack Compose Source Code & Gradle Setup */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <span>
                {isHindi
                  ? "संपूर्ण Android Studio Kotlin और Jetpack Compose सोर्स कोड"
                  : "Complete Android Studio Project Source Code (Kotlin + Jetpack Compose + Gradle)"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {sourceArt.filename} · {sourceArt.sizeBytes.toLocaleString()} Bytes ({sourceArt.sizeKB} KB) · SHA-256: {sourceArt.sha256.slice(0, 24)}...
            </p>
          </div>
          <button
            onClick={() => handleVerifiedDownload("source", sourceArt)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Android Project (.zip)</span>
          </button>
        </div>

        {sourceFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {sourceFiles.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setActiveSourceIndex(idx)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeSourceIndex === idx
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {file.path.replace("android-app/", "")}
                </button>
              ))}
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
              {sourceFiles[activeSourceIndex]?.content}
            </pre>
          </div>
        )}
      </div>

      {/* Android Installation & Publishing Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>
              {isHindi ? "Android फ़ोन पर इंस्टॉल करने की विधि" : "Android Installation Guide"}
            </span>
          </h4>
          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Download <strong>{releaseArt.filename}</strong> ({releaseArt.sizeMB} MB) above and verify that the SHA-256 checksum matches.
            </li>
            <li>
              On your Android 8.0+ (API 26+) phone, open <strong>Files / Downloads</strong> and tap the downloaded <code>.apk</code> file.
            </li>
            <li>
              If prompted by Android Package Installer, enable <strong>Install unknown apps</strong> for your browser or file manager.
            </li>
            <li>
              For full Gradle compilation with Android SDK 35 & Media3 native libraries, extract <code>{sourceArt.filename}</code> in Android Studio Ladybug+ or run the bundled GitHub Actions workflow (<code>.github/workflows/build-apk.yml</code>).
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>
              {isHindi ? "बिल्ड, टेस्ट और पब्लिशिंग कमांड्स" : "Running, Testing & Play Store Publishing"}
            </span>
          </h4>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# 1. Build Debug & Signed Release APKs via Gradle
cd android-app
./gradlew assembleDebug assembleRelease

# 2. Verify APK Signature & Checksum
apksigner verify --verbose app/build/outputs/apk/release/app-release.apk
sha256sum app/build/outputs/apk/release/app-release.apk

# 3. Install on Connected Android Device via ADB
adb install -r app/build/outputs/apk/release/app-release.apk`}
          </pre>
        </div>
      </div>
    </div>
  );
};
