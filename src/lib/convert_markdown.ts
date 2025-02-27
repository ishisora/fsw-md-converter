function ConvertMarkdown(text: string): string {
    const tabLength: number = 4;
    text = text.replace(/\t/g, " ".repeat(tabLength));
    const lines: string[] = text.split("\n");

    let result: string[] = [];

    for (let i: number = 0; i < lines.length; i++) {
        // エスケープ文字の削除
        lines[i] = lines[i].replace(/\\</g, "<"); // \\<
        lines[i] = lines[i].replace(/\\>/g, ">"); // \\>

        // オリジナルの処理: コードブロックをpreプラグインに変換
        if (lines[i].startsWith("```")) {
            // lines[i] が終わるか、```が見つかるまでループ
            let code = "";
            i++;
            for (; i < lines.length; i++) {
                if (lines[i].startsWith("```")) {
                    break;
                }
                code += lines[i] + "\n";
            }
            code = "{{pre\n" + code + "}}";
            result.push(code);
            continue;
        }

        // コメントアウト
        // 1行の`<!--$1-->`を`// $1`に変換
        if (lines[i].startsWith("<!--") && lines[i].endsWith("-->")) {
            result.push(`//${lines[i].slice(4, -3)}`);
            continue;
        }
        // 複数行の`<!--\n&1\n-->を`// $1`に変換
        if (lines[i].startsWith("<!--")) {
            // lines[i] が終わるか、```が見つかるまでループ
            let comment: string = "";
            i++;
            while (i < lines.length && !lines[i].startsWith("-->")) {
                comment += "//" + lines[i] + "\n";
                i++;
            }
            result.push(comment.trimEnd());
            continue;
        }

        // コードブロック
        if (lines[i] === "```") {
            // lines[i] が終わるか、```が見つかるまでループ
            i++;
            for (; i < lines.length; i++) {
                if (lines[i].startsWith("```")) {
                    break;
                }
                result.push(` ${lines[i]}`);
            }
            continue;
        }

        // PRE
        if (lines[i].startsWith(" ".repeat(tabLength))) {
            let pre = " " + lines[i].trimStart() + "\n";
            while (i + 1 < lines.length && (lines[i + 1].startsWith(" ".repeat(tabLength)) || lines[i + 1].startsWith("\t"))) {
                i++;
                pre += " " + lines[i].trimStart() + "\n";
            }
            result.push(pre.trimEnd());
            continue;
        }

        // 見出し
        if (lines[i].startsWith("# ")) {
            result.push(`!!! ${lines[i].slice(2)}`);
            continue;
        } else if (lines[i].startsWith("## ")) {
            result.push(`!! ${lines[i].slice(3)}`);
            continue;
        } else if (lines[i].startsWith("### ")) {
            result.push(`! ${lines[i].slice(4)}`);
            continue;
        }

        // 項目 
        if (lines[i].startsWith("* ") || lines[i].startsWith("- ")) {
            for (; i < lines.length; i++) {
                if (lines[i].startsWith("* ") || lines[i].startsWith("- ")) {
                    result.push(`* ${textDecolation(lines[i].trimStart().slice(2))}`)
                } else if (lines[i].startsWith("  *") || lines[i].startsWith("  -")) {
                    result.push(`** ${textDecolation(lines[i].trimStart().slice(2))}`)
                } else if (lines[i].startsWith("    *") || lines[i].startsWith("    -")) {
                    result.push(`*** ${textDecolation(lines[i].trimStart().slice(2))}`)
                } else if (lines[i] === "") {
                    continue;
                } else {
                    break;
                }
            }
            i--;
            continue;
        }

        // 番号付き項目
        if (/^\d\./.test(lines[i])) {
            for (; i < lines.length; i++) {
                if (/^\d\./.test(lines[i])) {
                    result.push(`+${textDecolation(lines[i].slice(2))}`);
                } else if (/^  \d\./.test(lines[i])) {
                    result.push(`++${textDecolation(lines[i].slice(4))}`)
                } else if (/^    \d\./.test(lines[i])) {
                    result.push(`+++${textDecolation(lines[i].slice(6))}`)
                } else {
                    break;
                }
            }
            i--;
            continue;
        }

        // 水平線
        if (lines[i] == "---") {
            result.push("----");
            continue;
        }

        // 引用
        if (lines[i].startsWith(">")) {
            result.push(`""${lines[i].slice(1)}`);
            continue;
        }

        // 説明
        if (lines[i].startsWith("<dl>")) {
            while (i + 1 < lines.length) {
                i++;
                if (lines[i] === "</dl>") {
                    break;
                } else if (lines[i].startsWith("<dt>") && lines[i].endsWith("</dt>")) {
                    result.push("::" + lines[i].replace(/<\/?dt>/g, ""));
                } else if (lines[i].startsWith("<dd>") && lines[i].endsWith("</dd>")) {
                    result.push(":::" + lines[i].replace(/<\/?dd>/g, ""));
                }
            }
            continue;
        }


        // テーブル  lines[i].startsWith("|")
        if (i + 1 < lines.length &&
            lines[i] !== "" &&
            /^[\-\|]+$/.test(lines[i + 1]
                .replace(/-+/g, "-")
                .replace(/^(\|)/, ''))
        ) {
            const skipLine = i + 1;
            for (; i < lines.length; i++) {
                if (i !== skipLine) {
                    if (lines[i].includes("|")) {
                        const row = lines[i]
                            .replace(/^(\|)/, '')
                            .replace(/(\|)$/, '')
                            .split('|')
                            .map(cell => cell.trim())
                            .join(',');
                        result.push(`,${row}`);
                    } else {
                        break;
                    }
                }
            }
            i--;
            continue;
        }

        // その他
        result.push(textDecolation(lines[i]));
    }

    return result.join("\n");
}

function textDecolation(text: string): string {
    // escape
    text = text.replace(/\\\[/g, "[");
    text = text.replace(/\\\]/g, "]");

    // link
    if (text.match(/\[(.*?)\]\((.*?)\)/)) {
        return text.replace(/\[(.*?)\]\((.*?)\)/g, "[$1|$2]"); // [$1]($2) -> [$1|$2]
    }

    // text decoration
    text = text.replace(/\`+(.*?)\`+/g, "`$1`"); // コードスパン
    text = text.replace(/\*\*(.*?)\*\*/g, "'''$1'''"); // 太字
    text = text.replace(/\*(.*?)\*/g, "''$1''"); // 斜体
    text = text.replace(/\_(.*?)\_/g, "''$1''"); // 斜体
    text = text.replace(/~~(.*?)~~/g, '==$1=='); // 取り消し線
    text = text.replace(/<ins>(.*?)<\/ins>/g, '__$1__'); // 下線
    text = text.replace(/<u>(.*?)<\/u>/g, '__$1__'); // 下線
    return text;
}

export default ConvertMarkdown;
