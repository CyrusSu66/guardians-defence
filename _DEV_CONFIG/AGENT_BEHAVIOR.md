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
    1. **檢查 Bridge 服務**: 確認 `tools/remote_bridge/bridge.py` 是否正在執行 (Port 8080)。
    2. **檢查 Tunnel**: 確認 `cloudflared` 是否正在運行。
    3. **提供連結**: 若上述服務未開啟，應詢問使用者是否啟動；若已開啟，應主動提供 Cloudflare Tunnel 的公開 URL。

## 4. 程式碼風格與專案結構
- **風格**: 盡量保持模組化 (`src/engine/` 分離)，並加上清晰的註解，特別是版本號標記 (e.g., `// v3.x: description`).
- **相容性**: 修改 UI 時確保響應式設計，並檢查 `z-index` 以防遮擋。

---
*Last Updated: v3.19 (2026-01-01)*
