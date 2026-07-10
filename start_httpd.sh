#!/bin/bash
# Start the Apache reverse proxy that fronts the Marathon Training app on
# port 80, so it's reachable at http://<your-mac>.local (no port in the URL).
#
# The proxy config itself lives in deploy/marathon.apache.conf and is installed
# to /etc/apache2/other/marathon.conf (auto-loaded by macOS's httpd.conf). This
# script is just a documented, runnable reference for the apachectl commands.
#
# Requires sudo — binding port 80 is privileged — so it will prompt for your
# password.
#
# Other useful commands (for reference):
#   sudo apachectl stop          # stop the proxy
#   sudo apachectl restart       # restart after a config change
#   sudo apachectl configtest    # validate config without (re)starting
#
#   # Re-install the proxy config (e.g. after a macOS update reset /etc):
#   sudo cp deploy/marathon.apache.conf /etc/apache2/other/marathon.conf
#
#   # Make Apache start automatically on every boot (one-time):
#   sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist
set -e

echo "Validating Apache config..."
sudo apachectl configtest

if pgrep -x httpd >/dev/null; then
  echo "Apache already running — restarting..."
  sudo apachectl restart
else
  echo "Starting Apache..."
  sudo apachectl start
fi

echo "Done. App should be reachable at http://$(scutil --get LocalHostName 2>/dev/null || hostname -s).local (proxy -> :8000)."
