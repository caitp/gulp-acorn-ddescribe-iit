describe("top-level suite gulp-acorn-ddescribe-iit", function() {
  it.only("focused spec", function() {

  });

  // it.only('disabled by C++-style comment', function () { });

  /**
   * it.only('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "it.only('occurs within double-quote string literal', function() {",
     "});",

     'it.only("occurs within single-quote string literal", function() {',
     '});',

      `it.only("occurs within ECMA2015 template literal", function() {`,
        ${describe.only("Nested expression within template", function() {
          // it.only('C++-style comment within template', function() {});,
          /**
           * it.only('C-style comment within template', function() {
           * });
           */
        })}
     `});`,
    ].join("");
});

describe.only("top-level focused suite gulp-acorn-ddescribe-iit", function() {
  it.only("exclusive test", function() {

  });

  // it.only('disabled by C++-style comment', function () { });

  /**
   * it.only('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "it.only('occurs within double-quote string literal', function() {",
     "});",

     'it.only("occurs within single-quote string literal", function() {',
     '});',

      `it.only("occurs within ECMA2015 template literal", function() {
        ${describe.only("Nested expression within template", function() {
          // it.only('C++-style comment within template', function() {});,
          /**
           * it.only('C-style comment within template', function() {
           * });
           */
        })}
      });`,
    ].join("");
});
