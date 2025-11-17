package com.vipistanbultransfer.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();
    WebSettings settings = webView.getSettings();

    // Ensure proper mobile scaling and storage
    settings.setDomStorageEnabled(true);
    settings.setJavaScriptEnabled(true);
    settings.setUseWideViewPort(true);
    settings.setLoadWithOverviewMode(true);

    // Optional improvements for performance on various devices
    settings.setSupportZoom(false);
    settings.setBuiltInZoomControls(false);
    settings.setDisplayZoomControls(false);
  }
}
