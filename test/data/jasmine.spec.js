describe("top-level suite gulp-acorn-ddescribe-iit", function() {
  iit("focused spec", function() {

  });

  // iit('disabled by C++-style comment', function () { });

  /**
   * iit('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "iit('occurs within double-quote string literal', function() {",
     "});",

     'iit("occurs within single-quote string literal", function() {',
     '});',

      `iit("occurs within ECMA2015 template literal", function() {`,
        ${ddescribe("Nested expression within template", function() {
          // iit('C++-style comment within template', function() {});,
          /**
           * iit('C-style comment within template', function() {
           * });
           */
        })}
     `});`,
    ].join("");
});

ddescribe("top-level focused suite gulp-acorn-ddescribe-iit", function() {
  iit("exclusive test", function() {

  });

  // iit('disabled by C++-style comment', function () { });

  /**
   * iit('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "iit('occurs within double-quote string literal', function() {",
     "});",

     'iit("occurs within single-quote string literal", function() {',
     '});',

      `iit("occurs within ECMA2015 template literal", function() {
        ${ddescribe("Nested expression within template", function() {
          // iit('C++-style comment within template', function() {});,
          /**
           * iit('C-style comment within template', function() {
           * });
           */
        })}
      });`,
    ].join("");
});
