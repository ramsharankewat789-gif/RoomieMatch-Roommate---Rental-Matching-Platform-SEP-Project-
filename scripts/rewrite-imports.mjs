import fs from "node:fs";
import path from "node:path";

const appsRoot = path.resolve("apps");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const replacements = [
  [/from (["'])\.\.\/\.\.\/context\//g, "from $1@shared/context/"],
  [/from (["'])\.\.\/context\//g, "from $1@shared/context/"],
  [/from (["'])\.\.\/\.\.\/hooks\//g, "from $1@shared/hooks/"],
  [/from (["'])\.\.\/hooks\//g, "from $1@shared/hooks/"],
  [/from (["'])\.\.\/\.\.\/data\//g, "from $1@shared/data/"],
  [/from (["'])\.\.\/data\//g, "from $1@shared/data/"],
  [/from (["'])\.\.\/\.\.\/components\/common\//g, "from $1@shared/components/common/"],
  [/from (["'])\.\.\/common\//g, "from $1@shared/components/common/"],
];

for (const file of walk(appsRoot)) {
  let source = fs.readFileSync(file, "utf8");
  const original = source;
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }
  if (source !== original) {
    fs.writeFileSync(file, source);
    console.log("updated", path.relative(".", file));
  }
}
