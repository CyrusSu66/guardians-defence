# Antigravity Agent 開發行為準則 (Agent Rules)

本檔案定義了 Agent 在此專案中必須始終遵循的行為規範與操作流程。當專案重啟時，讀取此檔案以恢復「開發狀態」。

## 1. 溝通語言
- **規則**: 必須始終使用 **繁體中文 (Traditional Chinese)** 與使用者溝通。
- **開發溝通區 (Dev Comm)**:
    - 當使用者傳達指令時，除了在對話視窗回應外，**必須**同時將回應寫入 `DEV_RESPONSE.md`。
    - 檔案格式應包含：「執行項目」、「遇到的問題」以及「下一步建議」。
    - 這能確保使用者在外部測試網站上也能看到最新的開發進度回報。

## 2. 開發流程與版本控制 (Development Workflow)
- **核心原則**: `main` 分支永遠保持為「穩定可釋出 (Stable Release)」狀態。所有新功能開發、Bug 修復或重構，**必須**在獨立的分支上進行。

## 3. 遠端連結與橋接器 (Remote Access & Bridge)
- **專案主程式 (Game App)**:
    - 啟動指令: `python3 -m http.server 8080`
    - Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:8080`
    - 用途: 外部測試 RWD、遊戲功能驗證。

- **Antigravity 遠端橋接器 (Remote Bridge)**:
    - 檔案位置: `tools/remote_bridge/bridge.py`
    - 啟動指令: `python3 tools/remote_bridge/bridge.py` (Port: 8888)
    - Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:8888`
    - 用途: **專用於** 讓使用者從外部網路發送文字指令回 Agent 對話框。
    - **注意**: 這與遊戲主程式分開運作，請勿混淆。橋接器僅為輔助溝通工具。

- **標準作業流程 (SOP)**:
    1.  **建立分支 (Branching)**:
        -   依據任務類型命名：`feature-<name>`, `fix-<bug>`, `refactor-<scope>`。
        -   指令: `git checkout -b feature-new-mechanic`
    2.  **開發與提交 (Commit)**:
        -   保持小步快跑，頻繁提交到該分支。
        -   指令: `git add .` -> `git commit -m "feat: add logic..."` -> `git push origin feature-new-mechanic`
    3.  **部署預覽 (Preview)**:
        -   推送到分支後，Vercel 會自動生成預覽網址 (e.g., `*-git-<branch>-*.vercel.app`)。
        -   **必須**提供此連結給使用者進行測試驗證。
    4.  **驗證與合併 (Merge)**:
        -   當使用者確認功能無誤後，才可合併回主線。
        -   指令: `git checkout main` -> `git merge feature-new-mechanic` -> `git push origin main`
    5.  **紀錄**: 若有重大變更，更新 `_DEV_CONFIG/BRANCH_LOG.md`。



## 4. 程式碼風格與專案結構
- **風格**: 保持模組化 (`src/engine/` 分離)，加上清晰的版本與功能註解 (e.g., `// v3.22: RWD Update`).
- **UI 規範**: 
    - 桌面版 (Desktop): 寬度限制 (max-width: 1280px)，採用 Split View (左紀錄、右舞台) 與 Top Bar 狀態列。
    - 行動版 (Mobile): 單欄垂直堆疊佈局，優化手指點擊區域，狀態數值採堆疊顯示 (Stacked Stats) 以節省空間。
    - 確保所有按鈕在觸控裝置上易於點擊 (最小高度 44px)。

## 5. 資料同步規範 (Data Sync)
- **Google Sheets**: 卡牌數值維護於外部試算表。
- **Trigger**: 收到「同步 data」指令時，應參照 `_DEV_CONFIG/DATA_SYNC_GUIDE.md` 執行更新。
- **Source of Truth**: 更新後，以 `src/data/*.js` 為最終執行依據。

---
*Last Updated: v3.27.0 (2026-01-07)*
