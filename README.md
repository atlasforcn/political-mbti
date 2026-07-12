# 政見座標

一個以台灣公共議題為語境的四軸政治價值探索工具。32 題、五點量表、16 型摘要；所有作答與計分都在瀏覽器內完成。

## 執行

```bash
npm test
npm run serve
```

開啟 <http://localhost:4173>。專案不需要建置步驟或第三方 JavaScript 套件。

## 結構

- `questions.js`：版本化題庫與四軸定義
- `scoring.js`：可獨立測試的計分與輸入驗證
- `personality-types.js`：16 型名稱與摘要生成
- `app.js`：畫面流程、本機續測與分享
- `METHODOLOGY.md`：舊版檢視、資料來源、限制與驗證路線
- `test/`：題庫平衡、邊界與錯誤輸入測試

## 科學聲明

目前是待驗證的探索工具，不是正式 MBTI、心理診斷或投票建議。請參閱 [METHODOLOGY.md](METHODOLOGY.md)。
