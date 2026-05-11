import fs from "fs";
import path from "path";

/**
 * Recursively walks through a directory and returns an array of file paths.
 * @param dir The directory to walk through.
 * @returns An array of file paths.
 */

export function walk(dir: string): string[] {
    let results: string[] = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            results = results.concat(walk(itemPath));
        } else {
            if (itemPath.endsWith(".ts") || itemPath.endsWith(".js")) {
                results.push(itemPath);
            }
        }
    }
    return results;
}