import { TextFormatter } from "../../src/interface/helpers/text-formatter.js";
import assert from "node:assert";

describe("TextFormatter", function(){
    describe("#sanitizeAndFormat()", function(){
        it("No Input - Undefined", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(), undefined);
        });

        it("Empty String - Empty String Returned", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(""), "");
        });

        it("Boring String no Markdown - Returned As Is", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(" 123 abc "), " 123 abc ");
        });

        it("Multiple Lines no Markdown - Returned As Is", function(){
            assert.equal(TextFormatter.sanitizeAndFormat("123\nabc"), "123\nabc");
        });

        it("Injection String no Markdown - Escaped", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` 123 & <script>alert("hello");</script> & 'abc' `), 
                ` 123 &amp; &lt;script&gt;alert(&quot;hello&quot;);&lt;/script&gt; &amp; &apos;abc&apos; `);
        });

        it("Boring String Markdown - Trimmed and Wrapped", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                " 123 abc ", true), 
                "<p>123 abc</p>");
        });

        it("Injection String Markdown - Escaped Trimmed and Wrapped", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` 123 & <script>alert("hello");</script> & 'abc' `, true), 
                `<p>123 &amp; &lt;script&gt;alert(&quot;hello&quot;);&lt;/script&gt; &amp; &apos;abc&apos;</p>`);
        });

        it("Single Return Markdown - Single Line Wrapped", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                " 123 \n abc ", true), 
                "<p>123 abc</p>");
        });

        it("Double Return Markdown - Two Paragraphs", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "123\n\nabc", true), 
                "<p>123</p><p>abc</p>");
        });

        it("Heading 1 Markdown - Parsed to <h1>", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "  # heading ", true), 
                "<h1>heading</h1>");
        });

        it("Heading 1 No Space Markdown - Parsed to <h1>", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "  #heading ", true), 
                "<h1>heading</h1>");
        });

        it("Heading 2 Markdown - Parsed to <h2>", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "  ## heading ", true), 
                "<h2>heading</h2>");
        });

        it("Heading 7 Markdown - Parsed to <h6> with #", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "  ####### heading ", true), 
                "<h6># heading</h6>");
        });

        it("2 Heading Single Return Markdown - Two Headings", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "# abc\n# efg", true), 
                "<h1>abc</h1><h1>efg</h1>");
        });

        it("Heading then Text Line - Text added to Heading", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                "#xyz\n123", true), 
                "<h1>xyz 123</h1>");
        });

        it("Single List Item `-` Markdown - All Work", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc`, true), 
                `<ul><li>abc</li></ul>`);
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` - abc`, true), 
                `<ul><li>abc</li></ul>`);
        });

        it("Single List Item `+` Markdown - All Work", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `+abc`, true), 
                `<ul><li>abc</li></ul>`);
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` + abc`, true), 
                `<ul><li>abc</li></ul>`);
        });

        it("Single List Item `*` Markdown - Only Works with Space", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `*abc`, true), 
                `<p>*abc</p>`);
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` * abc`, true), 
                `<ul><li>abc</li></ul>`);
        });

        it("List Item followed by Text Markdown - Text added to Item", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc\n123`, true), 
                `<ul><li>abc 123</li></ul>`);
        });

        it("2 Items Same Level Markdown - Two Items Same Level", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc\n-123`, true), 
                `<ul><li>abc</li><li>123</li></ul>`);
        });

        it("2 Items Second Deeper Markdown - Second Item Indented", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc\n -123`, true), 
                `<ul><li>abc</li><ul><li>123</li></ul></ul>`);
        });

        it("2 Items First Deeper Markdown - First Item Indented", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                ` -abc\n-123`, true), 
                `<ul><ul><li>abc</li></ul><li>123</li></ul>`);
        });

        it("2 Items 2 Returns Markdown - Two Lists", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc\n\n-123`, true), 
                `<ul><li>abc</li></ul><ul><li>123</li></ul>`);
        });

        it("List Item Single Return Heading - List Then Heading", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `-abc\n#xyz`, true), 
                `<ul><li>abc</li></ul><h1>xyz</h1>`);
        });

        it("Bold Formatting Markdown - Text Bold", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `**bo ** ld**`, true), 
                `<p><b>bo ** ld</b></p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `ab**bo ** ld**cd`, true), 
                `<p>ab<b>bo ** ld</b>cd</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `**bo ** ld **`, true), 
                `<p>**bo ** ld **</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `** bo ** ld**`, true), 
                `<p>** bo ** ld**</p>`);
        });

        it("Italic Formatting Markdown - Text Italic", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `*ita * lic*`, true), 
                `<p><i>ita * lic</i></p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `ab*ita * lic*cd`, true), 
                `<p>ab<i>ita * lic</i>cd</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `*ita * lic *`, true), 
                `<p>*ita * lic *</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `* ita * lic*`, true), 
                `<ul><li>ita * lic*</li></ul>`);
        });

        it("Bold Italic Formatting Markdown - Text Bold and Italic", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `***bold *** italic***`, true), 
                `<p><b><i>bold *** italic</i></b></p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `ab***bold *** italic***cd`, true), 
                `<p>ab<b><i>bold *** italic</i></b>cd</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `***bold *** italic ***`, true), 
                `<p>***bold *** italic ***</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `*** bold *** italic***`, true), 
                `<p>*** bold *** italic***</p>`);
        });

        it("Strikethrough Formatting Markdown - Text Bolded", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `~~strike ~~ through~~`, true), 
                `<p><s>strike ~~ through</s></p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `ab~~strike ~~ through~~cd`, true), 
                `<p>ab<s>strike ~~ through</s>cd</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `~~strike ~~ through ~~`, true), 
                `<p>~~strike ~~ through ~~</p>`);

            assert.equal(TextFormatter.sanitizeAndFormat(
                `~~ strike ~~ through~~`, true), 
                `<p>~~ strike ~~ through~~</p>`);
        });

        it("Formatting Inside Markdown - Both Applied", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `**test~~strike~~test**`, true), 
                `<p><b>test<s>strike</s>test</b></p>`);
        });

        it("Formatting Overlap Markdown - First Wins", function(){
            assert.equal(TextFormatter.sanitizeAndFormat(
                `~~test**strike~~test**`, true), 
                `<p><s>test**strike</s>test**</p>`);
        });
    });
});