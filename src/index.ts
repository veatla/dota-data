import path from "path";
import { Glob } from "bun";
import parse_data from "./hero.config.parser";
const extension = ".txt";
const heroes_dir = `scripts/npc/heroes/*`;
const list = new Glob(heroes_dir).scanSync();
for await (const filepath of list) {
  const base = path.basename(filepath, extension);
  const file = Bun.file(filepath);

  const text = await file.text();
  const content = parse_data(text);

  await Bun.write(`heroes/${base}.json`, JSON.stringify(content, null, 2));
}
