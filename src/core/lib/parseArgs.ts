const args = process.argv.slice(2);

/**
 * Parses command line args and returns them as an object.
 * @returns An object containing key-value pairs of the parsed args.
 */
export function parseArgs(): Record<string, string> {
    const argObj: Record<string, string> = {};

    for (const arg of args) {
        const [key, value] = arg.split("=");
        if (key && value) {
            argObj[key] = value;
        }
    }
    return argObj;
}

/**
 * Helper function to get all flags (args that start with "--").
 * @returns An array of args that start with "--"
 */
export function getFlags(): string[] {
    const flags: string[] = [];
    for (const arg of args) {
        if (arg.startsWith("--")) flags.push(arg);
    }
    return flags;
}