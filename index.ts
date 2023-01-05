import * as opentype from "opentype.js"
import glob from "fast-glob"
import fs from "fs-extra"
import endent from "endent"
import path from "path"
import sortBy from "lodash/sortBy"
import childProcess from "child_process"

const families: {
  [familyName: string]: {
    outPath: string
    weight: number
    style: "roman" | "italic"
  }[]
} = {}

const srcDir = path.join(__dirname, "src")
const outDir = path.join(__dirname, "build")

async function main() {
  await fs.rm(outDir, { force: true, recursive: true })
  await fs.mkdir(outDir)
  await fs.copyFile(path.join(srcDir, "OFL.txt"), path.join(outDir, "OFL.txt"))

  const fontStream = glob("src/**/*.ttf", { absolute: true })

  const fontProcessTasks: Promise<any>[] = []
  for (const fontPath of await fontStream) {
    fontProcessTasks.push(processFont(fontPath))
  }
  await Promise.all(fontProcessTasks)

  await woff2Compress()

  constructCSS()
  buildPackageJson()
}

async function woff2Compress() {
  const files = Object.values(families)
    .flat()
    .map((family) => family.outPath)

  const promises = files.map((file) => {
    return new Promise<void>((resolve, reject) => {
      childProcess.exec(`woff2_compress ${file}.ttf`, (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })

  await Promise.all(promises)
}

async function constructCSS() {
  let cssFiles: string[] = []

  for (const [familyName, fonts] of Object.entries(families)) {
    let filepath = path.join(
      outDir,
      `${familyName.toLowerCase().replace(/\s+/g, "-")}.css`
    )

    cssFiles.push(filepath)

    const sortedFonts = sortBy(fonts, (font) => [
      font.weight,
      font.style === "italic",
      font.outPath,
    ])

    const fontFaces = sortedFonts.map((font) => {
      const url = "./" + path.relative(path.dirname(filepath), font.outPath)

      return endent`
        @font-face {
          font-family: "${familyName}";
          font-style: ${font.style};
          font-weight: ${font.weight};
          src: url("${url}.woff2") format("woff2"), url("${url}.ttf") format("truetype");
        }
      `
    })

    await fs.writeFile(filepath, fontFaces.join("\n\n"))
  }

  const imports = sortBy(cssFiles).map((cssFile) => {
    return `@import "./${path.relative(outDir, cssFile)}";`
  })

  const indexPath = path.join(outDir, "index.css")
  await fs.writeFile(indexPath, imports.join("\n"))
}

async function buildPackageJson() {
  const packageJson = await fs.readJSON("package.json")

  const newPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    author: packageJson.author,
    description: packageJson.description,
    license: packageJson.license,
    repository: packageJson.repository,
    keywords: packageJson.keywords,
  }

  await fs.writeJSON(path.join(outDir, "package.json"), newPackageJson, {
    spaces: 2,
  })
}

async function processFont(fontPath: string) {
  const font = await opentype.load(fontPath)

  const familyName = font.getEnglishName("fontFamily")

  const weight = font.tables.os2?.usWeightClass

  const italicAngle = font.tables.post?.italicAngle
  const style = italicAngle === 0 ? "roman" : "italic"

  const filename = `${familyName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${weight}-${style}`

  const outPath = path.join(outDir, "fonts", filename)

  families[familyName] ??= []
  families[familyName].push({
    outPath,
    weight,
    style,
  })

  await fs.copy(fontPath, `${outPath}.ttf`)
}

main()
  .then(() => {})
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
