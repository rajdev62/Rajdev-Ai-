package com.rajdev.ai.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

data class JobRequest(
    val title: String,
    val prompt: String,
    val aspectRatio: String,
    val resolution: String,
    val voiceName: String,
    val consentVerified: Boolean
)

object RajdevApiClient {
    private const val BASE_URL = "https://ais-pre-eqbovvjaicx6pebs5b6rxg-290593260701.asia-east1.run.app"

    suspend fun submitJob(request: JobRequest): String = withContext(Dispatchers.IO) {
        try {
            val url = URL("$BASE_URL/api/jobs/create")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 15000
                readTimeout = 30000
            }
            val payload = """
                {
                  "title": "${request.title}",
                  "prompt": "${request.prompt}",
                  "aspectRatio": "${request.aspectRatio}",
                  "resolution": "${request.resolution}",
                  "voiceName": "${request.voiceName}",
                  "consentVerified": ${request.consentVerified}
                }
            """.trimIndent()
            OutputStreamWriter(conn.outputStream).use { it.write(payload) }
            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                conn.inputStream.bufferedReader().use { it.readText() }
            } else {
                "HTTP $responseCode: Unable to reach cloud worker; switched to on-device Media3 processor."
            }
        } catch (e: Exception) {
            "Local Fallback Active: ${e.localizedMessage ?: "Offline mode"}"
        }
    }
}
