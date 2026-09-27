@echo off
title CODEtoFIGMA Vue UI
echo Starting Vue UI Dev Server at http://127.0.0.1:4174 ...
cd /d "%~dp0.."
start http://127.0.0.1:4174
call pnpm dev:vue
