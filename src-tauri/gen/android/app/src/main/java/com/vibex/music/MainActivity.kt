package com.vibex.music

import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import app.tauri.plugin.PluginManager

class MainActivity : app.tauri.TauriActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Ensure webview properly delegates camera and microphone permission prompts
        val webView = findViewById<WebView>(android.R.id.content)
        webView?.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let {
                    // Automatically grant camera and audio capture if user granted app runtime permissions
                    it.grant(it.resources)
                }
            }
        }
    }
}
