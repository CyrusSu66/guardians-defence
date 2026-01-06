# 🌳 GitHub 分支與版本紀錄 (Branch Log)

本文件用於追蹤專案的開發分支狀態、對應功能與預覽連結。

## 🚀 主線版本 (Main/Master)
*   **分支名稱**: `main`
*   **目前版本**: v3.26 Final
*   **功能狀態**: 穩定版 (Major Release) - Complete UI Overhaul & Architecture Refactor
*   **部署連結**: https://guardians-defence.vercel.app/

---

## 🚧 進行中的開發分支 (Active Features)
### 1. 卡牌數值調整與正規化 (Card Stat Adjustments)
*   **分支名稱**: `feature-card-stat-adjustments`
*   **建立日期**: 2026-01-05
*   **狀態**: Development
*   **實作功能**:
    *   **Data Refactor**: 模組化資料結構 (`src/data/*.js`)。
    *   **Normalization**: 資料欄位正規化 (Schema v3.27)。
    *   **CSV Sync**: 整合 Google Sheets 同步工具 (`tools/csv_manager.mjs`)。
*   **預覽連結**: https://guardians-defence-git-feature-card-s-46f360-cyrussu66s-projects.vercel.app


## ✅ 已合併/封存 (Merged/Archived)
### 1. 修復怪物進場效果 & 新架構 (Fix Breach & UI Refactor)
*   **分支名稱**: `fix-monster-breach`
*   **合併日期**: 2026-01-05
*   **狀態**: Merged to `main`
*   **實作功能**:
    *   **UI 重構**: RWD 分流 (Desktop 1280px / Mobile Stacked).
    *   **Landing Page**: 手動進入戰局.
    *   **Breach Fix**: 修正進場觸發點.
