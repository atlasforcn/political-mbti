# 政見座標

一個以台灣公共議題為語境的四軸政治價值探索工具。3.0 題庫共有 64 題，分成 16 個議題；每個議題有 4 題、正反向各 2 題。每次固定從每個議題抽 1 題，組成 16 題測驗。完成後，題號與答案會轉成 `R01A` 形式的緊湊 hash 紀錄；首頁可貼入朋友的完整網址或單獨紀錄碼，再用自己的題組逐題比較。舊版 Base64URL 分享網址仍可讀取並會自動轉成新格式。

## 執行

```bash
npm test
npm run serve
```

開啟 <http://localhost:4173>。專案不需要建置步驟或第三方 JavaScript 套件。

## 結構

- `questions.js`：版本化題庫與四軸定義
- `scoring.js`：可獨立測試的計分與輸入驗證
- `quiz-session.js`：四軸與正反向平衡抽題、續測題組還原
- `record-codec.js`：hash 紀錄編解碼、驗證與跨題組逐題對齊
- `personality-types.js`：16 型名稱與摘要生成
- `app.js`：畫面流程、本機續測與分享
- `METHODOLOGY.md`：舊版檢視、資料來源、限制與驗證路線
- `QUESTION_REVIEW.md`：AI 跨學科題目審查、內容效度風險與真人專家評審規格
- `test/`：題庫平衡、邊界與錯誤輸入測試

## 科學聲明

目前是待驗證的探索工具，不是正式 MBTI、心理診斷或投票建議。請參閱 [METHODOLOGY.md](METHODOLOGY.md)。
