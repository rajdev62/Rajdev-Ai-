package com.rajdev.ai.video

import android.app.ActivityManager
import android.content.Context
import android.media.MediaCodecList
import android.os.Build

data class DeviceCapabilityReport(
    val totalRamMb: Long,
    val supportsHardwareHevc: Boolean,
    val supportsHardwareAvc1080p: Boolean,
    val canRunLocalFaceDetection: Boolean,
    val summary: String
)

object DeviceCapabilityInspector {
    fun inspectDevice(context: Context): DeviceCapabilityReport {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)
        val totalRamMb = memInfo.totalMem / (1024 * 1024)

        val codecList = MediaCodecList(MediaCodecList.REGULAR_CODECS)
        var hasHevc = false
        var hasAvc = false
        for (info in codecList.codecInfos) {
            if (!info.isEncoder) continue
            for (type in info.supportedTypes) {
                if (type.equals("video/hevc", ignoreCase = true)) hasHevc = true
                if (type.equals("video/avc", ignoreCase = true)) hasAvc = true
            }
        }

        val canLocal = totalRamMb >= 3500 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        val summary = "Device: ${Build.MODEL} • RAM: ${totalRamMb}MB • Local MLKit Face Track: ${if (canLocal) "Supported" else "Cloud Only"} • HW H.264/HEVC: $hasAvc/$hasHevc"

        return DeviceCapabilityReport(
            totalRamMb = totalRamMb,
            supportsHardwareHevc = hasHevc,
            supportsHardwareAvc1080p = hasAvc,
            canRunLocalFaceDetection = canLocal,
            summary = summary
        )
    }
}
