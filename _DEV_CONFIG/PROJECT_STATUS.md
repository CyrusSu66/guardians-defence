# 專案狀態與啟動指引 (Project Status & Guide)

本檔案提供給使用者參考，用於在專案重啟時快速讓 Agent 進入狀況，以及記錄未來的開發方向。

## 🚀 快速啟動指令
當您重新開啟軟體載入專案後，請**複製並發送**以下指令給 Agent：

> **「請讀取 `_DEV_CONFIG/AGENT_BEHAVIOR.md` 並確認開發環境狀態（包含 Git 與遠端橋接），然後告訴我目前的待辦事項。」**

這將觸發 Agent：
1. 載入行為準則（繁體中文、自動 Push）。
2. 檢查 GitHub 同步狀態。
3. 檢查或啟動 Cloudflare Tunnel (Port 8080)。
4. 讀取下方的「待辦事項」並匯報。

---

## 📋 開發待辦事項 (Backlog) & 方向建議

### ✅ 已完成項目 (Completed Recent)
- [x] **UI/UX 重大改版 (v3.26)**:
    - **Desktop**: 寬螢幕置中 (1280px)、Split View (左右分欄)、Top Bar。
    - **Mobile**: 堆疊式排版、XP/Turn 窄版堆疊顯示、市集雙欄。
    - **通用**: 指標手勢優化、文字排版修正。
- [x] **系統架構更新**:
    - **Landing Page**: 新增首頁 (`index.html`) 作為入口，支援手動開始戰局。
    - **Dev Comm**: 實作開發溝通區按鈕 (自動偵測 Localhost/?dev 顯示)。
    - **Git 流程**: 確立 Feature Branch 开发模式，並定期清理已合併分支。
- [x] **Monster Breach Fix**: 修正怪物進場與突破邏輯。
- [x] **代碼清理**: 移除舊版註解與無用代碼。

### 🎯 下一個工作目標 (Next Goals)
- [ ] **除錯與測試**: 針對新加入的 RWD 介面與怪物能力進行壓力測試。
- [ ] **音效系統 (Sound FX)**: 實作 Web Audio API，加入點擊、攻擊、背景音樂。

### 優先級：高 (Priority: High)
- [ ] **本地儲存 (Local Storage)**: 實作 `save/load` 功能，防止重新整理後進度遺失。
- [ ] **說明書更新**: 隨時保持 `Game_Rule` 文件為最新狀態。

### 優先級：低 / 實驗性 (Priority: Low / Experimental)
- [ ] **Google Sheets + GAS 後端**: 建立數值雲端資料庫。
- [ ] **成就系統**: 紀錄最高分與通關次數。
- [ ] **PWA 支援**: 讓網頁可安裝為手機 App。
- [ ] **英雄與怪物擴充**: 持續加入新能力的單位。

---
*Last Updated: 2026-01-05 (v3.26.14)*
