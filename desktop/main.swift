import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKUIDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var localServerProcess: Process?
    var statusItem: NSStatusItem!
    var isOllamaOnline: Bool = false
    var ollamaHealthTimer: Timer?

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
        window.delegate = self
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

        // Setup topbar status item (macOS Menu Bar HUD like Ollama)
        setupStatusBar()

        // Determine URL to load
        loadDomoNote()

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // MARK: - macOS Topbar Menu Bar HUD (Same setup as Ollama)

    func setupStatusBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.image = createStatusBarIcon()
            button.imagePosition = .imageOnly
            button.toolTip = "DomoNote — Your Personal AI Secretary"
        }

        updateMenu()

        // Periodically monitor local Ollama server health to keep status synced
        ollamaHealthTimer = Timer.scheduledTimer(withTimeInterval: 8.0, repeats: true) { [weak self] _ in
            self?.checkOllamaHealth()
        }
        checkOllamaHealth()
    }

    func createStatusBarIcon() -> NSImage {
        let size = NSSize(width: 18, height: 18)
        let image = NSImage(size: size, flipped: false) { rect in
            guard let ctx = NSGraphicsContext.current?.cgContext else { return false }
            ctx.saveGState()

            let color = NSColor.black.cgColor
            ctx.setFillColor(color)
            ctx.setStrokeColor(color)

            // 1. Left Ear
            let leftEar = CGRect(x: 1.5, y: 11.5, width: 4.8, height: 4.8)
            ctx.fillEllipse(in: leftEar)

            // 2. Right Ear
            let rightEar = CGRect(x: 11.7, y: 11.5, width: 4.8, height: 4.8)
            ctx.fillEllipse(in: rightEar)

            // 3. Head Outline (Rounded pill / face)
            let headRect = CGRect(x: 2.0, y: 2.0, width: 14.0, height: 12.0)
            let headPath = CGPath(roundedRect: headRect, cornerWidth: 5.5, cornerHeight: 5.5, transform: nil)
            ctx.addPath(headPath)
            ctx.setLineWidth(1.6)
            ctx.strokePath()

            // 4. Eye patches
            let leftEye = CGRect(x: 4.5, y: 7.2, width: 3.2, height: 3.8)
            let rightEye = CGRect(x: 10.3, y: 7.2, width: 3.2, height: 3.8)
            ctx.fillEllipse(in: leftEye)
            ctx.fillEllipse(in: rightEye)

            // 5. Cute nose
            let nose = CGRect(x: 8.1, y: 4.8, width: 1.8, height: 1.4)
            ctx.fillEllipse(in: nose)

            ctx.restoreGState()
            return true
        }
        image.isTemplate = true
        return image
    }

    func updateMenu() {
        let menu = NSMenu()
        menu.autoenablesItems = false

        // Custom Glassmorphic Header View
        let headerItem = NSMenuItem()
        headerItem.view = createHeaderView()
        menu.addItem(headerItem)

        menu.addItem(NSMenuItem.separator())

        // Quick Actions
        let openItem = NSMenuItem(title: "Open DomoNote", action: #selector(openDomoNoteWindow), keyEquivalent: "o")
        openItem.target = self
        menu.addItem(openItem)

        let newNoteItem = NSMenuItem(title: "New Note", action: #selector(menuNewNote), keyEquivalent: "n")
        newNoteItem.target = self
        menu.addItem(newNoteItem)

        let focusItem = NSMenuItem(title: "Domo Notes Focus Mode", action: #selector(menuFocusMode), keyEquivalent: "N")
        focusItem.keyEquivalentModifierMask = [.command, .shift]
        focusItem.target = self
        menu.addItem(focusItem)

        let meetingItem = NSMenuItem(title: "Start Meeting / Voice Note", action: #selector(menuStartMeeting), keyEquivalent: "m")
        meetingItem.target = self
        menu.addItem(meetingItem)

        let scheduleItem = NSMenuItem(title: "Schedule & Calendar", action: #selector(menuSchedule), keyEquivalent: "S")
        scheduleItem.keyEquivalentModifierMask = [.command, .shift]
        scheduleItem.target = self
        menu.addItem(scheduleItem)

        let studioItem = NSMenuItem(title: "Screen Recorder Studio", action: #selector(menuStudio), keyEquivalent: "R")
        studioItem.keyEquivalentModifierMask = [.command, .shift]
        studioItem.target = self
        menu.addItem(studioItem)

        let hudItem = NSMenuItem(title: "Toggle Quick Bar", action: #selector(menuToggleHud), keyEquivalent: "H")
        hudItem.keyEquivalentModifierMask = [.command, .shift]
        hudItem.target = self
        menu.addItem(hudItem)

        menu.addItem(NSMenuItem.separator())

        // System / Settings
        let settingsItem = NSMenuItem(title: "Settings...", action: #selector(menuSettings), keyEquivalent: ",")
        settingsItem.target = self
        menu.addItem(settingsItem)

        let aboutItem = NSMenuItem(title: "About DomoNote", action: #selector(menuAbout), keyEquivalent: "")
        aboutItem.target = self
        menu.addItem(aboutItem)

        menu.addItem(NSMenuItem.separator())

        // Quit
        let quitItem = NSMenuItem(title: "Quit DomoNote", action: #selector(menuQuit), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)

        statusItem.menu = menu
    }

    func createHeaderView() -> NSView {
        let headerView = NSView(frame: NSRect(x: 0, y: 0, width: 250, height: 54))

        // Title
        let titleLabel = NSTextField(frame: NSRect(x: 14, y: 27, width: 140, height: 18))
        titleLabel.stringValue = "DomoNote"
        titleLabel.font = NSFont.boldSystemFont(ofSize: 13)
        titleLabel.textColor = NSColor.labelColor
        titleLabel.isBezeled = false
        titleLabel.drawsBackground = false
        titleLabel.isEditable = false
        titleLabel.isSelectable = false
        headerView.addSubview(titleLabel)

        // Subtitle
        let subtitleLabel = NSTextField(frame: NSRect(x: 14, y: 9, width: 220, height: 15))
        subtitleLabel.stringValue = "Your Personal AI Secretary"
        subtitleLabel.font = NSFont.systemFont(ofSize: 11)
        subtitleLabel.textColor = NSColor.secondaryLabelColor
        subtitleLabel.isBezeled = false
        subtitleLabel.drawsBackground = false
        subtitleLabel.isEditable = false
        subtitleLabel.isSelectable = false
        headerView.addSubview(subtitleLabel)

        // Status Indicator Pill (Right aligned)
        let statusPill = NSTextField(frame: NSRect(x: 140, y: 28, width: 96, height: 16))
        statusPill.stringValue = isOllamaOnline ? "● AI Active" : "● AI Ready"
        statusPill.alignment = .right
        statusPill.font = NSFont.monospacedSystemFont(ofSize: 10, weight: .semibold)
        statusPill.textColor = isOllamaOnline ? NSColor.systemGreen : NSColor.secondaryLabelColor
        statusPill.isBezeled = false
        statusPill.drawsBackground = false
        statusPill.isEditable = false
        statusPill.isSelectable = false
        headerView.addSubview(statusPill)

        return headerView
    }

    func checkOllamaHealth() {
        guard let url = URL(string: "http://127.0.0.1:11434/api/tags") else { return }
        var req = URLRequest(url: url)
        req.timeoutInterval = 1.0
        req.httpMethod = "GET"
        let task = URLSession.shared.dataTask(with: req) { [weak self] _, response, _ in
            let online = (response as? HTTPURLResponse)?.statusCode == 200
            DispatchQueue.main.async {
                if self?.isOllamaOnline != online {
                    self?.isOllamaOnline = online
                    self?.updateMenu()
                }
            }
        }
        task.resume()
    }

    // MARK: - Menu Actions

    @objc func openDomoNoteWindow() {
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func menuNewNote() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'notes', action: 'new' } }))",
            completionHandler: nil
        )
    }

    @objc func menuFocusMode() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'zen' } }))",
            completionHandler: nil
        )
    }

    @objc func menuStartMeeting() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'meetings', action: 'record' } }))",
            completionHandler: nil
        )
    }

    @objc func menuSchedule() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'schedule' } }))",
            completionHandler: nil
        )
    }

    @objc func menuStudio() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'studio' } }))",
            completionHandler: nil
        )
    }

    @objc func menuToggleHud() {
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:toggle-hud'))",
            completionHandler: nil
        )
    }

    @objc func menuSettings() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'settings' } }))",
            completionHandler: nil
        )
    }

    @objc func menuAbout() {
        openDomoNoteWindow()
        webView.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('domonote:navigate', { detail: { view: 'about' } }))",
            completionHandler: nil
        )
    }

    @objc func menuQuit() {
        localServerProcess?.terminate()
        NSApp.terminate(nil)
    }

    // MARK: - Navigation & Local Server

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

    // MARK: - Window Delegate (Keep app alive in Menu Bar on close, like Ollama)

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        sender.orderOut(nil)
        return false
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }

    func applicationWillTerminate(_ notification: Notification) {
        ollamaHealthTimer?.invalidate()
        localServerProcess?.terminate()
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
