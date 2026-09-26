using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace DomoNote
{
    public class StaticServer : IDisposable
    {
        private readonly HttpListener _listener;
        private readonly string _rootDirectory;
        private readonly int _port;
        private CancellationTokenSource? _cts;
        private Task? _listenerTask;

        private static readonly Dictionary<string, string> MimeTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            { ".html", "text/html; charset=utf-8" },
            { ".htm", "text/html; charset=utf-8" },
            { ".js", "application/javascript; charset=utf-8" },
            { ".mjs", "application/javascript; charset=utf-8" },
            { ".css", "text/css; charset=utf-8" },
            { ".json", "application/json; charset=utf-8" },
            { ".png", "image/png" },
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".gif", "image/gif" },
            { ".webp", "image/webp" },
            { ".svg", "image/svg+xml" },
            { ".ico", "image/x-icon" },
            { ".wasm", "application/wasm" },
            { ".txt", "text/plain; charset=utf-8" },
            { ".mp3", "audio/mpeg" },
            { ".wav", "audio/wav" },
            { ".ogg", "audio/ogg" },
            { ".webm", "video/webm" }
        };

        public int Port => _port;
        public string BaseUrl => $"http://127.0.0.1:{_port}/";

        public StaticServer(string rootDirectory, int port = 5892)
        {
            _rootDirectory = Path.GetFullPath(rootDirectory);
            _port = port;
            _listener = new HttpListener();
            _listener.Prefixes.Add($"http://127.0.0.1:{_port}/");
        }

        public void Start()
        {
            try
            {
                _listener.Start();
                _cts = new CancellationTokenSource();
                _listenerTask = Task.Run(() => ListenLoop(_cts.Token));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[StaticServer] Failed to start: {ex.Message}");
            }
        }

        private async Task ListenLoop(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested && _listener.IsListening)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    _ = Task.Run(() => HandleRequest(context));
                }
                catch (HttpListenerException) when (ct.IsCancellationRequested || !_listener.IsListening)
                {
                    break;
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[StaticServer] Context error: {ex.Message}");
                }
            }
        }

        private void HandleRequest(HttpListenerContext context)
        {
            var req = context.Request;
            var res = context.Response;

            // Security: Restrict CORS to local origins only (reject wildcard '*')
            string? origin = req.Headers["Origin"];
            if (!string.IsNullOrEmpty(origin))
            {
                try
                {
                    var originUri = new Uri(origin);
                    if (originUri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                        originUri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
                    {
                        res.Headers.Add("Access-Control-Allow-Origin", origin);
                        res.Headers.Add("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
                        res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Range");
                    }
                }
                catch { }
            }

            // Security Response Headers
            res.Headers.Add("X-Content-Type-Options", "nosniff");
            res.Headers.Add("X-Frame-Options", "DENY");

            if (req.HttpMethod == "OPTIONS")
            {
                res.StatusCode = 204;
                res.Close();
                return;
            }

            // Automated Local AI launcher endpoint for Windows
            if (req.HttpMethod == "POST" && (req.Url?.AbsolutePath.Equals("/api/ollama/start", StringComparison.OrdinalIgnoreCase) ?? false))
            {
                bool started = TryStartOllama();
                res.StatusCode = started ? 200 : 500;
                res.ContentType = "application/json; charset=utf-8";
                string json = started
                    ? "{\"status\":\"started\",\"message\":\"Ollama service started successfully\"}"
                    : "{\"status\":\"failed\",\"message\":\"Ollama binary not found on this system\"}";
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(json);
                res.ContentLength64 = bytes.Length;
                res.OutputStream.Write(bytes, 0, bytes.Length);
                res.Close();
                return;
            }

            try
            {
                string rawPath = req.Url?.AbsolutePath.TrimStart('/') ?? "";
                if (string.IsNullOrEmpty(rawPath))
                {
                    rawPath = "index.html";
                }

                // Security: Resolve full path and prevent path traversal beyond root directory
                string combinedPath = Path.Combine(_rootDirectory, rawPath.Replace('/', Path.DirectorySeparatorChar));
                string fullPath = Path.GetFullPath(combinedPath);

                string normalizedRoot = _rootDirectory.EndsWith(Path.DirectorySeparatorChar.ToString())
                    ? _rootDirectory
                    : _rootDirectory + Path.DirectorySeparatorChar;

                if (!fullPath.StartsWith(normalizedRoot, StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(fullPath, _rootDirectory, StringComparison.OrdinalIgnoreCase))
                {
                    res.StatusCode = 403;
                    byte[] forbidden = "Forbidden: Access Denied"u8.ToArray();
                    res.ContentLength64 = forbidden.Length;
                    res.OutputStream.Write(forbidden, 0, forbidden.Length);
                    res.Close();
                    return;
                }

                string filePath = fullPath;
                if (Directory.Exists(filePath))
                {
                    filePath = Path.Combine(filePath, "index.html");
                }

                // SPA Fallback: If file doesn't exist, serve index.html
                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(_rootDirectory, "index.html");
                }

                if (!File.Exists(filePath))
                {
                    res.StatusCode = 404;
                    byte[] notFound = "File Not Found"u8.ToArray();
                    res.ContentLength64 = notFound.Length;
                    res.OutputStream.Write(notFound, 0, notFound.Length);
                    res.Close();
                    return;
                }

                string ext = Path.GetExtension(filePath);
                res.ContentType = MimeTypes.TryGetValue(ext, out var mime) ? mime : "application/octet-stream";

                byte[] bytes = File.ReadAllBytes(filePath);
                res.ContentLength64 = bytes.Length;
                res.StatusCode = 200;

                if (req.HttpMethod != "HEAD")
                {
                    res.OutputStream.Write(bytes, 0, bytes.Length);
                }
                res.Close();
            }
            catch (Exception ex)
            {
                try
                {
                    res.StatusCode = 500;
                    byte[] err = System.Text.Encoding.UTF8.GetBytes(ex.Message);
                    res.ContentLength64 = err.Length;
                    res.OutputStream.Write(err, 0, err.Length);
                    res.Close();
                }
                catch { }
            }
        public static bool TryStartOllama()
        {
            try
            {
                // 1. Check if Ollama is already responding
                using (var http = new System.Net.Http.HttpClient { Timeout = TimeSpan.FromSeconds(1) })
                {
                    try
                    {
                        var task = http.GetAsync("http://127.0.0.1:11434/api/tags");
                        if (task.Wait(1000) && task.Result.IsSuccessStatusCode)
                        {
                            return true;
                        }
                    }
                    catch { }
                }

                // 2. Search common Windows installation paths for Ollama
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);

                string[] candidates = {
                    Path.Combine(localAppData, "Programs", "Ollama", "ollama app.exe"),
                    Path.Combine(localAppData, "Programs", "Ollama", "ollama.exe"),
                    Path.Combine(programFiles, "Ollama", "ollama.exe"),
                    Path.Combine(programFiles, "Ollama", "ollama app.exe")
                };

                foreach (var path in candidates)
                {
                    if (File.Exists(path))
                    {
                        var psi = new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = path,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        };
                        if (path.EndsWith("ollama.exe", StringComparison.OrdinalIgnoreCase))
                        {
                            psi.Arguments = "serve";
                        }
                        psi.Environment["OLLAMA_ORIGINS"] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5892,http://127.0.0.1:5892,https://domonote.vercel.app";
                        System.Diagnostics.Process.Start(psi);
                        return true;
                    }
                }

                // 3. Fallback: try running "ollama serve" via PATH
                var pathPsi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "ollama",
                    Arguments = "serve",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                pathPsi.Environment["OLLAMA_ORIGINS"] = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5892,http://127.0.0.1:5892,https://domonote.vercel.app";
                System.Diagnostics.Process.Start(pathPsi);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public void Stop()
        {
            try
            {
                _cts?.Cancel();
                if (_listener.IsListening)
                {
                    _listener.Stop();
                }
            }
            catch { }
        }

        public void Dispose()
        {
            Stop();
            try { _listener.Close(); } catch { }
        }
    }
}
