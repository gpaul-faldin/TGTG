import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { decode } from 'quoted-printable';


class EmailReader {
  private imap: Imap;
  protected aproxDate: number;

  constructor(user: string, password: string, host: string, port: number = 993, aproxDate: number = new Date().getTime()) {
    this.imap = new Imap({
      user: user,
      password: password,
      host: host,
      port: port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });
    this.aproxDate = aproxDate;
  }

  private openInbox(cb: (error: Error | null, mailbox: Imap.Box) => void) {
    this.imap.openBox('INBOX', false, cb);
  }

  protected fetchAndReadEmail(searchCriteria: any, fetchOptions: any): Promise<ParsedMail | null> {
    return new Promise<ParsedMail | null>((resolve, reject) => {
      this.imap.once('ready', () => {
        this.openInbox((err, box) => {
          if (err) return reject(err);

          this.imap.search(searchCriteria, (err, results) => {
            if (err) return reject(err);
            if (!results || results.length === 0) return resolve(null);

            const f = this.imap.fetch(results[results.length - 1], fetchOptions);

            f.on('message', (msg, seqno) => {
              let emailData = Buffer.from('');
              msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                  emailData = Buffer.concat([emailData, chunk]);
                });
                stream.once('end', () => {
                  simpleParser(emailData, (err, mail) => {
                    if (err) {
                      console.log('Error parsing mail:', err);
                      reject(err);
                    } else if (mail) {
                      resolve(mail);
                    }
                  });
                });
              });

              // Mark the email as Deleted
              msg.once('attributes', (attrs) => {
                this.imap.addFlags(attrs.uid, ['\\Deleted'], (err) => {
                  if (err) {
                    console.log('Error marking the message for deletion:', err);
                  }
                });
              });
            });

            f.once('end', () => {
              // Expunge deleted emails
              this.imap.expunge((err) => {
                if (err) {
                  console.log('Error expunging the mailbox:', err);
                }
                this.imap.end();
              });
            });
          });
        });
      });

      this.imap.once('error', (err: Error) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  protected retrieveSpecificLine(emailContent: string, pattern: RegExp): string | null {
    const decodedContent = decode(emailContent);

    // Find the first match of the pattern in the joined content
    const match = decodedContent.match(pattern);

    // If a match is found, return it; otherwise, return null
    return match ? match[0] : null;
  }

  protected closeConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.imap.state === 'disconnected') {
        resolve();
      } else {
        this.imap.once('end', () => {
          resolve();
        });
        this.imap.once('error', (err: Error) => {
          reject(err);
        });
        this.imap.end();
      }
    });
  }


}

export { EmailReader }