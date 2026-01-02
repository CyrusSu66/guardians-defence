# Antigravity Agent 開發行為準則 (Agent Rules)

本檔案定義了 Agent 在此專案中必須始終遵循的行為規範與操作流程。當專案重啟時，讀取此檔案以恢復「開發狀態」。

## 1. 溝通語言
- **規則**: 必須始終使用 **繁體中文 (Traditional Chinese)** 與使用者溝通。

## 2. 版本控制 (Git/GitHub)
- **規則**: 每次完成一段完整的程式碼修改或功能實作後，**必須**自動執行 `git push` 到遠端 `main` 分支。
- **流程**:
    1. `git add <files>`
    2. `git commit -m "Type: Description"`
    3. `git push origin main`
- **時機**: 不要累積太多變更，保持小步快跑的提交頻率。

## 3. 遠端開發橋接 (Remote Bridge)
- **目標**: 允許使用者從外部網絡透過手機或瀏覽器控制主要開發環境。
- **啟動檢查流程**:
    1. **Tunnel 檢查**: 確認 `cloudflared` 進程是否活躍。
    2. **Tunnel 網址**: 若使用者詢問或環境重啟，請使用 `grep` 或 `cat` 查找 `tunnel.log` 或終端機輸出來找回公開網址。
    3. **指令**: `chmod +x cloudflared && ./cloudflared tunnel --url http://localhost:8080 > tunnel.log 2>&1 &`

## 4. 程式碼風格與專案結構
- **風格**: 保持模組化 (`src/engine/` 分離)，加上清晰的版本與功能註解 (e.g., `// v3.22: RWD Update`).
- **UI 規範**: 
    - 桌面版 (>1200px) 採用三欄式 Grid 佈局。
    - 手機版 (<768px) 採用單欄垂直堆疊佈局。
    - 確保所有按鈕在觸控裝置上易於點擊。

---
*Last Updated: v3.22 (2026-01-02)*
