describe("top-level suite gulp-acorn-ddescribe-iit", function() {
  fit("focused spec", function() {

  });

  // fit('disabled by C++-style comment', function () { });

  /**
   * fit('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "fit('occurs within double-quote string literal', function() {",
     "});",

     'fit("occurs within single-quote string literal", function() {',
     '});',

      `fit("occurs within ECMA2015 template literal", function() {
        ${fdescribe("Nested expression within template", function() {
          // fit('C++-style comment within template', function() {});,
          /**
           * fit('C-style comment within template', function() {
           * });
           */
        })}
      });`,
    ].join("");
});

fdescribe("top-level focused suite gulp-acorn-ddescribe-iit", function() {
  fit("exclusive test", function() {

  });

  // fit('disabled by C++-style comment', function () { });

  /**
   * fit('disabled by C-style comment', function() {
   *    nada nada nada nada
   * });
   */

   var tests = [
     "fit('occurs within double-quote string literal', function() {",
     "});",

     'fit("occurs within single-quote string literal", function() {',
     '});',

      `fit("occurs within ECMA2015 template literal", function() {
        ${fdescribe("Nested expression within template", function() {
          // fit('C++-style comment within template', function() {});,
          /**
           * fit('C-style comment within template', function() {
           * });
           */
        })}
      });`,
    ].join("");
});
