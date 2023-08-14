const puppeteer = require('puppeteer');

async function generatePDF() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // 将 'http://localhost:3001/' 替换为你的网页的URL
  await page.goto('http://localhost:3001/result?year=1902&month=4&day=5&hour=4&gender=%E5%A5%B3');

  // 如有需要，添加必要的等待以确保元素加载完毕
  // 例如：await page.waitForSelector('#resultContainer');

  // 生成PDF并保存为文件
  const pdfFilePath = 'example.pdf';
  await page.pdf({ path: pdfFilePath });

  await browser.close();

  return pdfFilePath;
}

module.exports = generatePDF;
