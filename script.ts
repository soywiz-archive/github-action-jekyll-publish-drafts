import {promises as fs, Stats} from "fs"
import child_process from "child_process"
import path from "path"
import yaml from "yaml"
import {sprintf} from "sprintf";
import * as util from "util";
import * as os from "os";

const env = process.env
const exec = util.promisify(child_process.exec)

//async function* walk(dir: string): AsyncIterableIterator<{file: string, stats: Stats}> {
async function* walk(dir: string): AsyncIterableIterator<string> {
    for (const file of await fs.readdir(dir)) {
        const filepath = path.join(dir, file);
        const stats = await fs.stat(filepath);
        if (stats.isDirectory()) {
            yield*(walk(filepath));
        } else if (stats.isFile()) {
            //yield({ file: filepath, stats: stats });
            yield(filepath);
        }
    }
}

function formatDate(date: Date) {
    return sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth(), date.getDate());
}

async function main() {
    const JEKYLL_PATH = env.JEKYLL_PATH || env.INPUT_JEKYLL_PATH || ".";

    const now = new Date();

    let draftCount = 0;

    const GITHUB_REPOSITORY = env.GITHUB_REPOSITORY || env.INPUT_GITHUB_REPOSITORY;
    const GITHUB_ACTOR = env.GITHUB_ACTOR || env.INPUT_GITHUB_ACTOR;
    const INPUT_BRANCH = env.BRANCH || env.INPUT_BRANCH || "master";
    const GITHUB_TOKEN = env.GITHUB_TOKEN || env.INPUT_GITHUB_TOKEN;

    //console.warn(env);
    console.warn(`Now is ${now}`);
    console.warn(`Current folder ${process.cwd()} . JEKYLL_PATH=${JEKYLL_PATH}`);
    console.warn(`GITHUB_ACTOR=${GITHUB_ACTOR}`);

    if (GITHUB_ACTOR) {
        await exec(`git config --global user.email "nobody@localhost"`);
        await exec(`git config --global user.name "github-action"`);
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
            const frontMatter = yaml.parse(parts[1].trim());
            const date = frontMatter && frontMatter.date;
            if (date) {
                const rdate = new Date(Date.parse(date));
                if (rdate.getFullYear() >= 2000) { // Prevent using bad dates
                    if (now.getTime() >= rdate.getTime()) {
                        const nfilename = `${formatDate(rdate)}-${basename}`;
                        const nfile = `${folder}/_posts/${nfilename}`;

                        console.warn(file, "-->", nfile)
                        await exec(`git mv "${file}" ${nfile}`)
                        draftCount++
                    }
                }
            }
        }
    }
    console.warn(`Found ${fileCount} files. Moved drafts: ${draftCount}`);

    if (draftCount > 0) {
        const remote_repo=`https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`;
        await exec(`git commit -m"publish drafts"`);
        await exec(`git push "${remote_repo}" HEAD:${INPUT_BRANCH} --follow-tags --force;`);
    }
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.error(e)
        process.exit(-1)
    }
})();
