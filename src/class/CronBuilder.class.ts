import cron from 'node-cron';

class CronBuilder {
  static createAndRun(interval: string, taskFunction: () => Promise<void>) {
    const task = cron.schedule(interval, taskFunction);
    task.start();
    return task;
  }
}

export { CronBuilder }