using System;
using System.Threading;
using System.Windows.Forms;

namespace DomoNote
{
    internal static class Program
    {
        private static Mutex? _mutex;

        [STAThread]
        static void Main(string[] args)
        {
            const string mutexName = "Global\\DomoNote_Desktop_SingleInstance";
            _mutex = new Mutex(true, mutexName, out bool createdNew);

            if (!createdNew)
            {
                // Another instance is already running
                MessageBox.Show(
                    "DomoNote is already running. Check your system tray (notification area).",
                    "DomoNote",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
                return;
            }

            ApplicationConfiguration.Initialize();
            Application.Run(new MainWindow(args));

            _mutex.ReleaseMutex();
        }
    }
}
