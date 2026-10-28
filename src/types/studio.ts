export type ScreenId =
  | "splash"
  | "auth"
  | "home"
  | "create-long"
  | "create-short"
  | "upload-video"
  | "face-studio"
  | "voice-studio"
  | "timeline"
  | "progress"
  | "preview-export"
  | "projects"
  | "apk-info"
  | "settings";

export interface ScreenMeta {
  id: ScreenId;
  number: number;
  labelEn: string;
  labelHi: string;
  shortEn: string;
  shortHi: string;
}

export const ALL_SCREENS: ScreenMeta[] = [
  { id: "splash", number: 1, labelEn: "Splash & Launch", labelHi: "आरंभ स्क्रीन", shortEn: "Splash", shortHi: "आरंभ" },
  { id: "auth", number: 2, labelEn: "Login & Guest Mode", labelHi: "लॉगिन और गेस्ट मोड", shortEn: "Account", shortHi: "खाता" },
  { id: "home", number: 3, labelEn: "Home Dashboard", labelHi: "होम डैशबोर्ड", shortEn: "Home", shortHi: "होम" },
  { id: "create-long", number: 4, labelEn: "Create Long Video", labelHi: "लॉन्ग वीडियो बनाएं", shortEn: "Long Video", shortHi: "लॉन्ग" },
  { id: "create-short", number: 5, labelEn: "Create Short Video", labelHi: "शॉर्ट वीडियो बनाएं", shortEn: "Short Reel", shortHi: "शॉर्ट" },
  { id: "upload-video", number: 6, labelEn: "Upload Original Video", labelHi: "ओरिजिनल वीडियो अपलोड", shortEn: "Upload", shortHi: "अपलोड" },
  { id: "face-studio", number: 7, labelEn: "Select Face & Character", labelHi: "फेस और कैरेक्टर बदलें", shortEn: "Face Swap", shortHi: "फेस" },
  { id: "voice-studio", number: 8, labelEn: "Record or Upload Voice", labelHi: "आवाज़ और वॉइस स्टूडियो", shortEn: "AI Voice", shortHi: "आवाज़" },
  { id: "timeline", number: 9, labelEn: "Video Editing Timeline", labelHi: "वीडियो एडिटिंग टाइमलाइन", shortEn: "Timeline", shortHi: "टाइमलाइन" },
  { id: "progress", number: 10, labelEn: "Generation Progress", labelHi: "प्रोसेसिंग स्थिति", shortEn: "Progress", shortHi: "प्रोग्रेस" },
  { id: "preview-export", number: 11, labelEn: "Preview & Export MP4", labelHi: "प्रीव्यू और एक्सपोर्ट", shortEn: "Export", shortHi: "एक्सपोर्ट" },
  { id: "projects", number: 12, labelEn: "My Projects & Downloads", labelHi: "मेरे प्रोजेक्ट्स और डाउनलोड", shortEn: "Projects", shortHi: "प्रोजेक्ट्स" },
  { id: "apk-info", number: 13, labelEn: "Download APK & Build Info", labelHi: "APK डाउनलोड और बिल्ड", shortEn: "Get APK", shortHi: "APK" },
  { id: "settings", number: 14, labelEn: "Settings, Consent & Help", labelHi: "सेटिंग्स, सहमति और सहायता", shortEn: "Settings", shortHi: "सेटिंग्स" },
];

export interface SceneSegment {
  id: string;
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  narrationText: string;
  durationSec: number;
  cameraMovement: string;
  audioUrl?: string;
}

export interface VideoJob {
  id: string;
  title: string;
  mode: "short" | "long" | "face-swap" | "edit";
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  currentStep: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  resolution: "720p" | "1080p";
  language: "en" | "hi";
  prompt: string;
  scenes: SceneSegment[];
  faceConfig: {
    enabled: boolean;
    sourceType: "preset" | "upload";
    presetId: string;
    customFacePath?: string;
    alignmentScore: number;
    blendStrength: number;
    lightingMatch: number;
    consentVerified: boolean;
  };
  voiceConfig: {
    voiceName: "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";
    consentVerified: boolean;
    lipSyncEnabled: boolean;
    subtitlesEnabled: boolean;
    voiceVolume: number;
    bgMusicVolume: number;
    bgMusicStyle: string;
    combinedAudioUrl?: string;
  };
  editConfig: {
    trimStart: number;
    trimEnd: number;
    speed: number;
    colorFilter: "none" | "cinematic" | "neon" | "vintage" | "bw";
    aiWatermarkLabel: boolean;
  };
  engineUsed: string;
  outputVideoUrl?: string;
  outputSizeBytes?: number;
  durationSec: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ApkArtifactInfo {
  variant: string;
  filename: string;
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  minSdk?: number;
  targetSdk?: number;
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  sha256: string;
  md5?: string;
  dexHeaderMagic?: string;
  dexAdler32?: string;
  axmlMagic?: string;
  signatureScheme?: string;
  certificateSubject?: string;
  entryCount?: number;
  builtAt: string;
}

export interface ApkManifestResponse {
  appName: string;
  buildEngine: string;
  environmentNote: string;
  artifacts: {
    debug: ApkArtifactInfo;
    release: ApkArtifactInfo;
    source: ApkArtifactInfo;
  };
}

export const ASSETS = {
  logo: "/src/assets/images/rajdev_ai_logo_1793227153501.jpg",
  studioHero: "/src/assets/images/studio_hero_preview_1793227155307.jpg",
  avatarArjun: "/src/assets/images/character_avatar_arjun_1793227156333.jpg",
  avatarPriya: "/src/assets/images/character_avatar_priya_1793227156866.jpg",
};
