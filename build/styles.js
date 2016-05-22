'use strict';

module.exports = {
   resets: Styles.renderStyles({
      a: {
         textDecoration: 'none'
      }
   }),
   result: Styles.renderStyles({
      commandKey: {
         fontSize: 18,
         fontStyle: 'italic',
         color: '#424242'
      },
      reqKey: {
         paddingTop: 4,
         fontSize: 20,
         fontWeight: 'bold'
      },
      resultString: {
         marginTop: 8,
         fontSize: 16,
         fontFamily: 'monospace',
         color: '#424242'
      },
      resultArray: {
         lineHeight: 2,
         margin: [10, 0, 0, 0],
         borderTop: 'solid 1px #777777'
      }
   })
};
//# sourceMappingURL=styles.js.map