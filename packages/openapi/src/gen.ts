import fs from "fs";
import { document } from ".";

const filePaths = ["./openapi.json", "../../apps/backend/static/openapi.json"];

filePaths.forEach((filePath) => {
  fs.writeFile(filePath, JSON.stringify(document, null, 2), (err) => {
    if (err) {
      console.error(`Error writing to ${filePath}:`, err);
    }
  });
});
