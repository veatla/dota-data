const new_line_regex = /\r?\n/;

function parse_data(data: string) {
  const result: Record<string, any> = {};
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
        const value = match[2];
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
        result[current_key!] = parse_data(sub_block);
        i += sub_block.split(new_line_regex).length;
        continue;
      }
    } else if (line === "}") {
      depth--;
      if (depth === 0) return result;
    }

    // If current line is "key" then set current key value
    if (line.match(/^".*?"$/)) {
      const match = line.match(/^"(.*?)"$/);
      if (match) current_key = match[1];
    }

    i++;
  }

  return result;
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
