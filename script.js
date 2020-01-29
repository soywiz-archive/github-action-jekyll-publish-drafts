"use strict";
// https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-a-javascript-action
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const util = __importStar(require("util"));
const env = process.env;
const exec = util.promisify(child_process_1.default.exec);
const execFile = util.promisify(child_process_1.default.execFile);
//async function* walk(dir: string): AsyncIterableIterator<{file: string, stats: Stats}> {
function walk(dir) {
    return __asyncGenerator(this, arguments, function* walk_1() {
        for (const file of yield __await(fs_1.promises.readdir(dir))) {
            const filepath = path_1.default.join(dir, file);
            const stats = yield __await(fs_1.promises.stat(filepath));
            if (stats.isDirectory()) {
                yield __await(yield* __asyncDelegator(__asyncValues((walk(filepath)))));
            }
            else if (stats.isFile()) {
                //yield({ file: filepath, stats: stats });
                yield yield __await((filepath));
            }
        }
    });
}
function zeroPad(num, count, radix = 10) {
    if (num < 0)
        return "-" + zeroPad(-num, count, radix);
    const str = (num | 0).toString(radix);
    if (str.length > count)
        return str;
    return ("0".repeat(count) + str).substr(-count);
}
function formatDate(date) {
    return zeroPad(date.getFullYear(), 4) + "-" + zeroPad((date.getMonth()+1), 2) + "-" + zeroPad(date.getDate(), 2);
}
function parseTopLevelObjectYaml(yaml) {
    //const out = new Map<string, string>();
    const out = {};
    for (const line of yaml.split("\n")) {
        if (line.trimLeft() != line)
            continue;
        const colonIdx = line.indexOf(":");
        if (colonIdx >= 0) {
            const key = line.substr(0, colonIdx).trim();
            let value = line.substr(colonIdx + 1).trim().replace(/^"+/, "").replace(/"+$/, "");
            out[key] = value;
        }
    }
    return out;
}
function main() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
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
            yield execFile('git', ['config', '--global', 'user.email', GIT_EMAIL]);
            yield execFile('git', ['config', '--global', 'user.name', GIT_USERNAME]);
        }
        const folder = path_1.default.resolve(JEKYLL_PATH);
        console.warn(`Exploring... ${folder}/_drafts`);
        let fileCount = 0;
        try {
            for (var _b = __asyncValues(walk(`${folder}/_drafts`)), _c; _c = yield _b.next(), !_c.done;) {
                const file = _c.value;
                if ((yield fs_1.promises.stat(file)).isDirectory())
                    continue;
                fileCount++;
                const basename = path_1.default.basename(file);
                const content = yield fs_1.promises.readFile(file, "ascii");
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
                                yield execFile('git', ['mv', file, nfile]);
                                draftCount++;
                            }
                        }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.warn(`Found ${fileCount} files. Moved drafts: ${draftCount}`);
        if (draftCount > 0) {
            const remote_repo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`;
            yield execFile('git', ['commit', '-m', GIT_MESSAGE]);
            yield execFile('git', ['push', remote_repo, `HEAD:${INPUT_BRANCH}`, '--follow-tags', '--force']);
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main();
        //console.warn(await execFile('echo', ["hello", "world"]))
    }
    catch (e) {
        console.error(e);
        process.exit(-1);
    }
}))();
//# sourceMappingURL=script.js.map
