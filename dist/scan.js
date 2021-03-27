const promisify = require("util").promisify
const lstat = promisify(require("fs").lstat)
const execSync = require("child_process").execSync
const fs = require("fs")

async function scan() {
	const catalog = __dirname + "/../catalog"
	const files = fs.readdirSync(catalog)

	var works = []

	for (var i = 0; i < files.length; i++) {
		const year = files[i]

		if(/[0-9]{4}/.test(year)) {
			const yearfolder = catalog + "/" + year
			const yearstat = await lstat(yearfolder)

			if(yearstat.isDirectory()) {
				const yearfiles = fs.readdirSync(yearfolder)

				for (var k = 0; k < yearfiles.length; k++) {
					const work = yearfiles[k]

					if(/([0-9]{2})\s(.*)/.test(work)) {
						const workfolder = yearfolder + "/" + work
						const workstat = await lstat(workfolder)

						if(workstat.isDirectory()) {
							const parse = work.match(/([0-9]{2})\s(.*)/)
							const tags = await readTags(workfolder)

							works.push({ year: year, number: parse[1], name: parse[2], tags: tags })
						}
					}
				}
			}
		}
	}

	const json = JSON.stringify({ works },null,2)

	fs.writeFileSync(__dirname + "/public/catalog.json", json, { encoding: "utf8", flag: "w" })
}

async function readTags(filename) {
	var cmdArr = ["tag", "--list", "--no-name", "\"" + filename + "\""]
	var cmd = cmdArr.join(" ")

	const stdout = await execSync(cmd)

	return stdout.toString().split(",").map(tag => { return tag.replace("\n", "") })
}

scan()