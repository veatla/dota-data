const new_line_regex = /\r?\n/;

function parse_data(data: string) {
  const result: Record<string, any> = {};
  const enums: Record<string, string[]> = {};
  let current_key: string | null = null;
  let depth = 0;

  // Split each text by new lines
  const lines = data.split(new_line_regex);

  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();

    // Ignore if line it's comment line
    if (line.startsWith("//") || line.length === 0) {
      i++;
      continue;
    }

    // match lines: "key" "value"
    if (line.match(/^".*?"\s*".*?"$/)) {
      const match = line.match(/^"(.*?)"\s*"(.*?)"$/);
      if (match) {
        const key = match[1];

        // So values can be as an array...
        // example:     "AbilityBehavior": "DOTA_ABILITY_BEHAVIOR_AOE | DOTA_ABILITY_BEHAVIOR_POINT"
        // Also can be level based key&value
        // example:     "AbilityManaCost": "95 105 115 125"
        //
        const value = match[2];
        const splitted = value.split(/\s+/g);
        if (splitted.some((v) => v === "|") && splitted.length > 1) {
          // result[key] = splitted;
          if (!enums[key]) enums[key] = [];
          enums[key].push(...splitted.filter((v) => v !== "|"));
        }
        // else

        result[key] = value;
      }
      i++;
      continue;
    }

    // nested objects
    if (line === "{") {
      depth++;
      if (depth > 1) {
        const sub_block = extract_nested_scope(lines, i + 1);
        const { result: _result, enums: _enums } = parse_data(sub_block);

        for (const key in _enums) {
          if (!enums[key]) enums[key] = [];
          enums[key].push(..._enums[key]);
        }
        result[current_key!] = _result;
        i += sub_block.split(new_line_regex).length;
        continue;
      }
    } else if (line === "}") {
      depth--;
      if (depth === 0)
        return {
          result,
          enums,
        };
    }

    // If current line is "key" then set current key value
    if (line.match(/^".*?"$/)) {
      const match = line.match(/^"(.*?)"$/);
      if (match) current_key = match[1];
    }

    i++;
  }

  return { result, enums };
}

// function to extract nested scope
function extract_nested_scope(lines: string[], start_index: number) {
  let depth = 1;
  let sub_block = "";

  for (let i = start_index; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "{") depth++;
    else if (line === "}") depth--;

    if (depth > 0) sub_block += lines[i] + "\n";

    if (depth === 0) break;
  }

  return sub_block;
}
export default parse_data;
