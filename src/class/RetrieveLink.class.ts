import { EmailReader } from './MailAccess.class';

class RetrieveLink extends EmailReader {
  private pattern: RegExp;

  constructor(userEmail: string, userPassword: string, host: string, regex: RegExp) {
    super(userEmail, userPassword, host)
    this.pattern = regex;
  }

  private async retrieveLoginLink(): Promise<string | null> {
    try {
      const EmailInfo = await this.fetchAndReadEmail(
        ['UNSEEN', ['FROM', 'no-reply@toogoodtogo.com'], ['OR', ['SUBJECT', 'Continue your log in'], ['SUBJECT', 'Complete your log in']]],
        { bodies: ['HEADER.FIELDS (DATE)', 'TEXT'], markSeen: true }
      );


      if (EmailInfo && EmailInfo.text && EmailInfo.date) {
        if (this.areDatesClose(EmailInfo.date.getTime(), this.aproxDate, 3)) {
          const Link = this.retrieveSpecificLine(EmailInfo.text, this.pattern)
          return Link;
        } else {
          console.log('Email is too old');
        }
      }

      await this.closeConnection();
    } catch (error) {
      console.error('An error occurred:', error);
    }

    return null;
  }
  private areDatesClose(date1: number, date2: number, minutesRange: number): boolean {
    const millisecondsRange = minutesRange * 60 * 1000;
    const difference = Math.abs(date1 - date2);
    return difference <= millisecondsRange;
  }
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  public async LoopRetrieveLoginLink(
    maxAttempts: number
  ): Promise<string | null> {
    let link = null;
    let attempts = 0;

    while (attempts < maxAttempts && !link) {
      link = await this.retrieveLoginLink();
      attempts++;
      if (!link) {
        await this.sleep(4000);
      }
    }

    return link;
  }
}

export { RetrieveLink };