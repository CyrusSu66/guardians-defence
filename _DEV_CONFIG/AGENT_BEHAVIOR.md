# Antigravity Agent 開發行為準則 (Agent Rules)

本檔案定義了 Agent 在此專案中必須始終遵循的行為規範與操作流程。當專案重啟時，讀取此檔案以恢復「開發狀態」。

## 1. 溝通語言
- **規則**: 必須始終使用 **繁體中文 (Traditional Chinese)** 與使用者溝通。
- **開發溝通區 (Dev Comm)**:
    - 當使用者傳達指令時，除了在對話視窗回應外，**必須**同時將回應寫入 `DEV_RESPONSE.md`。
    - 檔案格式應包含：「執行項目」、「遇到的問題」以及「下一步建議」。
    - 這能確保使用者在外部測試網站上也能看到最新的開發進度回報。

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
    - 桌面版 (Desktop): 寬度限制 (max-width: 1280px)，採用 Split View (左紀錄、右舞台) 與 Top Bar 狀態列。
    - 行動版 (Mobile): 單欄垂直堆疊佈局，優化手指點擊區域，狀態數值採堆疊顯示 (Stacked Stats) 以節省空間。
    - 確保所有按鈕在觸控裝置上易於點擊 (最小高度 44px)。

## 5. 部署架構與分支策略 (Deployment & Branching)
- **平台架構 (Vercel Integration)**:
    - 此專案與 **Vercel** 進行 CI/CD 整合，任何推送到 GitHub 的變更都會自動觸發 Vercel 建置。
    - **正式站 (Production)**: 對應 `main` 分支 => `https://guardians-defence.vercel.app/`
    - **預覽站 (Preview)**: 對應任何非 main 的分支 => Vercel 會自動生成獨立網址 (e.g., `*-git-<branch>-*.vercel.app`)。

- **開發流程 (Feature Branch Workflow)**:
    1. **建立分支**: 當開發重大功能或高風險重構時，請使用 `git checkout -b <branch-name>` 建立新分支。
    2. **開發與推送**: 在新分支進行開發，完成後推送 (`git push origin <branch-name>`)。
    3. **預覽確認**: 取得 Vercel 生成的預覽網址，提供給使用者測試。
    4. **紀錄**: 更新 `_DEV_CONFIG/BRANCH_LOG.md` 以追蹤目前分支狀態。
    5. **合併**: 確認無誤後，發起 Pull Request (PR) 或直接合併回 `main`。

---
*Last Updated: v3.26.14 (2026-01-05)*
