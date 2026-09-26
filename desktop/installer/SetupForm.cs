using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DomoNote.Setup
{
    public class SetupForm : Form
    {
        [DllImport("dwmapi.dll", PreserveSig = true)]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        private readonly Label _statusLabel;
        private readonly ProgressBar _progressBar;
        private readonly ListBox _logBox;
        private readonly CheckBox _launchCheckBox;
        private readonly Button _installButton;
        private readonly Button _closeButton;
        private readonly string _installDir;

        public SetupForm()
        {
            _installDir = InstallerEngine.DefaultInstallDir;

            Text = "DomoNote Setup — Personal AI Secretary";
            BackColor = Color.FromArgb(20, 20, 24);
            ForeColor = Color.White;
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            Size = new Size(580, 440);

            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "favicon.ico");
            if (File.Exists(iconPath))
            {
                Icon = new Icon(iconPath);
            }

            try
            {
                int useDarkMode = 1;
                DwmSetWindowAttribute(Handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useDarkMode, sizeof(int));
            }
            catch { }

            // Header Panel
            var headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 80,
                BackColor = Color.FromArgb(12, 12, 16)
            };
            Controls.Add(headerPanel);

            var titleLabel = new Label
            {
                Text = "DomoNote Desktop Setup",
                Font = new Font("Segoe UI", 13, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(20, 16),
                AutoSize = true
            };
            headerPanel.Controls.Add(titleLabel);

            var subtitleLabel = new Label
            {
                Text = "Your Local-First AI Secretary for Notes, Meetings, and Documents",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                ForeColor = Color.FromArgb(160, 160, 175),
                Location = new Point(21, 42),
                AutoSize = true
            };
            headerPanel.Controls.Add(subtitleLabel);

            bool isAlreadyInstalled = File.Exists(Path.Combine(_installDir, "DomoNote.exe"));

            // Body Controls
            _statusLabel = new Label
            {
                Text = isAlreadyInstalled
                    ? "Existing installation detected. Ready to reinstall / update."
                    : "Ready to install DomoNote to: " + _installDir,
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                ForeColor = Color.FromArgb(200, 200, 210),
                Location = new Point(20, 95),
                Size = new Size(525, 25)
            };
            Controls.Add(_statusLabel);

            _progressBar = new ProgressBar
            {
                Location = new Point(20, 125),
                Size = new Size(525, 20),
                Style = ProgressBarStyle.Continuous,
                Value = 0
            };
            Controls.Add(_progressBar);

            _logBox = new ListBox
            {
                Location = new Point(20, 155),
                Size = new Size(525, 170),
                BackColor = Color.FromArgb(14, 14, 18),
                ForeColor = Color.FromArgb(180, 180, 195),
                Font = new Font("Consolas", 8.5f),
                BorderStyle = BorderStyle.FixedSingle,
                IntegralHeight = false
            };
            Controls.Add(_logBox);

            _launchCheckBox = new CheckBox
            {
                Text = "Launch DomoNote after installation finishes",
                Checked = true,
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9),
                Location = new Point(20, 335),
                AutoSize = true
            };
            Controls.Add(_launchCheckBox);

            // Bottom Buttons
            _installButton = new Button
            {
                Text = isAlreadyInstalled ? "Reinstall / Update" : "Install Now",
                Location = new Point(320, 360),
                Size = new Size(120, 32),
                BackColor = Color.White,
                ForeColor = Color.Black,
                Font = new Font("Segoe UI", 9, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat
            };
            _installButton.FlatAppearance.BorderSize = 0;
            _installButton.Click += async (s, e) => await HandleInstallButtonClickAsync();
            Controls.Add(_installButton);

            _closeButton = new Button
            {
                Text = "Cancel",
                Location = new Point(448, 360),
                Size = new Size(95, 32),
                BackColor = Color.FromArgb(40, 40, 48),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9),
                FlatStyle = FlatStyle.Flat
            };
            _closeButton.FlatAppearance.BorderSize = 0;
            _closeButton.Click += (s, e) => Close();
            Controls.Add(_closeButton);

            if (isAlreadyInstalled)
            {
                Log("Existing DomoNote installation detected. Click 'Reinstall / Update' to safely update.");
            }
            else
            {
                Log("Ready. Click 'Install Now' to begin.");
            }
        }

        private bool _isCompleted = false;

        private void Log(string msg)
        {
            _logBox.Items.Add($"[{DateTime.Now:HH:mm:ss}] {msg}");
            _logBox.TopIndex = _logBox.Items.Count - 1;
        }

        private async Task HandleInstallButtonClickAsync()
        {
            if (_isCompleted)
            {
                FinishAndClose();
                return;
            }

            await StartInstallationAsync();
        }

        private async Task StartInstallationAsync()
        {
            _installButton.Enabled = false;
            _closeButton.Enabled = false;

            try
            {
                await Task.Run(() =>
                {
                    InstallerEngine.ExecuteInstall(_installDir, (msg, pct) =>
                    {
                        Invoke(() =>
                        {
                            _progressBar.Value = Math.Min(100, Math.Max(0, pct));
                            _statusLabel.Text = msg;
                            Log(msg);
                        });
                    });
                });

                _isCompleted = true;
                _statusLabel.Text = "Installation Completed Successfully!";
                _statusLabel.ForeColor = Color.LightGreen;

                _installButton.Text = "Finish";
                _installButton.Enabled = true;

                _closeButton.Text = "Close";
                _closeButton.Enabled = true;
            }
            catch (Exception ex)
            {
                Log("ERROR: " + ex.Message);
                _statusLabel.Text = "Installation failed: " + ex.Message;
                _statusLabel.ForeColor = Color.Salmon;
                _closeButton.Enabled = true;
                _installButton.Text = "Retry";
                _installButton.Enabled = true;
            }
        }

        private void FinishAndClose()
        {
            if (_launchCheckBox.Checked)
            {
                InstallerEngine.LaunchInstalledApp(_installDir);
            }
            Application.Exit();
        }
    }
}
