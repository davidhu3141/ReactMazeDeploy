const process = require('process');
const { execSync } = require('child_process');
const fs = require("fs");

let message = process.argv[2]

let cmds = [
    () => execSync("git pull", { encoding: 'utf8' }).trim(),
    () => execSync("git add --all", { encoding: 'utf8' }).trim(),
    () => execSync(`git commit -m "${message ?? "some"}"`, { encoding: 'utf8' }).trim(),
    () => execSync("git push", { encoding: 'utf8' }).trim(),
]

cmds.forEach(cmd => {
    let result = ""
    try {
        console.log("command = " + cmd.toString().split('\n')[0] + '\n')
        result = cmd();
    } catch (e) {
        console.log(e.stdout);
        console.log(e.stderr);
    }
    console.log(result + "\n");
})