import os
import socket
import subprocess
import time
from flask import Flask, request, render_template_string, redirect

# 關閉 Flask 的煩人日誌
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)

UI_HTML = """
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity 遠端橋接器</title>
    <style>
        :root { --bg: #0f0f0f; --text: #ffffff; --primary: #00e676; --card: #1e1e1e; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; }
        .container { width: 100%; max-width: 450px; background: var(--card); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { font-size: 24px; margin-bottom: 25px; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 10px; }
        textarea { width: 100%; height: 180px; background: #2c2c2c; border: 2px solid #333; color: #fff; padding: 15px; border-radius: 12px; font-size: 16px; box-sizing: border-box; transition: border-color 0.3s; outline: none; }
        textarea:focus { border-color: var(--primary); }
        button { background: var(--primary); color: #000; border: none; padding: 16px; border-radius: 12px; font-weight: bold; font-size: 18px; margin-top: 20px; width: 100%; cursor: pointer; transition: all 0.2s; }
        button:active { transform: scale(0.96); background: #00c853; }
        .status { margin-top: 20px; padding: 12px; border-radius: 10px; font-size: 14px; animation: fadeIn 0.3s; }
        .success { background: rgba(0, 230, 118, 0.15); color: var(--primary); border: 1px solid var(--primary); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 遠端操控腳本</h1>
        <form id="cmdForm" method="POST" action="/send">
            <textarea name="command" id="cmdInput" placeholder="在此輸入指令，將自動貼到您的電腦 Antigravity 視窗中..."></textarea>
            <button type="submit" id="sendBtn">發送指令</button>
        </form>
        {% if status == 'success' %}
        <div class="status success">✅ 指令已成功送達！</div>
        <script>
            setTimeout(() => { 
                const statusDiv = document.querySelector('.status');
                if(statusDiv) statusDiv.style.display = 'none'; 
            }, 3000);
            
            const input = document.getElementById('cmdInput');
            if(input) input.value = '';
            
            if (window.history.replaceState) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        </script>
        {% endif %}
    </div>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">※ 請確保電腦端的 Antigravity 視窗處於開啟狀態</p>
    <p style="color: #444; font-size: 10px;">PRG Pattern Applied</p>
</body>
</html>
"""

def execute_applescript(cmd):
    try:
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(input=cmd.encode('utf-8'))
    except Exception as e:
        print(f"剪貼簿寫入失敗: {e}")
        return

    script = '''
    tell application "System Events"
        if exists process "Electron" then
            set frontmost of process "Electron" to true
            delay 0.5
            keystroke "v" using command down
            delay 0.2
            keystroke return
        else
            log "找不到 Electron 程序"
        end if
    end tell
    '''
    subprocess.run(['osascript', '-e', script])

@app.route('/', methods=['GET'])
def index():
    status = request.args.get('status')
    return render_template_string(UI_HTML, status=status)

@app.route('/send', methods=['POST'])
def send():
    cmd = request.form.get('command')
    if cmd:
        print(f"收到指令: cmd...")
        execute_applescript(cmd)
        return redirect('/?status=success')
    return redirect('/')

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == '__main__':
    ip = get_ip()
    port = 8888
    print("Bridge Started on " + str(port))
    app.run(host='0.0.0.0', port=port, debug=False)
