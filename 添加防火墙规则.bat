@echo off
REM Allow inbound TCP 3000 so other LAN computers can reach the quiz site
netsh advfirewall firewall add rule name="Quiz Site 3000" dir=in action=allow protocol=TCP localport=3000
echo.
echo Firewall rule added. You can close this window.
pause
