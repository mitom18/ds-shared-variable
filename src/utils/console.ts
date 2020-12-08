import { Colors } from "../../deps.ts";

console.info = function (...data: any[]) {
    console.log(Colors.blue("[INFO] ") + data);
};
console.warn = function (...data: any[]) {
    console.log(Colors.yellow("[WARN] ") + data);
};
console.error = function (...data: any[]) {
    console.log(Colors.red("[ERROR] ") + data);
};
