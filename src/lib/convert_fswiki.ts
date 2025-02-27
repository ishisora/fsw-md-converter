function ConvertFSWiki(text: string): string {
    const tabLength: number = 4;
    text = text.replace(/\t/g, " ".repeat(tabLength));
    const lines: string[] = text.split("\n");

    let result: string[] = [];

    let counts: number[] = [1, 1, 1]; // 番号付き項目の番号のカウントに使用
    for (let i: number = 0; i < lines.length; i++) {
        // エスケープ
        lines[i] = lines[i].replace(/</g, "&lt;");
        lines[i] = lines[i].replace(/>/g, "&gt;");

        // オリジナルの処理: preプラグインをコードブロックに変換
        if (lines[i].startsWith("{{pre")) {
            // lines[i] が終わるか、```が見つかるまでループ
            let code = "";
            i++;
            for (; i < lines.length; i++) {
                if (lines[i].startsWith("}}")) {
                    break;
                }
                code += lines[i] + "\n";
            }
            code = "```\n" + code + "```";
            result.push(code);
            continue;
        }

        // コメントアウト
        if (lines[i].startsWith("//")) {
            result.push(`<!--${lines[i].slice(2)}-->`);
            continue;
        }

        // PRE
        if (lines[i].startsWith(" ")) {
            let pre: string = `${" ".repeat(4)}${lines[i].slice(1)}\n`
            while (i + 1 < lines.length && lines[i + 1].startsWith(" ")) {
                pre += `${" ".repeat(4)}${lines[i + 1].slice(1)}\n`;
                i++;
            }
            result.push(pre.replace(/\n$/, ""));
            continue;
        }

        // 見出し
        if (lines[i].startsWith("!!!")) {
            result.push(`# ${textDecolation(lines[i].slice(3).trimStart())}`);
            continue;
        } else if (lines[i].startsWith("!!")) {
            result.push(`## ${textDecolation(lines[i].slice(2).trimStart())}`);
            continue;
        } else if (lines[i].startsWith("!")) {
            result.push(`### ${textDecolation(lines[i].slice(1).trimStart())}`);
            continue;
        }

        // 項目
        if (lines[i].startsWith("***")) {
            result.push(`${" ".repeat(4)}* ${textDecolation(lines[i].slice(3).trimStart())}`)
            continue;
        } else if (lines[i].startsWith("**")) {
            result.push(`${" ".repeat(2)}* ${textDecolation(lines[i].slice(2).trimStart())}`)
            continue;
        } else if (lines[i].startsWith("*")) {
            result.push(`${" ".repeat(0)}* ${textDecolation(lines[i].slice(1).trimStart())}`)
            continue;
        }

        // 番号付き項目
        if (i - 1 >= 0 && !lines[i - 1].startsWith("+")) {
            counts = [1, 1, 1];
        }
        if (lines[i].startsWith("+++")) {
            result.push(`${" ".repeat(4)}${counts[2]}. ${textDecolation(lines[i].slice(3).trimStart())}`)
            counts[2]++;
            continue;
        } else if (lines[i].startsWith("++")) {
            result.push(`${" ".repeat(2)}${counts[1]}. ${textDecolation(lines[i].slice(2).trimStart())}`)
            counts[1]++;
            counts[2] = 1;
            continue;
        } else if (lines[i].startsWith("+")) {
            result.push(`${" ".repeat(0)}${counts[0]}. ${textDecolation(lines[i].slice(1).trimStart())}`)
            counts[0]++;
            counts[1] = 1;
            counts[2] = 1;
            continue;
        }

        // 水平線
        if (lines[i].startsWith("----")) {
            result.push("---")
            continue;
        }

        // 引用
        if (lines[i].startsWith('""')) {
            result.push(`>${textDecolation(lines[i].slice(2))}`)
            continue;
        }

        // 説明
        /// :: で始まる行は ::1行:::複数行 として処理
        if (lines[i].startsWith("::")) {
            let description = `<dt>${lines[i].slice(2).trimStart()}</dt>\n`;
            // ::: で始まる複数行を処理
            // lines[i] が終わるか、::: が終わるまでループ
            while (i + 1 < lines.length && lines[i + 1].startsWith(":::")) {
                i++;
                description += `<dd>${lines[i].slice(3).trimStart()}</dd>\n`;
            }
            description = `<dl>\n${description}</dl>`;
            result.push(description);
            continue;
        }
        /// : で始まる行は :項目:説明文 として処理
        if (lines[i].startsWith(":")) {
            const description = lines[i].split(":");
            result.push(`<dl>\n<dt>${description[1]}</dt>\n<dd>${description[2]}</dd>\n</dl>`);
            continue;
        }

        // テーブル
        if (lines[i].startsWith(",")) {
            let table = "";
            const th = lines[i].split(",");
            for (let j = 1; j < th.length; j++) {
                table += `${textDecolation(th[j])}|`;
            }
            table += "\n";
            for (let j = 1; j < th.length; j++) {
                table += `-|`;
            }
            table += "\n";
            while (i + 1 < lines.length && lines[i + 1].startsWith(",")) {
                i++;
                const th = lines[i].split(",");
                for (let j = 1; j < th.length; j++) {
                    table += `${textDecolation(th[j])}|`;
                }
                table += "\n";
            }
            result.push(table.trimEnd());
            continue;
        }

        // その他
        result.push(textDecolation(lines[i]));
    }

    return result.join("\n");
}

function textDecolation(text: string): string {
    // link
    text = text.replace(/\[\[([^|\]]*?)\|(.*?)\]\]/g, "[$1]($2)"); // [[$1|$2]] -> [$1]($2)
    text = text.replace(/\[(.*?)\|(.*?)\]/g, "[$1]($2)"); // [$1|$2] -> [$1]($2)
    text = text.replace(/\[\[(.*?)\]\]/g, "[$1]($1)"); // [[$1]] -> [$1]($1)

    // text decoration
    text = text.replace(/'''(.*?)'''/g, '**$1**');
    text = text.replace(/''(.*?)''/g, '*$1*');
    text = text.replace(/==(.*?)==/g, '~~$1~~');
    text = text.replace(/__(.*?)__/g, '<ins>$1</ins>');

    return text;
}

export default ConvertFSWiki;
