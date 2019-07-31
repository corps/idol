// @flow
import fs from 'fs';
import path from 'path';
import os from 'os';

export class BuildEnv {
    buildDir: string;
    codegenRoot: string;

    constructor(name: string = "idol_js", codegenRoot: string = "codegen") {
        this.buildDir = fs.mkdtempSync(os.tmpdir() + path.sep + name);
        this.codegenRoot = codegenRoot;
    }

    absPath(relPath: string) {
        return path.resolve(this.buildDir, relPath);
    }

    writeBuildFile(relPath: string, contents: string) {
        const p = this.absPath(relPath);
        if (!fs.existsSync(path.dirname(p))) {
            mkdirP(path.dirname(p));
        }

        return fs.writeFileSync(p, contents, "utf-8");
    }

    finalize(outputDir: string, replace: boolean = false) {
        const existingCodegen = path.resolve(outputDir, this.codegenRoot);
        if (fs.existsSync(existingCodegen)) {
            recursiveRmSync(existingCodegen);
        }

        recursiveCopy(this.buildDir, outputDir, replace);
    }
}

function recursiveRmSync(folder: string) {
    fs.readdirSync(folder).forEach(function (entry: string) {
        var entryPath = path.join(folder, entry);
        if (fs.lstatSync(entryPath).isDirectory()) {
            recursiveRmSync(entryPath);
        } else {
            fs.unlinkSync(entryPath);
        }
    });

    fs.rmdirSync(folder);
}

function recursiveCopy(src, dest, replace = false) {
    if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
            mkdirP(dest);
        }

        fs.readdirSync(src).forEach((file) => {
            recursiveCopy(path.join(src, file), path.join(dest, file));
        });
    } else {
        if (!replace && fs.existsSync(dest)) {
            console.log("Skipping " + dest + "...");
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

function mkdirP(p) {
    if (fs.existsSync(p)) return;
    const parent = path.dirname(p);

    if (!fs.existsSync(parent)) {
        mkdirP(parent);
    }

    fs.mkdirSync(p);
}
