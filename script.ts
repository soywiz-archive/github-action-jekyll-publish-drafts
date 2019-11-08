// https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-a-javascript-action

import {promises as fs} from "fs"
import child_process from "child_process"
import path from "path"
import * as util from "util";

const env = process.env;
const exec = util.promisify(child_process.exec);
const execFile = util.promisify(child_process.execFile);

//async function* walk(dir: string): AsyncIterableIterator<{file: string, stats: Stats}> {
async function* walk(dir: string): AsyncIterableIterator<string> {
    for (const file of await fs.readdir(dir)) {
        const filepath = path.join(dir, file);
        const stats = await fs.stat(filepath);
        if (stats.isDirectory()) {
            yield* (walk(filepath));
        } else if (stats.isFile()) {
            //yield({ file: filepath, stats: stats });
            yield(filepath);
        }
    }
}

function zeroPad(num: number, count: number, radix: number = 10): string {
    if (num < 0) return "-" + zeroPad(-num, count, radix);
    const str = (num | 0).toString(radix);
    if (str.length > count) return str;
    return ("0".repeat(count) + str).substr(-count);
}

function formatDate(date: Date) {
    return zeroPad(date.getFullYear(), 4) + "-" + zeroPad(date.getMonth(), 2) + "-" + zeroPad(date.getDate(), 2)
}

function parseTopLevelObjectYaml(yaml: string): any {
    //const out = new Map<string, string>();
    const out: any = {};
    for (const line of yaml.split("\n")) {
        if (line.trimLeft() != line) continue;
        const colonIdx = line.indexOf(":");
        if (colonIdx >= 0) {
            const key = line.substr(0, colonIdx).trim();
            let value = line.substr(colonIdx + 1).trim().replace(/^"+/, "").replace(/"+$/, "");
            out[key] = value;
        }
    }
    return out
}

async function main() {
    const JEKYLL_PATH = env.JEKYLL_PATH || env.INPUT_JEKYLL_PATH || ".";

    const now = new Date();

    let draftCount = 0;

    const GITHUB_REPOSITORY = env.GITHUB_REPOSITORY || env.INPUT_GITHUB_REPOSITORY;
    const GITHUB_ACTOR = env.GITHUB_ACTOR || env.INPUT_GITHUB_ACTOR;
    const INPUT_BRANCH = env.BRANCH || env.INPUT_BRANCH || "master";
    const GITHUB_TOKEN = env.GITHUB_TOKEN || env.INPUT_GITHUB_TOKEN;
    const GIT_USERNAME = env.GIT_USERNAME || env.INPUT_GIT_USERNAME || "github-action";
    const GIT_EMAIL = env.GIT_EMAIL || env.INPUT_GIT_EMAIL || "nobody@localhost";
    const GIT_MESSAGE = env.GIT_MESSAGE || env.INPUT_GIT_MESSAGE || "Publish drafts";

    //console.warn(env);
    console.warn(`Now is ${now}`);
    console.warn(`Current folder ${process.cwd()} . JEKYLL_PATH=${JEKYLL_PATH}`);
    console.warn(`GITHUB_ACTOR=${GITHUB_ACTOR}`);

    if (GITHUB_ACTOR) {
        await execFile('git', ['config', '--global', 'user.email', GIT_EMAIL]);
        await execFile('git', ['config', '--global', 'user.name', GIT_USERNAME]);
    }

    const folder = path.resolve(JEKYLL_PATH);
    console.warn(`Exploring... ${folder}/_drafts`);
    let fileCount = 0;
    for await (const file of walk(`${folder}/_drafts`)) {
        if ((await fs.stat(file)).isDirectory()) continue;
        fileCount++;
        const basename = path.basename(file);

        const content = await fs.readFile(file, "ascii");
        const parts = content.split(/---/g);
        if (parts[0] == "" && parts[1] != "") {
            const frontMatter = parseTopLevelObjectYaml(parts[1]);
            const date = frontMatter && frontMatter.date;
            if (date) {
                const rdate = new Date(Date.parse(date));
                if (rdate.getFullYear() >= 2000) { // Prevent using bad dates
                    if (now.getTime() >= rdate.getTime()) {
                        const nfilename = `${formatDate(rdate)}-${basename}`;
                        const nfile = `${folder}/_posts/${nfilename}`;

                        console.warn(file, "-->", nfile);
                        await execFile('git', ['mv', file, nfile]);
                        draftCount++
                    }
                }
            }
        }
    }
    console.warn(`Found ${fileCount} files. Moved drafts: ${draftCount}`);

    if (draftCount > 0) {
        const remote_repo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`;
        await execFile('git', ['commit', '-m', GIT_MESSAGE]);
        await execFile('git', ['push', remote_repo, `HEAD:${INPUT_BRANCH}`, '--follow-tags', '--force']);
    }
}

(async () => {
    try {
        await main();
        //console.warn(await execFile('echo', ["hello", "world"]))
    } catch (e) {
        console.error(e);
        process.exit(-1)
    }
})();
