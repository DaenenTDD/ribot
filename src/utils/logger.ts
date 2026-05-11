import { parseArgs, getFlags } from "@/core/lib/parseArgs.js";
import fs from "fs";
import path from "path";

enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

class Logger {
    private logDir: string;
    private minLogLevel: LogLevel;
    private timezone: string;

    constructor(
        logDir: string = "logs",
        minLogLevel: LogLevel = LogLevel.INFO,
        timezone: string = "UTC",
    ) {
        this.logDir = path.join(process.cwd(), logDir);
        this.minLogLevel = minLogLevel;
        this.timezone = timezone;

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private getLogFile(): string {
        const date = new Date();
        return path.join(
            this.logDir,
            `log-${date.toISOString().split("T")[0]}.log`,
        );
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: this.timezone,
            timeZoneName: "short",
            hour12: false,
        });
        return `[${timestamp}] [${level}] ${message}`;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = Object.values(LogLevel);
        return (
            levels.indexOf(level) >= levels.indexOf(this.minLogLevel)
        );
    }

    public debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(
                LogLevel.DEBUG,
                message,
            );
            fs.appendFileSync(this.getLogFile(), formattedMessage + "\n");
        }
    }

    public info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const formattedMessage = this.formatMessage(
                LogLevel.INFO,
                message,
            );
            fs.appendFileSync(this.getLogFile(), formattedMessage + "\n");
        }
    }

    public warn(message: string): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(
                LogLevel.WARN,
                message,
            );
            fs.appendFileSync(this.getLogFile(), formattedMessage + "\n");
        }
    }

    public error(message: string): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(
                LogLevel.ERROR,
                message,
            );
            fs.appendFileSync(this.getLogFile(), formattedMessage + "\n");
        }
    }
}

let minLogLevel;
if (getFlags().includes("--debug")) {
    minLogLevel = LogLevel.DEBUG;
} else {
    minLogLevel = parseArgs().logLevel?.toUpperCase() as LogLevel;
}

const logger = new Logger("logs", minLogLevel || LogLevel.INFO, "America/Edmonton");

export { Logger, LogLevel };
export default logger;
