using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using Microsoft.Win32;

namespace DomoNote.Setup
{
    public static class InstallerEngine
    {
        public static string DefaultInstallDir => Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Programs", "DomoNote"
        );

        public static void ExecuteInstall(string? targetDir, Action<string, int>? progress = null)
        {
            string installDir = string.IsNullOrWhiteSpace(targetDir) ? DefaultInstallDir : targetDir;

            // 1. Terminate any running DomoNote instances (including tray/background)
            TerminateRunningInstances(installDir, progress);

            progress?.Invoke($"Preparing installation directory: {installDir}", 15);
            Directory.CreateDirectory(installDir);

            progress?.Invoke("Extracting application bundle...", 25);
            ExtractBundle(installDir, progress);

            progress?.Invoke("Creating Desktop shortcut with official icon...", 60);
            CreateDesktopShortcut(installDir);

            progress?.Invoke("Creating Start Menu shortcut...", 75);
            CreateStartMenuShortcut(installDir);

            progress?.Invoke("Creating uninstaller and registering in Windows Settings...", 85);
            CreateUninstaller(installDir);
            RegisterWindowsUninstall(installDir);

            progress?.Invoke("Checking local Ollama service...", 95);
            CheckOllamaStatus();

            progress?.Invoke("Installation completed successfully!", 100);
        }

        public static void TerminateRunningInstances(string installDir, Action<string, int>? progress = null)
        {
            try
            {
                progress?.Invoke("Checking for running DomoNote instances...", 5);

                var running = Process.GetProcessesByName("DomoNote");
                if (running.Length > 0)
                {
                    progress?.Invoke("Closing running DomoNote instance to allow reinstall/update...", 8);
                    foreach (var p in running)
                    {
                        try
                        {
                            p.CloseMainWindow();
                        }
                        catch { }
                    }

                    // Wait up to 1.5 seconds for graceful exit
                    for (int i = 0; i < 15; i++)
                    {
                        if (Process.GetProcessesByName("DomoNote").Length == 0) break;
                        System.Threading.Thread.Sleep(100);
                    }

                    // Force terminate any remaining instances
                    foreach (var p in Process.GetProcessesByName("DomoNote"))
                    {
                        try
                        {
                            p.Kill();
                            p.WaitForExit(2000);
                        }
                        catch { }
                    }
                }

                // Guaranteed fallback taskkill
                try
                {
                    using var proc = Process.Start(new ProcessStartInfo
                    {
                        FileName = "taskkill",
                        Arguments = "/f /im DomoNote.exe",
                        CreateNoWindow = true,
                        UseShellExecute = false
                    });
                    proc?.WaitForExit(2000);
                }
                catch { }

                // Terminate any helper/WebView2 processes whose executable is inside installDir
                try
                {
                    foreach (var p in Process.GetProcesses())
                    {
                        try
                        {
                            string? fn = p.MainModule?.FileName;
                            if (!string.IsNullOrEmpty(fn) && fn.StartsWith(installDir, StringComparison.OrdinalIgnoreCase))
                            {
                                p.Kill();
                                p.WaitForExit(1000);
                            }
                        }
                        catch { }
                    }
                }
                catch { }

                // Brief pause so Windows OS kernel releases all file locks
                System.Threading.Thread.Sleep(500);
            }
            catch (Exception ex)
            {
                Trace.WriteLine($"[Process Termination Warning] {ex.Message}");
            }
        }

        private static void ExtractBundle(string destDir, Action<string, int>? progress = null)
        {
            var asm = Assembly.GetExecutingAssembly();
            string? resourceName = asm.GetManifestResourceNames()
                .FirstOrDefault(n => n.EndsWith("bundle.zip", StringComparison.OrdinalIgnoreCase));

            if (resourceName != null)
            {
                using var stream = asm.GetManifestResourceStream(resourceName);
                if (stream != null)
                {
                    using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
                    ExtractArchiveSafely(archive, destDir, progress);
                    return;
                }
            }

            // Fallback: Check adjacent bundle.zip
            string adjacentBundle = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bundle.zip");
            if (File.Exists(adjacentBundle))
            {
                using var fileStream = File.OpenRead(adjacentBundle);
                using var archive = new ZipArchive(fileStream, ZipArchiveMode.Read);
                ExtractArchiveSafely(archive, destDir, progress);
                return;
            }

            throw new InvalidOperationException("Embedded resource 'bundle.zip' was not found in the installer binary.");
        }

        private static void ExtractArchiveSafely(ZipArchive archive, string destDir, Action<string, int>? progress = null)
        {
            int total = archive.Entries.Count;
            int count = 0;

            foreach (var entry in archive.Entries)
            {
                count++;
                if (string.IsNullOrEmpty(entry.Name) && (entry.FullName.EndsWith("/") || entry.FullName.EndsWith("\\")))
                {
                    string dir = Path.Combine(destDir, entry.FullName);
                    Directory.CreateDirectory(dir);
                    continue;
                }

                string targetPath = Path.Combine(destDir, entry.FullName);
                string? targetDir = Path.GetDirectoryName(targetPath);
                if (!string.IsNullOrEmpty(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                WriteEntryWithRetry(entry, targetPath);

                if (count % 15 == 0 || count == total)
                {
                    int pct = 25 + (int)((count / (float)total) * 35);
                    progress?.Invoke($"Extracting: {entry.Name}", pct);
                }
            }

            // Clean up any temporary backup files created during locked file replacement
            CleanTemporaryFiles(destDir);
        }

        private static void WriteEntryWithRetry(ZipArchiveEntry entry, string targetPath)
        {
            const int maxRetries = 5;
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    // Normal extraction with overwrite
                    entry.ExtractToFile(targetPath, overwrite: true);
                    return;
                }
                catch (IOException) when (attempt < maxRetries)
                {
                    // If file is locked, try renaming the locked file to a temporary backup name.
                    // On Windows NTFS, renaming an in-use file is allowed, which frees up the original path!
                    try
                    {
                        if (File.Exists(targetPath))
                        {
                            string backupPath = targetPath + ".old." + Guid.NewGuid().ToString("N");
                            File.Move(targetPath, backupPath);
                            // Now extract to original targetPath
                            entry.ExtractToFile(targetPath, overwrite: true);
                            return;
                        }
                    }
                    catch
                    {
                        // Wait and retry
                        System.Threading.Thread.Sleep(250 * attempt);
                    }
                }
                catch (UnauthorizedAccessException) when (attempt < maxRetries)
                {
                    try
                    {
                        if (File.Exists(targetPath))
                        {
                            File.SetAttributes(targetPath, FileAttributes.Normal);
                        }
                    }
                    catch { }
                    System.Threading.Thread.Sleep(250 * attempt);
                }
            }

            // Final attempt
            entry.ExtractToFile(targetPath, overwrite: true);
        }

        private static void CleanTemporaryFiles(string dir)
        {
            try
            {
                if (!Directory.Exists(dir)) return;
                var oldFiles = Directory.GetFiles(dir, "*.old.*", SearchOption.AllDirectories);
                foreach (var f in oldFiles)
                {
                    try
                    {
                        File.Delete(f);
                    }
                    catch { }
                }
            }
            catch { }
        }

        private static void CreateDesktopShortcut(string installDir)
        {
            string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            string shortcutPath = Path.Combine(desktopDir, "DomoNote.lnk");
            string targetExe = Path.Combine(installDir, "DomoNote.exe");
            string iconLocation = Path.Combine(installDir, "favicon.ico");

            CreateShortcut(shortcutPath, targetExe, iconLocation, "DomoNote — Your Personal AI Secretary");
        }

        private static void CreateStartMenuShortcut(string installDir)
        {
            string startMenuDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.StartMenu),
                "Programs", "DomoNote"
            );
            Directory.CreateDirectory(startMenuDir);

            string shortcutPath = Path.Combine(startMenuDir, "DomoNote.lnk");
            string targetExe = Path.Combine(installDir, "DomoNote.exe");
            string iconLocation = Path.Combine(installDir, "favicon.ico");

            CreateShortcut(shortcutPath, targetExe, iconLocation, "DomoNote — Your Personal AI Secretary");
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string iconPath, string description)
        {
            try
            {
                Type? shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType)!;
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetPath;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                    shortcut.Description = description;
                    if (File.Exists(iconPath))
                    {
                        shortcut.IconLocation = iconPath;
                    }
                    shortcut.Save();
                }
            }
            catch (Exception ex)
            {
                Trace.WriteLine($"[Shortcut Warning] {ex.Message}");
            }
        }

        private static void CreateUninstaller(string installDir)
        {
            string uninstallBat = Path.Combine(installDir, "uninstall.bat");
            string desktopLnk = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "DomoNote.lnk");
            string startMenuLnk = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "DomoNote", "DomoNote.lnk");
            string startMenuFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "DomoNote");

            string uninstallContent = $@"@echo off
title DomoNote Uninstaller
echo ========================================================
echo   Uninstalling DomoNote...
echo ========================================================
taskkill /f /im DomoNote.exe >nul 2>nul
del /f /q ""{desktopLnk}"" 2>nul
del /f /q ""{startMenuLnk}"" 2>nul
rmdir /s /q ""{startMenuFolder}"" 2>nul
reg delete ""HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\DomoNote"" /f >nul 2>nul
echo DomoNote shortcuts and registry entries removed.
echo Removing installation directory...
cd /d ""%USERPROFILE%""
rmdir /s /q ""{installDir}"" 2>nul
echo DomoNote uninstallation complete.
";
            File.WriteAllText(uninstallBat, uninstallContent);
        }

        private static void RegisterWindowsUninstall(string installDir)
        {
            try
            {
                using var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\DomoNote");
                key.SetValue("DisplayName", "DomoNote");
                key.SetValue("DisplayVersion", "1.0.1");
                key.SetValue("Publisher", "darknecrocities");
                key.SetValue("InstallLocation", installDir);
                key.SetValue("DisplayIcon", Path.Combine(installDir, "favicon.ico"));
                key.SetValue("UninstallString", $"\"{Path.Combine(installDir, "uninstall.bat")}\"");
                key.SetValue("URLInfoAbout", "https://github.com/darknecrocities/DomoNote");
                key.SetValue("HelpLink", "https://github.com/darknecrocities/DomoNote");
            }
            catch (Exception ex)
            {
                Trace.WriteLine($"[Registry Warning] {ex.Message}");
            }
        }

        public static bool CheckOllamaStatus()
        {
            try
            {
                using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(1.5) };
                var res = client.GetAsync("http://127.0.0.1:11434/api/tags").GetAwaiter().GetResult();
                return res.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public static void LaunchInstalledApp(string installDir)
        {
            string exePath = Path.Combine(installDir, "DomoNote.exe");
            if (File.Exists(exePath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = exePath,
                    WorkingDirectory = installDir,
                    UseShellExecute = true
                });
            }
        }
    }
}
