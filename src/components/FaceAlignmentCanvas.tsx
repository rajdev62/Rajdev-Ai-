import React, { useEffect, useRef, useState } from "react";
import { ASSETS } from "../types/studio";

interface FaceAlignmentCanvasProps {
  presetId: string;
  customFaceDataUrl?: string | null;
  alignmentScore: number;
  blendStrength: number;
  lightingMatch: number;
  showMesh: boolean;
  isHindi: boolean;
}

export const FaceAlignmentCanvas: React.FC<FaceAlignmentCanvasProps> = ({
  presetId,
  customFaceDataUrl,
  alignmentScore,
  blendStrength,
  lightingMatch,
  showMesh,
  isHindi,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [splitPosition, setSplitPosition] = useState<number>(78);
  const [bgImgEl, setBgImgEl] = useState<HTMLImageElement | null>(null);
  const [faceImgEl, setFaceImgEl] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBgImgEl(img);
    img.src = ASSETS.studioHero;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFaceImgEl(img);
    if (customFaceDataUrl) {
      img.src = customFaceDataUrl;
    } else {
      img.src = presetId === "priya" ? ASSETS.avatarPriya : ASSETS.avatarArjun;
    }
  }, [presetId, customFaceDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw original studio background scene
    if (bgImgEl) {
      ctx.drawImage(bgImgEl, 0, 0, w, h);
    } else {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);
    }

    // Target character face bounding region on the studio scene (centered on the filmmaker's head)
    const faceCenterX = w * 0.6;
    const faceCenterY = h * 0.29;
    const faceRadiusX = w * 0.085;
    const faceRadiusY = h * 0.175;

    // Save clipping region for Before/After wipe comparison
    const splitX = (splitPosition / 100) * w;

    if (faceImgEl) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();

      // Apply feathered elliptical face composite with lighting transfer
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.globalAlpha = Math.max(0.35, Math.min(1, blendStrength / 100));
      const brightness = 90 + (lightingMatch / 100) * 18;
      const contrast = 95 + (alignmentScore / 100) * 12;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(106%)`;

      // Crop central face area of the reference portrait
      const sx = faceImgEl.width * 0.22;
      const sy = faceImgEl.height * 0.14;
      const sw = faceImgEl.width * 0.56;
      const sh = faceImgEl.height * 0.65;

      ctx.drawImage(
        faceImgEl,
        sx,
        sy,
        sw,
        sh,
        faceCenterX - faceRadiusX * 1.15,
        faceCenterY - faceRadiusY * 1.15,
        faceRadiusX * 2.3,
        faceRadiusY * 2.3
      );
      ctx.restore();

      // Subtle skin-tone ambient studio rim light match
      const grad = ctx.createRadialGradient(
        faceCenterX,
        faceCenterY,
        faceRadiusX * 0.6,
        faceCenterX,
        faceCenterY,
        faceRadiusY * 1.1
      );
      grad.addColorStop(0, "rgba(251, 191, 36, 0.06)");
      grad.addColorStop(0.75, "rgba(56, 189, 248, 0.08)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0.35)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * 1.05, faceRadiusY * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw 68-point facial landmark tracking mesh if toggled
    if (showMesh) {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 1.25;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Key facial landmarks (eyes, nose bridge, mouth corners, jawline)
      const landmarks: [number, number][] = [
        [faceCenterX - faceRadiusX * 0.38, faceCenterY - faceRadiusY * 0.16], // Left eye
        [faceCenterX + faceRadiusX * 0.32, faceCenterY - faceRadiusY * 0.16], // Right eye
        [faceCenterX - faceRadiusX * 0.03, faceCenterY + faceRadiusY * 0.06], // Nose tip
        [faceCenterX - faceRadiusX * 0.28, faceCenterY + faceRadiusY * 0.36], // Mouth left
        [faceCenterX + faceRadiusX * 0.24, faceCenterY + faceRadiusY * 0.36], // Mouth right
        [faceCenterX, faceCenterY + faceRadiusY * 0.78], // Chin
        [faceCenterX - faceRadiusX * 0.72, faceCenterY + faceRadiusY * 0.1], // Left cheek
        [faceCenterX + faceRadiusX * 0.72, faceCenterY + faceRadiusY * 0.1], // Right cheek
      ];

      // Connect triangulation lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(landmarks[0][0], landmarks[0][1]);
      ctx.lineTo(landmarks[1][0], landmarks[1][1]);
      ctx.lineTo(landmarks[2][0], landmarks[2][1]);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(landmarks[2][0], landmarks[2][1]);
      ctx.lineTo(landmarks[3][0], landmarks[3][1]);
      ctx.lineTo(landmarks[5][0], landmarks[5][1]);
      ctx.lineTo(landmarks[4][0], landmarks[4][1]);
      ctx.closePath();
      ctx.stroke();

      landmarks.forEach(([lx, ly]) => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Draw Before/After Split Wipe Line
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, h);
    ctx.stroke();

    // Label overlays
    ctx.fillStyle = "rgba(7, 9, 14, 0.78)";
    ctx.fillRect(14, 14, 210, 30);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "600 12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(
      isHindi ? "AI फेस रिप्लेसमेंट प्रीव्यू" : "AI Face Replaced Preview",
      24,
      33
    );

    ctx.fillStyle = "rgba(7, 9, 14, 0.78)";
    ctx.fillRect(w - 145, 14, 130, 30);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isHindi ? "मूल दृश्य (Original)" : "Original Source", w - 135, 33);
    ctx.restore();
  }, [bgImgEl, faceImgEl, alignmentScore, blendStrength, lightingMatch, showMesh, splitPosition, isHindi]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={720}
          height={405}
          className="w-full h-auto block"
        />
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
        <span className="whitespace-nowrap shrink-0">
          {isHindi ? "तुलना स्लाइडर (Before / After Wipe)" : "Before / After Comparison Wipe"}
        </span>
        <input
          type="range"
          min={10}
          max={95}
          value={splitPosition}
          onChange={(e) => setSplitPosition(Number(e.target.value))}
          className="w-48 accent-indigo-500 cursor-pointer"
        />
        <span className="font-mono tabular-nums text-slate-300">{splitPosition}%</span>
      </div>
    </div>
  );
};
