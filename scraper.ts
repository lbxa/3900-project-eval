import puppeteer from 'puppeteer';
import path from "path";
import { sleep } from 'bun';
import projects from "./projects.json"

const cookies = [
  {
    name: 'FedAuth',
    value: process.env.FED_AUTH as string, 
    domain: '.unsw-my.sharepoint.com',
    path: '/',
  },
  {
    name: 'rtFa',
    value: process.env.RTFA as string,
    domain: '.unsw-my.sharepoint.com',
    path: '/',
  }
];

const downloadPDF = async (title: string, url: string) => {
  try {
    const downloadPath = path.resolve(__dirname, "pdfs"); 

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath,
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    const downloadButtonSelector = '#downloadCommand';  // Yanked from HTML 

    await page.evaluate(() => {
    const button: HTMLButtonElement = document.querySelector('#downloadCommand')!;
      if (button) {
        button.click();
      }
    });

    await page.waitForSelector(downloadButtonSelector, { visible: true });
    await page.click(downloadButtonSelector);

    await sleep(5000) // needs time to figure its life out
    console.log(`Download started for: ${title}`);

    await browser.close();
  } catch (error) {
    console.error(`Failed to download ${title}: ${error.message}`);
  }
};

const processProjects = async () => {
  for (const project of projects) {
    console.log(project)
    await downloadPDF(project.title, project.url);
  }
};

processProjects();
