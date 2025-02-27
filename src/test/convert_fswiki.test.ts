import * as assert from 'assert';
import ConvertFSWiki from "../lib/convert_fswiki";

describe('ConvertFSWiki Test Suite', () => {
    it('Test Comment', () => {
        const input: string = `// コメント`;
        const expected: string = `<!-- コメント-->`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Pre', () => {
        const input: string = ` hoge\n fuga\n piyo`;
        const expected: string = `    hoge\n    fuga\n    piyo`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Heading', () => {
        const input: string = `!!! 大見出し\n!! 中見出し\n! 小見出し`;
        const expected: string = `# 大見出し\n## 中見出し\n### 小見出し`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Unordered List', () => {
        const input: string = `* 項目1\n** 項目2\n*** 項目3`;
        const expected: string = `* 項目1\n  * 項目2\n    * 項目3`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Ordered List', () => {
        const input: string = `+ 項目1\n++ 項目1-1\n+++ 項目1-1-1\n+++ 項目1-1-2\n++ 項目1-2\n+ 項目2`;
        const expected: string = `1. 項目1\n  1. 項目1-1\n    1. 項目1-1-1\n    2. 項目1-1-2\n  2. 項目1-2\n2. 項目2`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Horizontal Line', () => {
        const input: string = `----`;
        const expected: string = `---`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Quote', () => {
        const input: string = `""引用`;
        const expected: string = `>引用`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Single Line Definition', () => {
        const input: string = `:項目:説明`;
        const expected: string = `<dl>\n<dt>項目</dt>\n<dd>説明</dd>\n</dl>`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Multi Line Definition', () => {
        const input: string = `::項目\n:::説明1\n:::説明2`;
        const expected: string = `<dl>\n<dt>項目</dt>\n<dd>説明1</dd>\n<dd>説明2</dd>\n</dl>`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Table', () => {
        const input: string = `,1-1 ,1-2 ,1-3\n,2-1 ,2-2 ,2-3\n,3-1 ,3-2 ,3-3`;
        const expected: string = `1-1 |1-2 |1-3|\n-|-|-|\n2-1 |2-2 |2-3|\n3-1 |3-2 |3-3|`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Text Decolation', () => {
        const input: string = `'''ボールド''', ''イタリック'', ==取り消し線==, __下線__, '''''==__複合__=='''''`;
        const expected: string = `**ボールド**, *イタリック*, ~~取り消し線~~, <ins>下線</ins>, ***~~<ins>複合</ins>~~***`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });

    it('Test Link', () => {
        const input: string = `[[ページ|Page]], [Google|https://www.google.com/], [[Page]]`;
        const expected: string = `[ページ](Page), [Google](https://www.google.com/), [Page](Page)`;
        const result: string = ConvertFSWiki(input);
        assert.strictEqual(result, expected);
    });
});
