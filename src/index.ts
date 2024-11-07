import path from "path";
import { Glob } from "bun";
import parse_data from "./hero.config.parser";

const extension = ".txt";
const heroes_dir = `scripts/npc/heroes/*`;
const list = new Glob(heroes_dir).scanSync();
const data: Record<string, string[]> = {};

for await (const filepath of list) {
  const base = path.basename(filepath, extension);
  const file = Bun.file(filepath);

  const text = await file.text();
  const { result: content, enums } = parse_data(text);

  for (const key in enums) {
    if (!data[key]) data[key] = [];
    data[key] = [...new Set([...data[key], ...enums[key]])].filter((v) => v.length);
  }

  const json = JSON.stringify(content, null, 2);
  await Bun.write(`heroes/${base}.json`, json);
}

await Bun.write(`types/hero.json`, JSON.stringify(data, null, 2));
