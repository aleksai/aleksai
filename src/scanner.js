const promisify = require("util").promisify
const execSync = require("child_process").execSync
const fs = require("fs")
const lstat = promisify(fs.lstat)
const compress_images = require("compress-images")
const ColorThief = require("colorthief")

function componentToHex(c) {
	var hex = c.toString(16) 
	return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(rgb) {
	return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2])
}

async function scan() {
	const catalog = __dirname + "/../catalog"
	const public_catalog = __dirname + "/public/_images/catalog"
	const public_catalog_noncompressed = __dirname + "/public/_images/catalog-nonco"
	const json_shorts_file = __dirname + "/public/catalog.shorts.json"

	const locales = ["", "ru"]

	const files = fs.readdirSync(catalog)

	if(fs.existsSync(public_catalog)) fs.rmdirSync(public_catalog, { recursive: true })
	fs.mkdirSync(public_catalog)
	if(fs.existsSync(public_catalog_noncompressed)) fs.rmdirSync(public_catalog_noncompressed, { recursive: true })
	fs.mkdirSync(public_catalog_noncompressed)

	var works = {}
	var short = { years: [], tags: [] }

	for (var i = 0; i < locales.length; i++) {
		works[locales[i]] = [];
	}

	for (var i = 0; i < files.length; i++) {
		const year = files[i]

		if(/[0-9]{4}/.test(year)) {
			const year_folder = catalog + "/" + year
			const year_stat = await lstat(year_folder)

			if(year_stat.isDirectory()) {
				short.years.push(year)

				const year_files = fs.readdirSync(year_folder)

				for (var k = 0; k < year_files.length; k++) {
					const work = year_files[k]

					if(/([0-9]{2})\s(.*)/.test(work)) {
						const work_folder = year_folder + "/" + work
						const work_stat = await lstat(work_folder)

						if(work_stat.isDirectory()) {
							const parse = work.match(/([0-9]{2})\s(.*)/)

							const tags = fs.readFileSync(work_folder + "/tags.txt", "utf8").split(",")

							for (var l = 0; l < tags.length; l++) {
								const tag = tags[l]

								if(!short.tags.includes(tag)) short.tags.push(tag)
							}

							for (var m = 0; m < locales.length; m++) {
								const locale = locales[m]

								var info = { files: [] }

								try {
									const info_data = fs.readFileSync(work_folder + "/info" + (locale === "" ? "" : ("." + locale)) + ".txt", "utf8")
									
									const lines = info_data.split("\n")

									for (var l = 0; l < lines.length; l++) {
										const line = lines[l]
										const info_parts = line.split(":")

										if(info_parts.length >= 2) {
											const key = info_parts.shift().trim()
											var value = info_parts.map(i => i.trim()).join(":")

											if(value === "true") value = true
											if(value === "false") value = false

											info[key] = value
										}
									}

									const logo_file = work_folder + "/logo.png"

									if(fs.existsSync(logo_file)) {
										info.logo = rgbToHex(await ColorThief.getColor(logo_file))
										
										fs.copyFileSync(logo_file, public_catalog_noncompressed + "/" + year + "-" + parse[1] + "-" + "logo.png")
									}

									const work_files = fs.readdirSync(work_folder)

									for (var l = 0; l < work_files.length; l++) {
										const possible_image = work_files[l]

										if(/(.*)\.(jpg|png|gif)/.test(possible_image) && possible_image !== "logo.png") {
											const pic = year + "-" + parse[1] + "-" + possible_image
											info.files.push({ file: pic, color: rgbToHex(await ColorThief.getColor(work_folder + "/" + possible_image)) })

											fs.copyFileSync(work_folder + "/" + possible_image, public_catalog_noncompressed + "/" + pic)
										}
									}
								} catch(error) {
									// console.log("[Error]", error)
								}

								works[locale].push({ year, tags, info, number: parse[1], name: parse[2] })
							}
						}
					}
				}
			}
		}
	}

	compress_images(
		public_catalog_noncompressed + "/*.{jpg,JPG,jpeg,JPEG,png,gif}",
		public_catalog + "/",
		{ compress_force: false, statistic: false, autoupdate: true },
		false,
		{ jpg: { engine: "mozjpeg", command: ["-quality", "90"] } },
		{ png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
		{ svg: false },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) {
			if(err) console.log("images compressing error", err)

			if(completed) {
				console.log("images compressed")

				fs.rmdirSync(public_catalog_noncompressed, { recursive: true })
			}
		}
	)

	for (var i = 0; i < locales.length; i++) {
		const locale = locales[i]
		const filename = "catalog" + (locale === "" ? "" : ("." + locale)) + ".json"

		fs.writeFileSync(
			__dirname + "/public/" + filename,
			JSON.stringify({ works: works[locale] },null,2),
			{ encoding: "utf8", flag: "w" }
		)

		console.log(filename + " written")
	}

	fs.writeFileSync(
		json_shorts_file,
		JSON.stringify(short,null,2),
		{ encoding: "utf8", flag: "w" }
	)

	console.log("catalog.shorts.json written")
}

scan()