/** This function allows loading all files in a folder. */
export async function importDirectory(path: string) {
    const files = Deno.readDirSync(Deno.realPathSync(path));

    for (const file of files) {
        if (!file.name) continue;

        const currentPath = `${path}/${file.name}`;
        if (file.isFile) {
            await import(`file:///${currentPath}`);
            continue;
        }

        importDirectory(currentPath);
    }
}
