// Short hash of the stylesheet. Changes whenever style.css changes,
// so browsers fetch the new file instead of a cached copy.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
export default createHash("sha256").update(readFileSync("src/css/style.css")).digest("hex").slice(0, 10);
