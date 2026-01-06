# 🎮 Primal Sun: Agent Workflow Examples

本文件記錄了我們專案中實際使用的 Agent Manager 應用範例。
這些設定是為了加速我們的遊戲開發流程，您可以直接參考使用。

---

## 2. 實戰應用：角色切換 (Context/Persona)
我們在 `_DEV_CONFIG/personas/` 目錄下定義了以下角色，用於不同的開發階段。

### A. 遊戲企劃 (Game Designer)
*   **檔案路徑**: `_DEV_CONFIG/personas/game_designer.md`
*   **何時使用**: 當您需要討論卡牌數值平衡、劇情設定、或覺得遊戲「不好玩」的時候。
*   **啟動指令**: 在對話框輸入 `@game_designer.md 請進入此模式`。
*   **特性**: 會關注使用者體驗 (UX)，使用較多表情符號，避免談論程式細節。

### B. 資深工程師 (Senior Engineer)
*   **檔案路徑**: `_DEV_CONFIG/personas/senior_engineer.md`
*   **何時使用**: 實作新功能、重構程式碼、或進行 Code Review 時。
*   **啟動指令**: 在對話框輸入 `@senior_engineer.md 請進入此模式`。
*   **特性**: 嚴格遵守 ESLint，注重效能與模組化，拒絕 Magic Numbers。

### C. 預設助理 (Default)
*   **檔案路徑**: `_DEV_CONFIG/personas/default_agent.md`
*   **何時使用**: 想回到一般狀態時。
*   **特性**: 平衡、樂於助人、無特定限制。

---

## 2. 實戰應用：自動化 SOP (Workflows)
我們將重複性的終端機操作打包成 Workflow 文件。

### 範例：資料同步 (Sync Data)
*   **檔案路徑**: `.agent/workflows/sync_data.md`
*   **觸發指令**: `/sync`
*   **自動執行的步驟**:
    1.  **抓取資料**: 執行 `node tools/csv_manager.mjs sync` 從 Google Sheets 下載最新 CSV。
    2.  **加入索引**: 執行 `git add .`。
    3.  **提交變更**: 執行 `git commit -m "chore(data): auto-sync ..."`。
*   **效益**: 省去每次手動打三行指令的時間，確保資料與 Git 狀態同步。

---

## 3. 未來規劃的應用
以下是我們討論過，未來可以加入的 Workflow：

*   **Release Manager**: 發布新版本時自動更新 `package.json` 版本號並產生 Changelog。
*   **Bug Hunter**: 自動針對特定函式產生測試腳本以重現 Bug。
