import puppeteer from 'puppeteer-extra';
import { BrowserLaunchArgumentOptions, Page, Browser } from 'puppeteer';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(stealthPlugin());

class PuppeteerExtraBot {

  private browser: Browser | null = null;
  private page: Page | null = null;
  public pageUrl: string;
  private launchOptions: BrowserLaunchArgumentOptions;

  constructor(page: string, options?: BrowserLaunchArgumentOptions) {
    this.pageUrl = page;
    this.launchOptions = options || {
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
  }

  private async init() {
    await this.launchBrowser();
    await this.openPage();
  }
  private async launchBrowser() {
    this.browser = await puppeteer.launch(this.launchOptions);
  }
  private async openPage() {
    if (!this.browser) {
      throw new Error("Browser is not initialized");
    }

    this.page = await this.browser.newPage();
    await this.page.goto(this.pageUrl);
  }
  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  public async waitForSelector(selector: string, timeout: number = 15000): Promise<boolean> {
    if (!this.browser) {
      await this.init();
    }
    try {
      if (!this.page) {
        throw new Error("Page is not initialized");
      }

      await this.page.waitForSelector(selector, { timeout });
      await this.closeBrowser();
      return true;
    } catch (error) {
      await this.closeBrowser();
      return false;
    }
  }
  public async waitForXPathOutcome(SuccessXPath: string, FailureXPath: string, timeout: number = 15000): Promise<boolean> {
    if (!this.browser) {
      await this.init();
    }

    if (!this.page) {
      await this.closeBrowser();
      throw new Error("Page is not initialized");
    }

    try {
      const successPromise = this.page.waitForXPath(SuccessXPath, { timeout });
      const failurePromise = this.page.waitForXPath(FailureXPath, { timeout }).then(() => {
        throw new Error('FailureXPath found');
      });

      await Promise.race([successPromise, failurePromise]);

      await this.closeBrowser();
      return true;

    } catch (error: any) {
      await this.closeBrowser();
      if (error.message === 'FailureXPath found') {
        return false;
      }
      return false;
    }
  }

}

export { PuppeteerExtraBot }