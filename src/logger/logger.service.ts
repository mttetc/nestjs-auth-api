import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  context?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logDir: string;
  private logFile: string;

  constructor(context: string = 'Logger') {
    super(context);
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = this.getLogFileName();
    void this.initializeLogDirectory();
  }

  private getLogFileName(): string {
    const date = new Date();
    return path.join(
      this.logDir,
      `app-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`,
    );
  }

  private async initializeLogDirectory(): Promise<void> {
    try {
      await fsPromises.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    try {
      // Check if we need to update the log file name (new day)
      const currentLogFile = this.getLogFileName();
      if (currentLogFile !== this.logFile) {
        this.logFile = currentLogFile;
      }

      const logString = JSON.stringify(entry) + '\n';
      await fsPromises.appendFile(this.logFile, logString);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
      message,
      metadata,
    };
    super.log(message, context);
    this.writeLog(entry).catch(console.error);
  }

  error(
    message: string,
    stack?: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      message,
      metadata: { ...metadata, stack },
    };
    super.error(message, stack, context);
    this.writeLog(entry).catch(console.error);
  }

  warn(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
      message,
      metadata,
    };
    super.warn(message, context);
    this.writeLog(entry).catch(console.error);
  }

  debug(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      context,
      message,
      metadata,
    };
    super.debug(message, context);
    this.writeLog(entry).catch(console.error);
  }
}
