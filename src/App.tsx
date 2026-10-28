import React, { useEffect, useRef, useState } from "react";
import {
  Film,
  Sparkles,
  Upload,
  UserCheck,
  Mic,
  Sliders,
  Play,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Shield,
  Volume2,
  Plus,
  Square,
  RotateCcw,
  FolderOpen,
  Settings,
  Home,
  LogIn,
  ChevronRight,
} from "lucide-react";
import {
  ALL_SCREENS,
  ASSETS,
  SceneSegment,
  ScreenId,
  VideoJob,
} from "./types/studio";
import { FaceAlignmentCanvas } from "./components/FaceAlignmentCanvas";
import { ApkVerificationPanel } from "./components/ApkVerificationPanel";

export default function App() {
  // Active screen state across all 14 required screens
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");
  const [isHindi, setIsHindi] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<{
    mode: "guest" | "authenticated";
    name: string;
    email?: string;
  }>({
    mode: "guest",
    name: "Guest Creator",
  });

  // Studio Creation & Editing State
  const [projectTitle, setProjectTitle] = useState<string>(
    "Mumbai Cyber Studio — AI Cinema Story"
  );
  const [videoMode, setVideoMode] = useState<"short" | "long">("short");
  const [promptText, setPromptText] = useState<string>(
    "A young Indian filmmaker directing a sci-fi scene in a modern Mumbai studio at twilight, natural expressions and warm cinematic lighting"
  );
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");
  const [scenes, setScenes] = useState<SceneSegment[]>([
    {
      id: "sc_init_1",
      sceneNumber: 1,
      title: "Opening Studio Frame",
      visualPrompt:
        "Filmmaker standing in Mumbai studio at twilight with warm tungsten key lighting",
      narrationText:
        "Welcome to Rajdev AI. Create long and short videos with consistent face identity and synchronized voice.",
      durationSec: 5,
      cameraMovement: "Slow Push-In",
      audioUrl: "/media/sample_voice_kore.wav",
    },
    {
      id: "sc_init_2",
      sceneNumber: 2,
      title: "Close-Up Character Cut",
      visualPrompt:
        "Close-up portrait shot with preserved natural facial expressions and studio rim lighting",
      narrationText:
        "Every scene maintains the same voice tone, pitch, and facial alignment across cuts.",
      durationSec: 5,
      cameraMovement: "Dynamic Pan",
      audioUrl: "/media/sample_voice_kore.wav",
    },
  ]);

  // Face Replacement Studio State (Screen 7)
  const [faceEnabled, setFaceEnabled] = useState<boolean>(true);
  const [facePresetId, setFacePresetId] = useState<"arjun" | "priya">("arjun");
  const [customFaceDataUrl, setCustomFaceDataUrl] = useState<string | null>(null);
  const [customFaceServerPath, setCustomFaceServerPath] = useState<string | undefined>(undefined);
  const [alignmentScore, setAlignmentScore] = useState<number>(98);
  const [blendStrength, setBlendStrength] = useState<number>(88);
  const [lightingMatch, setLightingMatch] = useState<number>(92);
  const [showFaceMesh, setShowFaceMesh] = useState<boolean>(true);
  const [faceConsentVerified, setFaceConsentVerified] = useState<boolean>(true);

  // Voice Studio State (Screen 8)
  const [selectedVoice, setSelectedVoice] = useState<
    "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr"
  >("Kore");
  const [voiceConsentVerified, setVoiceConsentVerified] = useState<boolean>(true);
  const [lipSyncEnabled, setLipSyncEnabled] = useState<boolean>(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [voiceVolume, setVoiceVolume] = useState<number>(95);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(25);
  const [bgMusicStyle, setBgMusicStyle] = useState<string>("Cinematic Pulse");
  const [combinedVoiceUrl, setCombinedVoiceUrl] = useState<string>(
    "/media/sample_voice_kore.wav"
  );
  const [voiceModelStatus, setVoiceModelStatus] = useState<string>("");
  const [synthesizingVoice, setSynthesizingVoice] = useState<boolean>(false);

  // Live Microphone Recording & Transcription State
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [transcriptResult, setTranscriptResult] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Video Editing Timeline State (Screen 9)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [colorFilter, setColorFilter] = useState<
    "none" | "cinematic" | "neon" | "vintage" | "bw"
  >("cinematic");
  const [aiWatermarkLabel, setAiWatermarkLabel] = useState<boolean>(true);

  // Uploaded Source Video State (Screen 6)
  const [uploadedSourceVideoUrl, setUploadedSourceVideoUrl] = useState<string>(
    "/media/sample_original_studio.mp4"
  );
  const [uploadedMediaList, setUploadedMediaList] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Jobs & Projects Queue State (Screens 10, 11, 12)
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>("job_sample_short_01");
  const [generatingScript, setGeneratingScript] = useState<boolean>(false);
  const [submittingJob, setSubmittingJob] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Auth form state (Screen 2)
  const [loginName, setLoginName] = useState<string>("Rajdev Creator");
  const [loginEmail, setLoginEmail] = useState<string>("creator@rajdev.ai");

  // Device capability check
  const [deviceCapabilities, setDeviceCapabilities] = useState<{
    cores: number;
    memoryGb: number;
    webgl2: boolean;
    localInferenceReady: boolean;
  }>({
    cores: 8,
    memoryGb: 8,
    webgl2: true,
    localInferenceReady: true,
  });

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memoryGb = (navigator as any).deviceMemory || 4;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setDeviceCapabilities({
      cores,
      memoryGb,
      webgl2: !!gl,
      localInferenceReady: cores >= 4 && !!gl,
    });
    fetchJobs();
    fetchUploads();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data: VideoJob[] = await res.json();
        setJobs(data);
        if (data.length > 0 && !activeJobId) {
          setActiveJobId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/media/uploads");
      if (res.ok) {
        setUploadedMediaList(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch uploads:", e);
    }
  };

  // Poll active job when in progress or queued
  useEffect(() => {
    const currentJob = jobs.find((j) => j.id === activeJobId);
    if (
      activeScreen === "progress" ||
      (currentJob && (currentJob.status === "queued" || currentJob.status === "processing"))
    ) {
      const timer = setInterval(fetchJobs, 1200);
      return () => clearInterval(timer);
    }
  }, [activeScreen, activeJobId, jobs]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  // Generate AI Multi-Scene Script via Backend (`gemini-3.8-flash`)
  const handleGenerateAiScript = async (targetMode: "short" | "long") => {
    setGeneratingScript(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          mode: targetMode,
          language: isHindi ? "hi" : "en",
          sceneCount: targetMode === "short" ? 2 : 4,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.scenes)) {
        setScenes(data.scenes);
        const totalDur = data.scenes.reduce(
          (acc: number, s: SceneSegment) => acc + (s.durationSec || 5),
          0
        );
        setTrimEnd(totalDur);
        setStatusBanner(
          `Generated ${data.scenes.length} scenes using ${data.modelUsed}`
        );
      } else {
        setStatusBanner(data.error || "Could not generate script.");
      }
    } catch (err: any) {
      setStatusBanner(err.message || "Network error generating script.");
    } finally {
      setGeneratingScript(false);
    }
  };

  // Synthesize Consistent AI Voice Across Scenes (`gemini-3.8-flash-lite-tts`)
  const handleSynthesizeConsistentVoice = async () => {
    if (!voiceConsentVerified) {
      setStatusBanner(
        isHindi
          ? "कृपया आवाज़ जनरेट करने से पहले स्पीकर सहमति बॉक्स को चुनें।"
          : "Please confirm speaker consent before generating voice audio."
      );
      return;
    }
    setSynthesizingVoice(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: scenes,
          voiceName: selectedVoice,
          language: isHindi ? "hi" : "en",
          consentVerified: voiceConsentVerified,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.segments)) {
          setScenes(data.segments);
        }
        if (data.combinedAudioUrl) {
          setCombinedVoiceUrl(data.combinedAudioUrl);
        }
        setVoiceModelStatus(data.modelUsed);
        setStatusBanner(
          `Synthesized consistent ${selectedVoice} voice across ${scenes.length} scene(s) via ${data.modelUsed}`
        );
      } else {
        setStatusBanner(data.error || "Voice generation error.");
      }
    } catch (err: any) {
      setStatusBanner(err.message || "Failed to synthesize voice.");
    } finally {
      setSynthesizingVoice(false);
    }
  };

  // Start / Stop Live Microphone Voice Recording
  const handleToggleMicRecording = async () => {
    if (isRecordingMic) {
      mediaRecorderRef.current?.stop();
      setIsRecordingMic(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());

        // Transcribe using Gemini 3.5 Transcribe
        setTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const res = await fetch("/api/ai/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: "audio/webm",
                language: isHindi ? "hi" : "en",
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              setTranscriptResult(data.transcript);
            }
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingMic(true);
    } catch (err: any) {
      setStatusBanner(
        "Microphone access was not granted in this browser frame. You can upload an audio file instead."
      );
    }
  };

  // Upload Video, Face Image, or Voice Sample File
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "video" | "face" | "voice"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setStatusBanner(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (category === "face") {
        setCustomFaceDataUrl(base64);
      }
      try {
        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            dataBase64: base64,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          if (category === "video") {
            setUploadedSourceVideoUrl(data.url);
          } else if (category === "face") {
            setCustomFaceServerPath(data.path);
          } else if (category === "voice") {
            setRecordedAudioUrl(data.url);
          }
          await fetchUploads();
          setStatusBanner(`Uploaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        }
      } catch (err: any) {
        setStatusBanner(err.message || "File upload failed.");
      } finally {
        setUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Full Video Render Job (`POST /api/jobs/create`)
  const handleStartVideoRender = async (overrideMode?: "short" | "long") => {
    if (faceEnabled && !faceConsentVerified) {
      setStatusBanner(
        isHindi
          ? "फेस रिप्लेसमेंट शुरू करने से पहले सहमति की पुष्टि करना आवश्यक है।"
          : "Explicit consent confirmation is required before rendering with face replacement."
      );
      setActiveScreen("face-studio");
      return;
    }

    setSubmittingJob(true);
    setStatusBanner(null);
    const modeToUse = overrideMode || videoMode;
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          mode: modeToUse,
          aspectRatio,
          resolution,
          language: isHindi ? "hi" : "en",
          prompt: promptText,
          scenes,
          faceConfig: {
            enabled: faceEnabled,
            sourceType: customFaceServerPath ? "upload" : "preset",
            presetId: facePresetId,
            customFacePath: customFaceServerPath,
            alignmentScore,
            blendStrength,
            lightingMatch,
            consentVerified: faceConsentVerified,
          },
          voiceConfig: {
            voiceName: selectedVoice,
            consentVerified: voiceConsentVerified,
            lipSyncEnabled,
            subtitlesEnabled,
            voiceVolume,
            bgMusicVolume,
            bgMusicStyle,
          },
          editConfig: {
            trimStart,
            trimEnd,
            speed: playbackSpeed,
            colorFilter,
            aiWatermarkLabel,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchJobs();
        setActiveJobId(data.id);
        setActiveScreen("progress");
      } else {
        setStatusBanner(data.error || "Could not start render job.");
      }
    } catch (err: any) {
      setStatusBanner(err.message || "Network error starting render job.");
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleCancelJob = async (id: string) => {
    await fetch(`/api/jobs/${id}/cancel`, { method: "POST" });
    fetchJobs();
  };

  const handleRetryJob = async (id: string) => {
    await fetch(`/api/jobs/${id}/retry`, { method: "POST" });
    fetchJobs();
  };

  const handleDeleteJob = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    await fetchJobs();
  };

  const handleDeleteUploadedMedia = async (id: string) => {
    await fetch(`/api/media/uploads/${id}`, { method: "DELETE" });
    await fetchUploads();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col pb-20 lg:pb-8">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveScreen("home");
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Rajdev AI
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen("home");
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeScreen === "home" ? "text-white underline underline-offset-8 decoration-indigo-500" : ""
            }`}
          >
            {isHindi ? "होम स्टूडियो" : "Home Studio"}
          </a>
          <a
            href="#create-short"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen("create-short");
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeScreen === "create-short" || activeScreen === "create-long"
                ? "text-white underline underline-offset-8 decoration-indigo-500"
                : ""
            }`}
          >
            {isHindi ? "वीडियो बनाएं" : "Create Video"}
          </a>
          <a
            href="#face-studio"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen("face-studio");
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeScreen === "face-studio" || activeScreen === "voice-studio"
                ? "text-white underline underline-offset-8 decoration-indigo-500"
                : ""
            }`}
          >
            {isHindi ? "फेस और वॉइस" : "Face & Voice"}
          </a>
          <a
            href="#timeline"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen("timeline");
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeScreen === "timeline" || activeScreen === "projects"
                ? "text-white underline underline-offset-8 decoration-indigo-500"
                : ""
            }`}
          >
            {isHindi ? "टाइमलाइन और प्रोजेक्ट्स" : "Timeline & Projects"}
          </a>
          <a
            href="#apk-info"
            onClick={(e) => {
              e.preventDefault();
              setActiveScreen("apk-info");
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeScreen === "apk-info"
                ? "text-white underline underline-offset-8 decoration-indigo-500"
                : ""
            }`}
          >
            {isHindi ? "APK और सोर्स" : "APK & Source"}
          </a>
        </nav>

        {/* Zone 3: 1 primary action CTA */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveScreen("apk-info")}
            className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isHindi ? "APK डाउनलोड करें" : "Download APK"}
          </button>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-6 flex-1">
        {/* Workspace Toolbar: 14-Screen Navigator & Bilingual Toggle */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#0f1420] p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {ALL_SCREENS.map((scr) => {
              const active = activeScreen === scr.id;
              return (
                <button
                  key={scr.id}
                  onClick={() => setActiveScreen(scr.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  {scr.number}. {isHindi ? scr.shortHi : scr.shortEn}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 border-t lg:border-t-0 border-slate-800 pt-2 lg:pt-0">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {userSession.mode === "guest"
                ? isHindi
                  ? "मोड: निःशुल्क गेस्ट"
                  : "Mode: Free Guest"
                : userSession.name}
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setIsHindi(false)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  !isHindi ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setIsHindi(true)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  isHindi ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Status Feedback Banner */}
        {statusBanner && (
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-4 py-3 text-xs text-indigo-200 flex items-center justify-between gap-4">
            <span>{statusBanner}</span>
            <button
              onClick={() => setStatusBanner(null)}
              className="text-indigo-300 hover:text-white font-medium whitespace-nowrap cursor-pointer"
            >
              {isHindi ? "बंद करें" : "Dismiss"}
            </button>
          </div>
        )}

        {/* =====================================================================
            SCREEN 1: SPLASH SCREEN WITH RAJDEV AI LOGO
           ===================================================================== */}
        {activeScreen === "splash" && (
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#0f1420] to-[#07090e] p-8 sm:p-14 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden border border-indigo-500/40 shadow-xl shadow-indigo-950/50 bg-slate-900">
              <img
                src={ASSETS.logo}
                alt="Rajdev AI Official Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="text-xs text-sky-400 font-medium">
                {isHindi
                  ? "एंड्रॉइड एआई वीडियो और फेस रिप्लेसमेंट स्टूडियो · संस्करण 1.4.0"
                  : "Android AI Video & Face Replacement Studio · Release v1.4.0"}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
                Rajdev AI
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                {isHindi
                  ? "यथार्थवादी फेस रिप्लेसमेंट, कैरेक्टर ट्रांसफॉर्मेशन और एक समान एआई आवाज़ के साथ शॉर्ट और लॉन्ग वीडियो बनाएं।"
                  : "Create AI-powered long videos and vertical short reels with realistic face replacement, character continuity, and consistent voice synthesis in Hindi and English."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveScreen("home")}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {isHindi ? "स्टूडियो में प्रवेश करें" : "Enter Rajdev AI Studio"}
              </button>
              <button
                onClick={() => setActiveScreen("auth")}
                className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {isHindi ? "लॉगिन या गेस्ट मोड" : "Login / Guest Options"}
              </button>
              <button
                onClick={() => setActiveScreen("apk-info")}
                className="min-h-[48px] px-6 py-3 rounded-xl border border-sky-500/40 hover:bg-sky-950/40 text-sky-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {isHindi ? "Android APK डाउनलोड" : "Download Android APK"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 2: LOGIN AND GUEST MODE
           ===================================================================== */}
        {activeScreen === "auth" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-[#0f1420] p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold text-white">
                {isHindi ? "2. क्रिएटर अकाउंट साइन-इन" : "2. Creator Account Sign-In"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? "अपने प्रोजेक्ट्स, कस्टम वॉइस प्रोफाइल और रेंडर इतिहास को सहेजने के लिए साइन इन करें।"
                  : "Sign in to organize your multi-scene video projects, consent records, and custom character presets."}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    {isHindi ? "क्रिएटर का नाम" : "Creator Name"}
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    {isHindi ? "ईमेल पता" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    setUserSession({
                      mode: "authenticated",
                      name: loginName || "Rajdev Creator",
                      email: loginEmail,
                    });
                    setStatusBanner(
                      isHindi
                        ? `${loginName} के रूप में सफलतापूर्वक साइन इन किया गया।`
                        : `Signed in as ${loginName}.`
                    );
                    setActiveScreen("home");
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {isHindi ? "साइन इन करें और जारी रखें" : "Sign In & Continue to Studio"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0f1420] p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">
                  {isHindi ? "निःशुल्क गेस्ट मोड (तुरंत शुरू करें)" : "Instant Free Guest Mode"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isHindi
                    ? "बिना किसी पंजीकरण या क्रेडिट कार्ड के तुरंत वीडियो जनरेट करें, फेस रिप्लेसमेंट का परीक्षण करें और MP4 डाउनलोड करें।"
                    : "Start creating immediately with no sign-up required. Includes Free Local FFmpeg rendering, interactive face alignment, Gemini 3.8 Flash script generation, and full APK access."}
                </p>
                <div className="pt-3 space-y-2 text-xs text-slate-300">
                  <div>· Free 720p & 1080p H.264 MP4 exports via server/local FFmpeg</div>
                  <div>· Full access to Arjun & Priya reference characters + custom photo upload</div>
                  <div>· Consistent Hindi & English AI voice synthesis across scenes</div>
                  <div>· Instant one-click media deletion & privacy controls</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserSession({ mode: "guest", name: "Guest Creator" });
                  setActiveScreen("home");
                }}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {isHindi ? "गेस्ट के रूप में जारी रखें" : "Continue in Free Guest Mode"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 3: HOME DASHBOARD
           ===================================================================== */}
        {activeScreen === "home" && (
          <div className="space-y-8">
            {/* Hero Split Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-sky-400">
                    <img
                      src={ASSETS.logo}
                      alt="Rajdev AI"
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-md object-cover"
                    />
                    <span>Rajdev AI Studio</span>
                    <span aria-hidden="true">·</span>
                    <span>Hindi & English</span>
                    <span aria-hidden="true">·</span>
                    <span>Android APK Ready</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                    {isHindi
                      ? "एआई लॉन्ग और शॉर्ट वीडियो निर्माण, यथार्थवादी फेस रिप्लेसमेंट और एक समान आवाज़"
                      : "AI Video Creation with Realistic Face Replacement & Locked Voice Identity"}
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {isHindi
                      ? "अपना ओरिजिनल वीडियो अपलोड करें या टेक्स्ट प्रॉम्प्ट से नया वीडियो बनाएं। पूरे वीडियो में चेहरे के भाव, लाइटिंग और आवाज़ की निरंतरता बनाए रखें।"
                      : "Generate vertical 9:16 reels and 16:9 multi-scene videos. Track and replace character faces while preserving lighting and expressions, synthesize consistent multi-segment voiceovers, and download our verified Android APK."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setVideoMode("short");
                      setAspectRatio("9:16");
                      setActiveScreen("create-short");
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isHindi ? "शॉर्ट वीडियो बनाएं (9:16)" : "Create Short Video (9:16)"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setVideoMode("long");
                      setAspectRatio("16:9");
                      setActiveScreen("create-long");
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Film className="w-4 h-4 text-sky-400" />
                    <span>{isHindi ? "लॉन्ग वीडियो बनाएं (16:9)" : "Create Long Video (16:9)"}</span>
                  </button>
                  <button
                    onClick={() => setActiveScreen("apk-info")}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>{isHindi ? "APK डाउनलोड (4.94 MB)" : "Download Verified APK"}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0f1420] overflow-hidden flex flex-col justify-between">
                <div className="relative h-56 lg:h-full min-h-[220px] bg-slate-950">
                  <video
                    src={activeJob?.outputVideoUrl || "/media/sample_short_9_16.mp4"}
                    poster={ASSETS.studioHero}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <span className="font-semibold text-white">{activeJob?.title || "Studio Sample"}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="text-slate-400">{activeJob?.resolution || "1080p"} MP4</span>
                  </div>
                  <button
                    onClick={() => setActiveScreen("preview-export")}
                    className="text-sky-400 hover:text-sky-300 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isHindi ? "फुल प्रीव्यू" : "Full Export"}
                  </button>
                </div>
              </div>
            </div>

            {/* 4-Column Quick Workflow Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: "upload-video" as ScreenId,
                  titleEn: "Upload Original Video",
                  titleHi: "ओरिजिनल वीडियो अपलोड",
                  descEn: "Import phone video for face tracking, voice dubbing, or timeline trimming.",
                  descHi: "फेस ट्रैकिंग या डबिंग के लिए अपने फ़ोन से वीडियो अपलोड करें।",
                  icon: Upload,
                },
                {
                  id: "face-studio" as ScreenId,
                  titleEn: "Realistic Face Replacement",
                  titleHi: "यथार्थवादी फेस रिप्लेसमेंट",
                  descEn: "68-point facial landmark alignment, skin-tone blend, and multi-scene lock.",
                  descHi: "68-पॉइंट फेशियल लैंडमार्क एलाइनमेंट और लाइटिंग मैच।",
                  icon: UserCheck,
                },
                {
                  id: "voice-studio" as ScreenId,
                  titleEn: "Consistent AI Voice",
                  titleHi: "एक समान एआई आवाज़",
                  descEn: "Record or synthesize Hindi & English voice segments with locked persona.",
                  descHi: "हिन्दी और अंग्रेजी में एक समान एआई आवाज़ और लिप-सिंक।",
                  icon: Mic,
                },
                {
                  id: "timeline" as ScreenId,
                  titleEn: "Video Editing Studio",
                  titleHi: "वीडियो एडिटिंग स्टूडियो",
                  descEn: "Trim, crop 9:16/16:9/1:1, adjust speed, apply color grading & subtitles.",
                  descHi: "ट्रिम, क्रॉप, सबटाइटल, फ़िल्टर और बैकग्राउंड म्यूजिक मिक्सर।",
                  icon: Sliders,
                },
              ].map((card) => {
                const IconComp = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => setActiveScreen(card.id)}
                    className="text-left rounded-2xl border border-slate-800 bg-[#0f1420] hover:border-indigo-500/60 p-5 transition-colors flex flex-col justify-between space-y-4 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white">
                        {isHindi ? card.titleHi : card.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isHindi ? card.descHi : card.descEn}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-sky-400 flex items-center gap-1">
                      <span>{isHindi ? "खोलें" : "Open Studio"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Free Usage & Device Capability Bar */}
            <div className="rounded-2xl border border-slate-800 bg-[#0f1420] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-white">
                  {isHindi
                    ? "निःशुल्क उपयोग और डिवाइस क्षमता स्थिति (Free Mode Active)"
                    : "Transparent Free Mode & Local Device Capability Status"}
                </div>
                <div className="text-slate-400">
                  CPU Cores: {deviceCapabilities.cores} · RAM Tier: ~{deviceCapabilities.memoryGb}GB · WebGL2 Face Mesh: {deviceCapabilities.webgl2 ? "Supported" : "Fallback"} · Server FFmpeg MP4 Export: Free (720p & 1080p)
                </div>
              </div>
              <button
                onClick={() => setActiveScreen("settings")}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isHindi ? "सीमाएं और गोपनीयता देखें" : "View Usage Limits & Consent Policy"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREENS 4 & 5: CREATE LONG VIDEO & CREATE SHORT VIDEO
           ===================================================================== */}
        {(activeScreen === "create-long" || activeScreen === "create-short") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {activeScreen === "create-long"
                      ? isHindi
                        ? "4. एआई लॉन्ग वीडियो निर्माता (Multi-Scene 16:9 / 1:1)"
                        : "4. Create Long Multi-Scene Video"
                      : isHindi
                      ? "5. एआई शॉर्ट वीडियो और रील निर्माता (9:16 Vertical)"
                      : "5. Create Short Vertical Video (9:16 Reel)"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isHindi
                      ? "टेक्स्ट प्रॉम्प्ट से मल्टी-सीन स्क्रिप्ट जनरेट करें और चेहरे व आवाज़ को पूरे वीडियो में एक समान रखें।"
                      : "Generate multi-scene scripts with Gemini 3.8 Flash, customize each scene, and render 720p/1080p MP4."}
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setVideoMode("short");
                      setAspectRatio("9:16");
                      setActiveScreen("create-short");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                      activeScreen === "create-short" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Short (9:16)
                  </button>
                  <button
                    onClick={() => {
                      setVideoMode("long");
                      setAspectRatio("16:9");
                      setActiveScreen("create-long");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                      activeScreen === "create-long" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Long (16:9)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {isHindi ? "प्रोजेक्ट शीर्षक" : "Project Title"}
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {isHindi ? "वीडियो कॉन्सेप्ट / प्रॉम्प्ट (हिन्दी या English)" : "Video Concept or Story Prompt (Hindi or English)"}
                  </label>
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>

                {/* Format & Resolution Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {isHindi ? "आस्पेक्ट रेशियो (Format)" : "Video Aspect Ratio"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["9:16", "16:9", "1:1"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            aspectRatio === ratio
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {isHindi ? "MP4 रेज़ोल्यूशन" : "MP4 Export Resolution"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["720p", "1080p"] as const).map((res) => (
                        <button
                          key={res}
                          onClick={() => setResolution(res)}
                          className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            resolution === res
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          {res} HD
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleGenerateAiScript(activeScreen === "create-long" ? "long" : "short")
                    }
                    disabled={generatingScript}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {generatingScript
                        ? "Writing Multi-Scene Script..."
                        : isHindi
                        ? "AI से सीन स्क्रिप्ट लिखवाएं"
                        : "Generate AI Scene Storyboard"}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleStartVideoRender(activeScreen === "create-long" ? "long" : "short")
                    }
                    disabled={submittingJob}
                    className="flex-1 min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {submittingJob
                        ? "Starting Render..."
                        : isHindi
                        ? `वीडियो जनरेट करें (${resolution} MP4)`
                        : `Render Video Now (${aspectRatio} · ${resolution})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scene-by-Scene Script & Voice Continuity Editor */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {isHindi ? "सीन स्टोरीबोर्ड और संवाद" : "Scene Storyboard & Narration"}
                </h3>
                <button
                  onClick={() =>
                    setScenes((prev) => [
                      ...prev,
                      {
                        id: `sc_${Date.now()}`,
                        sceneNumber: prev.length + 1,
                        title: `Scene ${prev.length + 1}`,
                        visualPrompt: promptText,
                        narrationText: isHindi
                          ? "अगला दृश्य: कहानी आगे बढ़ती है।"
                          : "Next scene: maintaining consistent face and voice identity.",
                        durationSec: 5,
                        cameraMovement: "Slow Push-In",
                      },
                    ])
                  }
                  className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHindi ? "सीन जोड़ें" : "Add Scene"}</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {scenes.map((sc, idx) => (
                  <div
                    key={sc.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-indigo-400">
                        Scene {idx + 1}: {sc.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{sc.durationSec}s · {sc.cameraMovement}</span>
                        {scenes.length > 1 && (
                          <button
                            onClick={() =>
                              setScenes((prev) => prev.filter((item) => item.id !== sc.id))
                            }
                            className="text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={sc.narrationText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setScenes((prev) =>
                          prev.map((item) =>
                            item.id === sc.id ? { ...item, narrationText: val } : item
                          )
                        );
                      }}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                      placeholder="Scene narration dialogue..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 6: UPLOAD ORIGINAL VIDEO
           ===================================================================== */}
        {activeScreen === "upload-video" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">
                {isHindi
                  ? "6. अपने फ़ोन से ओरिजिनल वीडियो अपलोड करें"
                  : "6. Upload Original Video from Your Device"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? "फेस रिप्लेसमेंट, वॉइस डबिंग या टाइमलाइन एडिटिंग के लिए अपना MP4/WebM/MOV वीडियो चुनें।"
                  : "Upload your source video (MP4, WebM, MOV) to detect and replace faces, dub with consistent AI voice, or edit on the timeline."}
              </p>

              <label className="block border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/60">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <div className="text-sm font-semibold text-white">
                  {uploadingFile
                    ? "Uploading video to private workspace..."
                    : isHindi
                    ? "वीडियो फ़ाइल चुनने के लिए यहाँ टैप करें"
                    : "Tap to Select Video File from Phone / Computer"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Supports MP4, WebM, MOV · Stored privately with instant deletion controls
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, "video")}
                  className="hidden"
                />
              </label>

              {uploadedMediaList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-300">
                    {isHindi ? "आपकी अपलोड की गई फ़ाइलें" : "Your Uploaded Private Media"}
                  </div>
                  {uploadedMediaList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <span className="text-white font-medium">{item.name}</span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-slate-400">
                          {(item.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setUploadedSourceVideoUrl(item.url)}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 cursor-pointer"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => handleDeleteUploadedMedia(item.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                {isHindi ? "स्रोत वीडियो प्रीव्यू" : "Active Source Video Preview"}
              </h3>
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <video
                  src={uploadedSourceVideoUrl}
                  controls
                  playsInline
                  className="w-full max-h-72 object-contain"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveScreen("face-studio")}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  {isHindi ? "इस वीडियो में चेहरा बदलें →" : "Proceed to Face Replacement →"}
                </button>
                <button
                  onClick={() => setActiveScreen("timeline")}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  {isHindi ? "टाइमलाइन में एडिट करें" : "Open in Video Timeline"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 7: SELECT FACE AND CHARACTER (REALISTIC FACE REPLACEMENT)
           ===================================================================== */}
        {activeScreen === "face-studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isHindi
                      ? "7. यथार्थवादी फेस रिप्लेसमेंट और कैरेक्टर स्टूडियो"
                      : "7. Realistic Face Replacement & Character Continuity"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHindi
                      ? "प्राकृतिक भाव, सिर की गति और लाइटिंग को बनाए रखते हुए पूरे वीडियो में चेहरा बदलें।"
                      : "Track facial landmarks, match studio key lighting, and lock character identity across multiple scenes."}
                  </p>
                </div>
                <button
                  onClick={() => setShowFaceMesh(!showFaceMesh)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-sky-400 font-medium cursor-pointer whitespace-nowrap"
                >
                  {showFaceMesh ? "Hide 68-Pt Mesh" : "Show 68-Pt Mesh"}
                </button>
              </div>

              <FaceAlignmentCanvas
                presetId={facePresetId}
                customFaceDataUrl={customFaceDataUrl}
                alignmentScore={alignmentScore}
                blendStrength={blendStrength}
                lightingMatch={lightingMatch}
                showMesh={showFaceMesh}
                isHindi={isHindi}
              />

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Transparency Disclosure:</strong> Face replacement quality depends on source lighting, occlusion, and camera angle. All face-swapped outputs include metadata and optional visual AI labeling to prevent misuse.
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h3 className="text-base font-bold text-white">
                {isHindi ? "चेहरा चुनें या अपनी फ़ोटो अपलोड करें" : "Select Reference Face or Upload Photo"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "arjun" as const, name: "Arjun (Studio Male)", img: ASSETS.avatarArjun },
                  { id: "priya" as const, name: "Priya (Studio Female)", img: ASSETS.avatarPriya },
                ].map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setFacePresetId(char.id);
                      setCustomFaceDataUrl(null);
                      setCustomFaceServerPath(undefined);
                    }}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      facePresetId === char.id && !customFaceDataUrl
                        ? "border-indigo-500 bg-indigo-950/30"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <img
                      src={char.img}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                    <div className="text-xs font-semibold text-white">{char.name}</div>
                    <div className="text-[11px] text-slate-400">68 Landmarks Ready</div>
                  </button>
                ))}
              </div>

              <label className="block w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-sky-400 bg-slate-950 text-center text-xs font-medium text-sky-400 cursor-pointer">
                {isHindi ? "+ अपनी खुद की फेस फ़ोटो अपलोड करें" : "+ Upload Your Own Face Reference Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "face")}
                  className="hidden"
                />
              </label>

              {/* Alignment, Blending & Lighting Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Face Landmark Alignment Precision</span>
                    <span className="font-mono tabular-nums text-sky-400">{alignmentScore}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={100}
                    value={alignmentScore}
                    onChange={(e) => setAlignmentScore(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Edge Feathering & Skin Blending</span>
                    <span className="font-mono tabular-nums text-sky-400">{blendStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={blendStrength}
                    onChange={(e) => setBlendStrength(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Ambient Lighting & Color Match</span>
                    <span className="font-mono tabular-nums text-sky-400">{lightingMatch}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={lightingMatch}
                    onChange={(e) => setLightingMatch(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Mandatory Face Consent Verification */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={faceConsentVerified}
                  onChange={(e) => setFaceConsentVerified(e.target.checked)}
                  className="mt-0.5 accent-indigo-500"
                />
                <span>
                  {isHindi
                    ? "मैं पुष्टि करता/करती हूँ कि यह मेरा अपना चेहरा है या मेरे पास इस व्यक्ति के चेहरे का उपयोग करने की स्पष्ट अनुमति है।"
                    : "I confirm that I own this face likeness or have explicit authorization from the pictured person to perform AI face replacement."}
                </span>
              </label>

              <button
                onClick={() => handleStartVideoRender()}
                disabled={!faceConsentVerified || submittingJob}
                className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isHindi
                  ? "फेस रिप्लेसमेंट लागू करें और MP4 रेंडर करें"
                  : "Apply Face Replacement & Render MP4"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 8: RECORD OR UPLOAD VOICE (CONSISTENT AI VOICE)
           ===================================================================== */}
        {activeScreen === "voice-studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">
                {isHindi
                  ? "8. एक समान एआई आवाज़ (Consistent AI Voice & Cloning)"
                  : "8. Consistent AI Voice & Authorized Voice Studio"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? "पूरे लॉन्ग या शॉर्ट वीडियो में एक ही आवाज़ की पहचान, टोन और पिच बनाए रखें, या अपनी आवाज़ रिकॉर्ड करें।"
                  : "Keep the exact same voice persona across every scene segment in Hindi or English using Gemini 3.8 TTS, or record your own authorized voice."}
              </p>

              {/* Select Voice Persona */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  {isHindi ? "एआई वॉइस पहचान चुनें (Locked Across Scenes)" : "Select Consistent AI Voice Identity"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["Kore", "Puck", "Charon", "Fenrir", "Zephyr"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVoice(v)}
                      className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedVoice === v
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Record Microphone or Upload Voice Sample */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-white">
                  {isHindi ? "अपनी आवाज़ रिकॉर्ड या अपलोड करें" : "Record Live Microphone or Upload Authorized Voice Sample"}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleToggleMicRecording}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      isRecordingMic
                        ? "bg-rose-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                    }`}
                  >
                    {isRecordingMic ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-sky-400" />}
                    <span>
                      {isRecordingMic
                        ? "Stop Recording & Transcribe"
                        : isHindi
                        ? "माइक से रिकॉर्ड करें"
                        : "Record Voice Sample"}
                    </span>
                  </button>

                  <label className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isHindi ? "ऑडियो अपलोड करें" : "Upload Audio (.wav/.mp3)"}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, "voice")}
                      className="hidden"
                    />
                  </label>
                </div>

                {recordedAudioUrl && (
                  <div className="pt-2 space-y-2">
                    <audio src={recordedAudioUrl} controls className="w-full h-9" />
                    {transcribing && (
                      <div className="text-xs text-sky-400">Transcribing audio with Gemini 3.5 Transcribe...</div>
                    )}
                    {transcriptResult && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <span className="text-slate-500">Transcript: </span>
                        {transcriptResult}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Speaker Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceConsentVerified}
                  onChange={(e) => setVoiceConsentVerified(e.target.checked)}
                  className="mt-0.5 accent-indigo-500"
                />
                <span>
                  {isHindi
                    ? "मैं पुष्टि करता/करती हूँ कि मेरे पास इस आवाज़ के संश्लेषण और क्लोनिंग के लिए स्पीकर की स्पष्ट सहमति है।"
                    : "I confirm explicit speaker authorization for text-to-speech synthesis and voice cloning."}
                </span>
              </label>

              <button
                onClick={handleSynthesizeConsistentVoice}
                disabled={synthesizingVoice || !voiceConsentVerified}
                className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>
                  {synthesizingVoice
                    ? "Synthesizing Multi-Segment WAV Track..."
                    : isHindi
                    ? `सभी सीन के लिए ${selectedVoice} आवाज़ जनरेट करें`
                    : `Synthesize Consistent ${selectedVoice} Voice Across All Scenes`}
                </span>
              </button>
            </div>

            {/* Per-Segment Voice Preview, Alignment & Audio Mixer */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {isHindi ? "सीन-वार वॉइस ट्रैक और टाइमलाइन एलाइनमेंट" : "Per-Scene Voice Segments & Master Track"}
                </h3>
                {voiceModelStatus && (
                  <span className="text-xs text-sky-400">{voiceModelStatus}</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200">
                  Master Concatenated Voice Track ({selectedVoice} · 24kHz WAV)
                </div>
                <audio src={combinedVoiceUrl} controls className="w-full h-10" />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {scenes.map((seg, i) => (
                  <div
                    key={seg.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        Segment {i + 1}: {seg.title}
                      </span>
                      <span className="text-slate-400">Voice: {selectedVoice}</span>
                    </div>
                    <p className="text-slate-300">{seg.narrationText}</p>
                    {seg.audioUrl && (
                      <audio src={seg.audioUrl} controls className="w-full h-8" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Note: Voice tone and acoustic consistency depend on segment punctuation and the active TTS model ({voiceModelStatus || "Gemini 3.8 Flash Lite TTS / Local Acoustic Fallback"}).
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 9: VIDEO EDITING TIMELINE STUDIO
           ===================================================================== */}
        {activeScreen === "timeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">
                {isHindi ? "9. मल्टी-ट्रैक वीडियो एडिटिंग स्टूडियो" : "9. Video Editing Studio & Multi-Track Timeline"}
              </h2>

              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <video
                  src={activeJob?.outputVideoUrl || uploadedSourceVideoUrl}
                  controls
                  playsInline
                  className="w-full max-h-72 object-contain"
                />
              </div>

              {/* Visual Multi-Track Timeline Representation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>00:00.0</span>
                  <span>
                    Trim Range: {trimStart}s – {trimEnd}s · Speed: {playbackSpeed}x
                  </span>
                  <span>00:{String(trimEnd).padStart(2, "0")}.0</span>
                </div>

                {/* Video Scenes Track */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">Track 1: Video Scenes & Face Lock</div>
                  <div className="grid grid-cols-12 gap-1 h-9 rounded-lg bg-slate-900 p-1">
                    {scenes.map((sc, i) => (
                      <div
                        key={sc.id}
                        style={{ gridColumn: `span ${Math.max(Math.floor(12 / scenes.length), 2)}` }}
                        className="bg-indigo-600/40 border border-indigo-500/60 rounded flex items-center px-2 truncate text-[11px] text-white"
                      >
                        S{i + 1}: {sc.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voiceover Track */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">
                    Track 2: Consistent AI Voice ({selectedVoice}) {lipSyncEnabled ? "· Lip-Sync Active" : ""}
                  </div>
                  <div className="h-7 rounded-lg bg-sky-950/60 border border-sky-500/40 flex items-center px-3 text-[11px] text-sky-300">
                    Synchronized Narration Waveform ({voiceVolume}% Volume)
                  </div>
                </div>

                {/* Subtitles & Music Track */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400">
                    Track 3: Subtitles & Background Music ({bgMusicStyle} · {bgMusicVolume}%)
                  </div>
                  <div className="h-7 rounded-lg bg-purple-950/50 border border-purple-500/40 flex items-center px-3 text-[11px] text-purple-300">
                    {subtitlesEnabled ? "Burned-In Subtitles Enabled" : "Subtitles Muted"} · {aiWatermarkLabel ? "AI Label Active" : "No Watermark"}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white">
                {isHindi ? "ट्रिम, क्रॉप, फ़िल्टर और ऑडियो कंट्रोल्स" : "Trim, Crop, Filters & Audio Mixing"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Trim Start (sec)</label>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, trimEnd - 2)}
                    value={trimStart}
                    onChange={(e) => setTrimStart(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Trim End (sec)</label>
                  <input
                    type="number"
                    min={trimStart + 2}
                    max={20}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Color Filter Selector */}
              <div>
                <label className="block text-slate-300 mb-1.5">Color Grading Filter</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(["none", "cinematic", "neon", "vintage", "bw"] as const).map((flt) => (
                    <button
                      key={flt}
                      onClick={() => setColorFilter(flt)}
                      className={`min-h-[38px] rounded-lg font-medium capitalize border cursor-pointer ${
                        colorFilter === flt
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Video Playback Speed</span>
                  <span className="font-mono text-sky-400">{playbackSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.25}
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Audio Volume Mixing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">AI Voice Volume</span>
                    <span className="font-mono text-sky-400">{voiceVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={voiceVolume}
                    onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">BG Music Volume</span>
                    <span className="font-mono text-sky-400">{bgMusicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={bgMusicVolume}
                    onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Burn Subtitles into MP4</span>
                  <input
                    type="checkbox"
                    checked={subtitlesEnabled}
                    onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Lip-Sync Alignment</span>
                  <input
                    type="checkbox"
                    checked={lipSyncEnabled}
                    onChange={(e) => setLipSyncEnabled(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Include "AI-Generated / Face-Swapped" Label</span>
                  <input
                    type="checkbox"
                    checked={aiWatermarkLabel}
                    onChange={(e) => setAiWatermarkLabel(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
              </div>

              <button
                onClick={() => handleStartVideoRender()}
                disabled={submittingJob}
                className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
              >
                {isHindi ? "परिवर्तन सहेजें और MP4 एक्सपोर्ट करें" : "Render Timeline Edits to MP4"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 10: GENERATION PROGRESS
           ===================================================================== */}
        {activeScreen === "progress" && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-[#0f1420] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isHindi ? "10. वीडियो जनरेशन और रेंडर स्थिति" : "10. Video Generation & Render Queue Progress"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Job ID: <span className="font-mono text-slate-300">{activeJob?.id}</span> · {activeJob?.engineUsed}
                </p>
              </div>
              <span className="text-lg font-mono font-bold text-sky-400 tabular-nums">
                {activeJob?.progress || 0}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-purple-500 transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${(activeJob?.progress || 0) / 100})` }}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-200 font-medium">{activeJob?.currentStep}</span>
              <span className="uppercase font-mono text-indigo-400">{activeJob?.status}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(activeJob?.status === "queued" || activeJob?.status === "processing") && (
                <button
                  onClick={() => handleCancelJob(activeJob.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  {isHindi ? "रेंडर रद्द करें (Cancel)" : "Cancel Render Job"}
                </button>
              )}

              {(activeJob?.status === "failed" || activeJob?.status === "cancelled") && (
                <button
                  onClick={() => handleRetryJob(activeJob.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHindi ? "पुनः प्रयास करें (Retry)" : "Retry Render Job"}</span>
                </button>
              )}

              {activeJob?.status === "completed" && (
                <button
                  onClick={() => setActiveScreen("preview-export")}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isHindi ? "प्रीव्यू और MP4 डाउनलोड खोलें →" : "Open Preview & Download MP4 →"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 11: PREVIEW AND EXPORT MP4
           ===================================================================== */}
        {activeScreen === "preview-export" && activeJob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">
                {isHindi ? "11. फाइनल वीडियो प्रीव्यू और MP4 एक्सपोर्ट" : "11. Final Video Preview & MP4 Export"}
              </h2>
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <video
                  key={activeJob.outputVideoUrl}
                  src={activeJob.outputVideoUrl || "/media/sample_short_9_16.mp4"}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[460px] object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0f1420] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">{activeJob.title}</h3>
                <div className="text-xs text-slate-400 space-y-2">
                  <div>
                    Format: <span className="text-white">{activeJob.aspectRatio}</span> · Resolution:{" "}
                    <span className="text-sky-400">{activeJob.resolution} MP4</span>
                  </div>
                  <div>
                    File Size:{" "}
                    <span className="font-mono text-white">
                      {((activeJob.outputSizeBytes || 420000) / 1024).toFixed(1)} KB
                    </span>{" "}
                    · Duration: <span className="font-mono text-white">{activeJob.durationSec}s</span>
                  </div>
                  <div>
                    Face Identity:{" "}
                    <span className="text-white capitalize">{activeJob.faceConfig.presetId}</span> (
                    {activeJob.faceConfig.alignmentScore}% Lock) · Voice:{" "}
                    <span className="text-white">{activeJob.voiceConfig.voiceName}</span>
                  </div>
                  <div>
                    Engine: <span className="text-slate-300">{activeJob.engineUsed}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={activeJob.outputVideoUrl || "/media/sample_short_9_16.mp4"}
                  download={`${activeJob.title.replace(/\s+/g, "_")}_${activeJob.resolution}.mp4`}
                  className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isHindi
                      ? `MP4 वीडियो डाउनलोड करें (${activeJob.resolution})`
                      : `Download Rendered MP4 (${activeJob.resolution})`}
                  </span>
                </a>

                <button
                  onClick={() => setActiveScreen("timeline")}
                  className="w-full min-h-[44px] rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  {isHindi ? "टाइमलाइन में वापस जाकर संपादित करें" : "Continue Editing in Timeline Studio"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 12: MY PROJECTS AND DOWNLOADED VIDEOS
           ===================================================================== */}
        {activeScreen === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isHindi ? "12. मेरे प्रोजेक्ट्स और रेंडर किए गए वीडियो" : "12. My Projects & Rendered MP4 Library"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isHindi
                    ? "अपने सहेजे गए प्रोजेक्ट्स को कभी भी फिर से संपादित करें, डाउनलोड करें या स्थायी रूप से हटाएं।"
                    : "Resume editing any saved project, download MP4 exports, or permanently delete media from server storage."}
                </p>
              </div>
              <button
                onClick={() => setActiveScreen("create-short")}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                + {isHindi ? "नया प्रोजेक्ट" : "New Video Project"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-800 bg-[#0f1420] p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {job.aspectRatio} · {job.resolution} · {job.durationSec}s
                      </span>
                      <span className="font-mono text-sky-400 uppercase">{job.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{job.prompt}</p>
                    {job.outputVideoUrl && (
                      <video
                        src={job.outputVideoUrl}
                        controls
                        playsInline
                        className="w-full h-44 object-cover rounded-xl bg-slate-950 border border-slate-800"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveJobId(job.id);
                          setActiveScreen("preview-export");
                        }}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
                      >
                        {isHindi ? "प्रीव्यू" : "Preview"}
                      </button>
                      {job.outputVideoUrl && (
                        <a
                          href={job.outputVideoUrl}
                          download={`${job.title.replace(/\s+/g, "_")}.mp4`}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>MP4</span>
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? "हटाएं" : "Delete"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            SCREEN 13: DOWNLOAD APK & BUILD VERIFICATION CENTER
           ===================================================================== */}
        {activeScreen === "apk-info" && <ApkVerificationPanel isHindi={isHindi} />}

        {/* =====================================================================
            SCREEN 14: SETTINGS, PRIVACY, CONSENT & HELP
           ===================================================================== */}
        {activeScreen === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">
                {isHindi
                  ? "14. सेटिंग्स, गोपनीयता, सहमति और निःशुल्क सीमाएं"
                  : "14. Settings, Privacy, Consent & Free Tier Transparency"}
              </h2>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white">
                    1. Free Mode vs. Optional Paid Cloud Models
                  </div>
                  <div>
                    · <strong>Included Free Features:</strong> Multi-scene scriptwriting (`gemini-3.8-flash`), consistent 24kHz voice synthesis (`gemini-3.8-flash-lite-tts`), audio transcription (`gemini-3.5-transcribe`), 68-point Canvas/MLKit face alignment & lighting blend, and server-side FFmpeg 720p/1080p H.264 MP4 rendering.
                  </div>
                  <div>
                    · <strong>Optional Paid Cloud Models:</strong> Cloud generative video (`gemini-omni-1.1-flash`) and high-res character generation (`gemini-3.1-flash-lite-image`) require a user-supplied paid Gemini API key in AI Studio Secrets. We never make fake "unlimited free cloud GPU" claims or charge users without authorization.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white">
                    2. Mandatory Face & Voice Consent Policy
                  </div>
                  <div>
                    · Users must explicitly confirm consent before replacing any person's face or cloning/synthesizing a voice.
                  </div>
                  <div>
                    · Rendered videos include an "AI-Generated / Face-Swapped" transparency label by default to prevent deceptive deepfakes.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0f1420] p-6 space-y-5">
              <h3 className="text-base font-bold text-white">
                {isHindi ? "डेटा और मीडिया विलोपन नियंत्रण" : "Private Storage & Instant Data Deletion Controls"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? "आप अपने अपलोड किए गए सभी चेहरे, आवाज़ के नमूने और जनरेट किए गए प्रोजेक्ट्स को एक क्लिक में हटा सकते हैं।"
                  : "All uploaded face photos, voice recordings, and rendered videos are stored strictly inside your private instance and can be wiped at any time."}
              </p>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    for (const u of uploadedMediaList) {
                      await handleDeleteUploadedMedia(u.id);
                    }
                    setCustomFaceDataUrl(null);
                    setCustomFaceServerPath(undefined);
                    setRecordedAudioUrl(null);
                    setStatusBanner("All uploaded face photos, videos, and voice samples have been permanently deleted.");
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {isHindi
                      ? "सभी अपलोड किए गए चेहरे और आवाज़ें हटाएं"
                      : "Delete All Uploaded Faces, Voices & Source Media"}
                  </span>
                </button>

                <button
                  onClick={() => setActiveScreen("apk-info")}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {isHindi
                    ? "APK बिल्ड और सेटअप निर्देश देखें"
                    : "Open APK Build & Backend Setup Documentation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE THUMB-ZONE BOTTOM NAVIGATION BAR (<15% Sticky Cap) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-16 px-2">
        {[
          { id: "home" as ScreenId, labelEn: "Home", labelHi: "होम", icon: Home },
          { id: "create-short" as ScreenId, labelEn: "Create", labelHi: "बनाएं", icon: Film },
          { id: "face-studio" as ScreenId, labelEn: "Face/Voice", labelHi: "फेस/आवाज़", icon: UserCheck },
          { id: "projects" as ScreenId, labelEn: "Projects", labelHi: "प्रोजेक्ट्स", icon: FolderOpen },
          { id: "apk-info" as ScreenId, labelEn: "Get APK", labelHi: "APK", icon: Smartphone },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isAct = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
                isAct ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {isHindi ? tab.labelHi : tab.labelEn}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
