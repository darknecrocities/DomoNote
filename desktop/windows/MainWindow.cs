using System;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace DomoNote
{
    public class MainWindow : Form
    {
        [DllImport("dwmapi.dll", PreserveSig = true)]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        private readonly WebView2 _webView;
        private readonly NotifyIcon _trayIcon;
        private readonly ContextMenuStrip _trayMenu;
        private readonly ToolStripMenuItem _statusMenuItem;
        private readonly System.Windows.Forms.Timer _ollamaTimer;
        private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(1.5) };

        private bool _isOllamaOnline = false;
        private bool _isExiting = false;
        private StaticServer? _staticServer;
        private readonly string[] _args;

        public MainWindow(string[] args)
        {
            _args = args;

            // Form properties
            Text = "DomoNote";
            BackColor = Color.Black;
            ForeColor = Color.White;
            StartPosition = FormStartPosition.CenterScreen;

            var screen = Screen.PrimaryScreen?.WorkingArea ?? new Rectangle(0, 0, 1440, 900);
            int initialWidth = Math.Min(1360, (int)(screen.Width * 0.92));
            int initialHeight = Math.Min(880, (int)(screen.Height * 0.88));
            Size = new Size(initialWidth, initialHeight);
            MinimumSize = new Size(800, 600);

            // Set Window Icon
            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "favicon.ico");
            if (File.Exists(iconPath))
            {
                Icon = new Icon(iconPath);
            }

            // Enable Immersive Dark Mode for Window Title Bar (Windows 10 / 11)
            try
            {
                int useDarkMode = 1;
                DwmSetWindowAttribute(Handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useDarkMode, sizeof(int));
            }
            catch { }

            // Enable KeyPreview for global hotkeys like F11 Fullscreen
            KeyPreview = true;
            KeyDown += (s, e) =>
            {
                if (e.KeyCode == Keys.F11)
                {
                    e.Handled = true;
                    ToggleFullscreen();
                }
                else if (e.KeyCode == Keys.Escape && _isFullscreen)
                {
                    e.Handled = true;
                    ToggleFullscreen();
                }
            };

            // Initialize WebView2
            _webView = new WebView2
            {
                Dock = DockStyle.Fill,
                DefaultBackgroundColor = Color.Black
            };
            Controls.Add(_webView);

            // Context Menu & Tray Setup
            _trayMenu = new ContextMenuStrip
            {
                RenderMode = ToolStripRenderMode.System,
                ShowImageMargin = false
            };

            var headerItem = new ToolStripMenuItem("DomoNote — Your Personal AI Secretary")
            {
                Enabled = false,
                Font = new Font(Font, FontStyle.Bold)
            };
            _trayMenu.Items.Add(headerItem);

            _statusMenuItem = new ToolStripMenuItem("● AI Ready (Ollama)")
            {
                Enabled = false,
                ForeColor = Color.Gray
            };
            _trayMenu.Items.Add(_statusMenuItem);
            _trayMenu.Items.Add(new ToolStripSeparator());

            _trayMenu.Items.Add("Open DomoNote", null, (s, e) => ShowAndActivate());
            _trayMenu.Items.Add("New Note", null, (s, e) => { ShowAndActivate(); NavigateTo("notes", "new"); });
            _trayMenu.Items.Add("Domo Notes Focus Mode", null, (s, e) => { ShowAndActivate(); NavigateTo("zen"); });
            _trayMenu.Items.Add("Start Meeting / Voice Note", null, (s, e) => { ShowAndActivate(); NavigateTo("meetings", "record"); });
            _trayMenu.Items.Add("Schedule & Calendar", null, (s, e) => { ShowAndActivate(); NavigateTo("schedule"); });
            _trayMenu.Items.Add("Screen Recorder Studio", null, (s, e) => { ShowAndActivate(); NavigateTo("studio"); });
            _trayMenu.Items.Add("Toggle Quick Bar", null, (s, e) => ToggleHud());
            _trayMenu.Items.Add(new ToolStripSeparator());
            _trayMenu.Items.Add("Settings...", null, (s, e) => { ShowAndActivate(); NavigateTo("settings"); });
            _trayMenu.Items.Add("About DomoNote", null, (s, e) => { ShowAndActivate(); NavigateTo("about"); });
            _trayMenu.Items.Add(new ToolStripSeparator());
            _trayMenu.Items.Add("Quit DomoNote", null, (s, e) => ExitApplication());

            _trayIcon = new NotifyIcon
            {
                Icon = Icon ?? SystemIcons.Application,
                Text = "DomoNote — Your Personal AI Secretary",
                ContextMenuStrip = _trayMenu,
                Visible = true
            };
            _trayIcon.DoubleClick += (s, e) => ShowAndActivate();

            // Ollama Health Check Timer (matches 8s interval in desktop/main.swift)
            _ollamaTimer = new System.Windows.Forms.Timer { Interval = 8000 };
            _ollamaTimer.Tick += async (s, e) => await CheckOllamaHealthAsync();
            _ollamaTimer.Start();

            // Load Content on startup
            Load += async (s, e) =>
            {
                await InitializeWebViewAsync();
                await CheckOllamaHealthAsync();
            };
        }

        private async Task InitializeWebViewAsync()
        {
            try
            {
                string userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "DomoNote", "WebView2Data"
                );
                var env = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
                await _webView.EnsureCoreWebView2Async(env);

                // Enable autoplay, clipboard, and developer tools
                _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                _webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

                // Grant microphone and screen capture permissions ONLY to local DomoNote origins
                _webView.CoreWebView2.PermissionRequested += (s, e) =>
                {
                    try
                    {
                        var reqUri = new Uri(e.Uri);
                        bool isLocal = reqUri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                                       reqUri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);

                        if (isLocal && (e.PermissionKind == CoreWebView2PermissionKind.Microphone ||
                                        e.PermissionKind == CoreWebView2PermissionKind.Camera ||
                                        e.PermissionKind == CoreWebView2PermissionKind.ClipboardRead))
                        {
                            e.State = CoreWebView2PermissionState.Allow;
                            return;
                        }
                    }
                    catch { }

                    e.State = CoreWebView2PermissionState.Deny;
                };

                // Security: Trap external navigation and open in default OS browser
                _webView.CoreWebView2.NavigationStarting += (s, e) =>
                {
                    if (string.IsNullOrEmpty(e.Uri)) return;
                    try
                    {
                        var uri = new Uri(e.Uri);
                        if (!uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) &&
                            !uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
                        {
                            e.Cancel = true;
                            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                            {
                                FileName = e.Uri,
                                UseShellExecute = true
                            });
                        }
                    }
                    catch { }
                };

                // Security: Handle window.open by delegating to default OS browser
                _webView.CoreWebView2.NewWindowRequested += (s, e) =>
                {
                    e.Handled = true;
                    if (!string.IsNullOrEmpty(e.Uri))
                    {
                        try
                        {
                            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                            {
                                FileName = e.Uri,
                                UseShellExecute = true
                            });
                        }
                        catch { }
                    }
                };

                // Also wire WinForms KeyDown on webView control as fallback
                _webView.KeyDown += (s, e) =>
                {
                    if (e.KeyCode == Keys.F11)
                    {
                        e.Handled = true;
                        ToggleFullscreen();
                    }
                    else if (e.KeyCode == Keys.Escape && _isFullscreen)
                    {
                        e.Handled = true;
                        ToggleFullscreen();
                    }
                };

                // Native WebMessage IPC handler
                _webView.CoreWebView2.WebMessageReceived += (s, e) =>
                {
                    try
                    {
                        string raw = e.TryGetWebMessageAsString();
                        if (raw.Contains("startOllama", StringComparison.OrdinalIgnoreCase) ||
                            raw.Contains("START_OLLAMA", StringComparison.OrdinalIgnoreCase))
                        {
                            StaticServer.TryStartOllama();
                        }
                        else if (raw.Contains("toggleFullscreen", StringComparison.OrdinalIgnoreCase) ||
                                 raw.Contains("TOGGLE_FULLSCREEN", StringComparison.OrdinalIgnoreCase))
                        {
                            ToggleFullscreen();
                        }
                    }
                    catch { }
                };

                string targetUrl = await DetermineTargetUrlAsync();
                _webView.CoreWebView2.Navigate(targetUrl);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error initializing DomoNote Web Interface:\n{ex.Message}\n\nPlease ensure Microsoft Edge WebView2 Runtime is installed.",
                    "DomoNote Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private async Task<string> DetermineTargetUrlAsync()
        {
            bool isDevArg = Array.Exists(_args, a => string.Equals(a, "--dev", StringComparison.OrdinalIgnoreCase));

            if (isDevArg)
            {
                int[] devPorts = { 5173, 5174, 5175, 5176 };
                foreach (int port in devPorts)
                {
                    if (await IsPortOpenAsync(port))
                    {
                        return $"http://127.0.0.1:{port}/";
                    }
                }
            }

            // Check bundled web resources (shipped with DomoNote in ./web or ../dist)
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] possibleWebDirs = {
                Path.Combine(baseDir, "web"),
                Path.Combine(baseDir, "..", "dist"),
                Path.Combine(baseDir, "..", "..", "..", "dist"),
                Path.Combine(baseDir, "dist")
            };

            foreach (var candidate in possibleWebDirs)
            {
                string indexPath = Path.Combine(candidate, "index.html");
                if (File.Exists(indexPath))
                {
                    _staticServer = new StaticServer(candidate, 5892);
                    _staticServer.Start();
                    return _staticServer.BaseUrl;
                }
            }

            // Fallback: check dev ports if static resources not found
            int[] fallbackPorts = { 5173, 5174, 5175, 5176 };
            foreach (int port in fallbackPorts)
            {
                if (await IsPortOpenAsync(port))
                {
                    return $"http://127.0.0.1:{port}/";
                }
            }

            // Default fallback
            return "http://127.0.0.1:5173/";
        }

        private async Task<bool> IsPortOpenAsync(int port)
        {
            try
            {
                using var res = await _http.GetAsync($"http://127.0.0.1:{port}/");
                return res.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        private async Task CheckOllamaHealthAsync()
        {
            try
            {
                var res = await _http.GetAsync("http://127.0.0.1:11434/api/tags");
                bool online = res.IsSuccessStatusCode;
                if (_isOllamaOnline != online)
                {
                    _isOllamaOnline = online;
                    _statusMenuItem.Text = online ? "● AI Active (Ollama)" : "● AI Ready (Ollama Offline)";
                    _statusMenuItem.ForeColor = online ? Color.ForestGreen : Color.Gray;
                }
            }
            catch
            {
                if (_isOllamaOnline)
                {
                    _isOllamaOnline = false;
                    _statusMenuItem.Text = "● AI Ready (Ollama Offline)";
                    _statusMenuItem.ForeColor = Color.Gray;
                }
            }
        }

        public void ShowAndActivate()
        {
            Show();
            if (WindowState == FormWindowState.Minimized)
            {
                WindowState = FormWindowState.Normal;
            }
            BringToFront();
            Activate();
        }

        public void NavigateTo(string view, string? action = null)
        {
            if (_webView.CoreWebView2 == null) return;
            string actionScript = string.IsNullOrEmpty(action) ? "" : $", action: '{action}'";
            string script = $"window.dispatchEvent(new CustomEvent('domonote:navigate', {{ detail: {{ view: '{view}'{actionScript} }} }}))";
            _webView.CoreWebView2.ExecuteScriptAsync(script);
        }

        public void ToggleHud()
        {
            if (_webView.CoreWebView2 == null) return;
            _webView.CoreWebView2.ExecuteScriptAsync("window.dispatchEvent(new CustomEvent('domonote:toggle-hud'))");
        }

        private bool _isFullscreen = false;
        private FormWindowState _previousWindowState = FormWindowState.Normal;
        private FormBorderStyle _previousBorderStyle = FormBorderStyle.Sizable;

        public void ToggleFullscreen()
        {
            if (InvokeRequired)
            {
                Invoke(new Action(ToggleFullscreen));
                return;
            }

            if (!_isFullscreen)
            {
                _previousWindowState = WindowState;
                _previousBorderStyle = FormBorderStyle;
                FormBorderStyle = FormBorderStyle.None;
                WindowState = FormWindowState.Normal;
                WindowState = FormWindowState.Maximized;
                _isFullscreen = true;
            }
            else
            {
                FormBorderStyle = _previousBorderStyle;
                WindowState = _previousWindowState;
                _isFullscreen = false;
            }
        }

        public void ExitApplication()
        {
            _isExiting = true;
            _ollamaTimer.Stop();
            _staticServer?.Dispose();
            _trayIcon.Visible = false;
            Application.Exit();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!_isExiting && e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                Hide();
                _trayIcon.ShowBalloonTip(
                    2000,
                    "DomoNote Running",
                    "DomoNote is still running in the background. Double-click this icon to reopen.",
                    ToolTipIcon.Info
                );
                return;
            }
            base.OnFormClosing(e);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _ollamaTimer?.Dispose();
                _trayIcon?.Dispose();
                _trayMenu?.Dispose();
                _staticServer?.Dispose();
                _http?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
