/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: 'Require a blank line after the `"worklet";` directive',
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingBlankLine: 'Insert a blank line after `"worklet";`.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function isWorkletDirective(node) {
      return (
        node.type === "ExpressionStatement" &&
        node.expression.type === "Literal" &&
        node.expression.value === "worklet"
      );
    }

    function hasBlankLineAfter(node) {
      const nextToken = sourceCode.getTokenAfter(node, { includeComments: false });
      if (!nextToken) {
        return true;
      }

      return nextToken.loc.start.line >= node.loc.end.line + 2;
    }

    return {
      ExpressionStatement(node) {
        if (!isWorkletDirective(node) || hasBlankLineAfter(node)) {
          return;
        }

        context.report({
          node,
          messageId: "missingBlankLine",
          fix(fixer) {
            return fixer.insertTextAfter(node, "\n");
          },
        });
      },
    };
  },
};
