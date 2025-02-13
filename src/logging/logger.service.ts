import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLogger implements LoggerService {
  private logFilePath: string;

  constructor() {
    this.logFilePath = path.join(__dirname, '..', 'logs', 'requests.log');
    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(this.logFilePath))) {
      fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
    }
  }

  log(message: string) {
    this.writeLog('LOG', message);
  }

  error(message: string, trace: string) {
    this.writeLog('ERROR', `${message} - ${trace}`);
  }

  warn(message: string) {
    this.writeLog('WARN', message);
  }

  debug(message: string) {
    this.writeLog('DEBUG', message);
  }

  verbose(message: string) {
    this.writeLog('VERBOSE', message);
  }

  logRequestDetails(message: string) {
    this.writeLog('REQUEST', message);
  }

  private writeLog(level: string, message: string) {
    const logMessage = `[${level}] ${message}\n`;
    fs.appendFileSync(this.logFilePath, logMessage);
  }
}
