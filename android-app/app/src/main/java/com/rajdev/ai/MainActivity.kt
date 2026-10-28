package com.rajdev.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rajdev.ai.network.JobRequest
import com.rajdev.ai.network.RajdevApiClient
import com.rajdev.ai.video.DeviceCapabilityInspector
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class AppScreen(val titleEn: String, val titleHi: String) {
    SPLASH("Splash", "आरंभ"),
    AUTH("Sign In / Guest", "लॉगिन / अतिथि"),
    HOME("Home Studio", "होम स्टूडियो"),
    CREATE_LONG("Create Long Video", "लॉन्ग वीडियो बनाएं"),
    CREATE_SHORT("Create Short Video", "शॉर्ट वीडियो बनाएं"),
    UPLOAD_VIDEO("Upload Original Video", "ओरिजिनल वीडियो अपलोड"),
    FACE_STUDIO("Select Face & Character", "फेस और कैरेक्टर बदलें"),
    VOICE_STUDIO("Record / AI Voice", "आवाज़ और वॉइस क्लोन"),
    TIMELINE("Video Editing Timeline", "वीडियो एडिटिंग टाइमलाइन"),
    PROGRESS("Generation Progress", "प्रोसेसिंग स्थिति"),
    PREVIEW_EXPORT("Preview & Export MP4", "प्रीव्यू और एक्सपोर्ट"),
    PROJECTS("My Projects & Downloads", "मेरे प्रोजेक्ट्स"),
    APK_INFO("Build & APK Verification", "एपीके और बिल्ड जानकारी"),
    SETTINGS("Settings, Consent & Privacy", "सेटिंग्स और सहमति")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val capability = DeviceCapabilityInspector.inspectDevice(this)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF6366F1),
                    secondary = Color(0xFF38BDF8),
                    background = Color(0xFF07090E),
                    surface = Color(0xFF0F1420)
                )
            ) {
                RajdevAiRootApp(capabilitySummary = capability.summary)
            }
        }
    }
}

@Composable
fun RajdevAiRootApp(capabilitySummary: String) {
    var currentScreen by remember { mutableStateOf(AppScreen.HOME) }
    var isHindi by remember { mutableStateOf(false) }
    var consentFaceAccepted by remember { mutableStateOf(false) }
    var consentVoiceAccepted by remember { mutableStateOf(false) }
    var promptText by remember { mutableStateOf("A futuristic filmmaker directing an AI cinema scene in Mumbai") }
    var aspectRatio by remember { mutableStateOf("9:16") }
    var resolution by remember { mutableStateOf("1080p") }
    var selectedVoice by remember { mutableStateOf("Kore") }
    var jobStatus by remember { mutableStateOf("Idle") }
    var jobProgress by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0B0F19))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Rajdev AI",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { isHindi = !isHindi }) {
                        Text(if (isHindi) "English" else "हिन्दी", color = Color(0xFF38BDF8))
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0B0F19)) {
                val navItems = listOf(
                    AppScreen.HOME,
                    AppScreen.CREATE_SHORT,
                    AppScreen.FACE_STUDIO,
                    AppScreen.VOICE_STUDIO,
                    AppScreen.PROJECTS
                )
                navItems.forEach { screen ->
                    NavigationBarItem(
                        selected = currentScreen == screen,
                        onClick = { currentScreen = screen },
                        icon = { Box(modifier = Modifier.size(8.dp).background(Color(0xFF6366F1), RoundedCornerShape(4.dp))) },
                        label = { Text(if (isHindi) screen.titleHi else screen.titleEn, fontSize = 10.sp) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF07090E))
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            Text(
                text = if (isHindi) currentScreen.titleHi else currentScreen.titleEn,
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = capabilitySummary,
                color = Color(0xFF94A3B8),
                fontSize = 12.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Screen Switcher for all 14 screens
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F1420)),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = if (isHindi) "AI वीडियो और फेस रिप्लेसमेंट इंजन" else "AI Video & Face Replacement Engine",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = promptText,
                                onValueChange = { promptText = it },
                                label = { Text(if (isHindi) "वीडियो प्रॉम्प्ट या स्क्रिप्ट" else "Video Prompt or Scene Script") },
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf("9:16", "16:9", "1:1").forEach { ratio ->
                                    FilterChip(
                                        selected = aspectRatio == ratio,
                                        onClick = { aspectRatio = ratio },
                                        label = { Text(ratio) }
                                    )
                                }
                                listOf("720p", "1080p").forEach { res ->
                                    FilterChip(
                                        selected = resolution == res,
                                        onClick = { resolution = res },
                                        label = { Text(res) }
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(checked = consentFaceAccepted, onCheckedChange = { consentFaceAccepted = it })
                                Text(
                                    text = if (isHindi) "मेरे पास इस चेहरे और आवाज़ के उपयोग की अनुमति है" else "I confirm explicit consent for face replacement & voice synthesis",
                                    color = Color(0xFFCBD5E1),
                                    fontSize = 12.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    if (consentFaceAccepted) {
                                        currentScreen = AppScreen.PROGRESS
                                        scope.launch {
                                            jobStatus = "Submitting to Rajdev AI Backend..."
                                            jobProgress = 15
                                            val result = RajdevApiClient.submitJob(
                                                JobRequest(
                                                    title = "Android Studio Render",
                                                    prompt = promptText,
                                                    aspectRatio = aspectRatio,
                                                    resolution = resolution,
                                                    voiceName = selectedVoice,
                                                    consentVerified = true
                                                )
                                            )
                                            jobStatus = result
                                            jobProgress = 100
                                        }
                                    }
                                },
                                enabled = consentFaceAccepted,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(if (isHindi) "वीडियो जनरेट करें ($resolution MP4)" else "Generate Video ($resolution MP4)")
                            }
                        }
                    }
                }

                items(AppScreen.entries) { screen ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
                            .clickable { currentScreen = screen }
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${screen.ordinal + 1}. ${if (isHindi) screen.titleHi else screen.titleEn}",
                            color = if (currentScreen == screen) Color(0xFF38BDF8) else Color.White,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = if (currentScreen == screen) "Active" else "Open",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}
