import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var localServerProcess: Process?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)

        let screenSize = NSScreen.main?.visibleFrame.size ?? CGSize(width: 1440, height: 900)
        let windowWidth: CGFloat = min(1360, screenSize.width * 0.92)
        let windowHeight: CGFloat = min(880, screenSize.height * 0.88)

        let rect = NSRect(
            x: (screenSize.width - windowWidth) / 2,
            y: (screenSize.height - windowHeight) / 2,
            width: windowWidth,
            height: windowHeight
        )

        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "DomoNote"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.backgroundColor = .black
        window.isReleasedWhenClosed = false
        window.center()

        let config = WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        // Enable media capture in WKWebView on macOS 12.3+
        if #available(macOS 12.3, *) {
            config.preferences.isElementFullscreenEnabled = true
        }

        webView = WKWebView(frame: rect, configuration: config)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.autoresizingMask = [.width, .height]
        window.contentView = webView

        // Determine URL to load
        loadDomoNote()

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func loadDomoNote() {
        // If developer specifies --dev, check local dev server ports first
        if CommandLine.arguments.contains("--dev") {
            let devPorts = [5176, 5173, 5174, 5175]
            for port in devPorts {
                if isPortOpen(port: port) {
                    if let url = URL(string: "http://127.0.0.1:\(port)") {
                        webView.load(URLRequest(url: url))
                        return
                    }
                }
            }
        }

        // Primary: Load bundled web resources shipped with DomoNote.app
        if let resourcePath = Bundle.main.resourcePath {
            let webDir = (resourcePath as NSString).appendingPathComponent("web")
            let indexHtml = (webDir as NSString).appendingPathComponent("index.html")
            if FileManager.default.fileExists(atPath: indexHtml) {
                let serverPort = 5892
                startStaticServer(dir: webDir, port: serverPort)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    if let url = URL(string: "http://127.0.0.1:\(serverPort)") {
                        self.webView.load(URLRequest(url: url))
                    }
                }
                return
            }
        }

        // Fallback: Check dev server ports if bundled web not found
        let ports = [5176, 5173, 5174, 5175]
        for port in ports {
            if isPortOpen(port: port) {
                if let url = URL(string: "http://127.0.0.1:\(port)") {
                    webView.load(URLRequest(url: url))
                    return
                }
            }
        }
    }

    func isPortOpen(port: Int) -> Bool {
        let url = URL(string: "http://127.0.0.1:\(port)")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 0.3
        request.httpMethod = "HEAD"
        let semaphore = DispatchSemaphore(value: 0)
        var isOpen = false

        let task = URLSession.shared.dataTask(with: request) { _, response, _ in
            if let http = response as? HTTPURLResponse, http.statusCode < 500 {
                isOpen = true
            }
            semaphore.signal()
        }
        task.resume()
        _ = semaphore.wait(timeout: .now() + 0.4)
        return isOpen
    }

    func startStaticServer(dir: String, port: Int) {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/usr/bin/python3")
        p.arguments = ["-m", "http.server", String(port), "--directory", dir, "--bind", "127.0.0.1"]
        p.standardOutput = FileHandle.nullDevice
        p.standardError = FileHandle.nullDevice
        try? p.run()
        self.localServerProcess = p
    }

    @available(macOS 12.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        localServerProcess?.terminate()
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        localServerProcess?.terminate()
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
