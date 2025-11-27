const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to match the ad container size
  await page.setViewport({
    width: 1080,
    height: 1080,
    deviceScaleFactor: 2, // High DPI for better quality
  });

  const filePath = path.join(process.cwd(), 'public', 'promo-ad.html');
  const fileUrl = `file://${filePath}`;

  console.log(`Loading: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for animations to settle (optional, but good for the "fade in" effects)
  // The CSS has animations up to ~1s. Let's wait 2s.
  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.join(process.cwd(), 'public', 'promo-ad-image.png');
  
  // Select the container to avoid white margins if viewport is larger
  const element = await page.$('.ad-container');
  
  if (element) {
      await element.screenshot({ path: outputPath });
      console.log(`Screenshot saved to: ${outputPath}`);
  } else {
      console.error('Could not find .ad-container element');
  }

  await browser.close();
})();
