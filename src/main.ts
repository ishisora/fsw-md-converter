import * as fs from 'fs';
import ConvertFSWiki from "./lib/convert_fswiki";
import ConvertMarkdown from "./lib/convert_markdown";

function convert(inputFile: string, outputFile?: string) {
    if (!inputFile.endsWith('.md') && !inputFile.endsWith('.fsw') && !inputFile.endsWith('.fswiki')) {
        console.error("Error: Input file must have a .md, .fsw or .fswiki extension.");
        process.exit(1);
    }

    if (!outputFile) {
        if (inputFile.endsWith('.md')) {
            outputFile = inputFile.replace(/\.md$/, '_output.fsw');
        } else if (inputFile.endsWith('.fsw')) {
            outputFile = inputFile.replace(/\.fsw$/, '_output.md');
        } else if (inputFile.endsWith('.fswiki')) {
            outputFile = inputFile.replace(/\.fswiki$/, '_output.md');
        }
    } else if (!outputFile.endsWith('.md') && !outputFile.endsWith('.fsw') && !outputFile.endsWith('.fswiki')) {
        console.error("Error: Output file must have a .md, .fsw or .fswiki extension.");
        process.exit(1);
    }

    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        }

        let convertedData: string;
        if (inputFile.endsWith('.md')) {
            convertedData = ConvertMarkdown(data);
        } else if (inputFile.endsWith('.fsw') || inputFile.endsWith('.fswiki')) {
            convertedData = ConvertFSWiki(data);
        }

        if (!convertedData) {
            console.error("Error: Convert failed.");
            process.exit(1);
        }

        fs.writeFile(outputFile, convertedData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file: ${err.message}`);
                process.exit(1);
            }

            console.log(`Converted: ${inputFile} -> ${outputFile}`);
        });
    });
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Usage: node main.js <input .md, .fsw or .fswiki> [output.fsw, .fswiki, .md]");
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

convert(inputFile, outputFile);
