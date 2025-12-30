/**
 * 遊戲主要邏輯 (game.js)
 * 您可以將原有的 Prototype JS 代碼遷移到這裡。
 */

console.log("遊戲邏輯已載入");

const h1 = document.querySelector('h1');
h1.textContent = "遊戲原型環境準備就緒！";

// 初始化 Canvas 範例
const canvas = document.getElementById('gameCanvas');
if (canvas) {
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // 繪製一個代表遊戲原型的方塊
    ctx.fillStyle = '#3498db';
    ctx.fillRect(250, 150, 100, 100);
}
