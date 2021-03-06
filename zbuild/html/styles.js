'use strict';

function iconBackgroundImage(name) {
   return 'url(https://test.redishub.com/assets/icomoon/png20-38/' + name + '.png)';
}

var lightTheme = {
   colors: {
      body: '#b0b0b0',
      heading: '#a0a0a0',
      error: '#808080',
      link: '#13acac',
      commandKey: '#c2c2c2',
      commandParams: '#a0a0a0',
      message: '#c2c2c2',
      description: '#808080',
      result: '#a2a2a2',
      keyspaceName: '#808080'
   },
   backgroundColors: {
      body: '#101010',
      pre: '#181818'
   }
};

function createTheme(theme) {
   theme.backgroundColors.commandParams = theme.colors.body;
   return theme;
}

var theme = createTheme(lightTheme);

function assign(styles, theme) {// TODO
}

var styles = {
   resets: {
      body: {
         padding: 10,
         color: theme.colors.body,
         backgroundColor: theme.backgroundColors.body,
         fontFamily: 'verdana'
      },
      a: {
         textDecoration: 'none',
         color: theme.colors.link
      },
      "a:visited": {
         color: theme.colors.link
      },
      img_icon: {
         backgroundPosition: [0, 0],
         backgroundRepeat: 'no-repeat',
         backgroundColor: 'transparent',
         backgroundImage: iconBackgroundImage('home')
      },
      article: {
         clear: 'both',
         //cursor: 'pointer',
         marginTop: 10
      },
      pre: {
         backgroundColor: theme.backgroundColors.pre
      }
   },
   _768: {
      resets: {
         body: {
            paddingLeft: 100,
            maxWidth: 768
         }
      }
   },
   footer: {
      container: {
         minHeight: 100,
         paddingTop: 20,
         clear: 'both'
      }
   },
   header: {
      container: {
         display: 'block',
         color: theme.colors.body,
         minHeight: 30,
         clear: 'both',
         cursor: 'pointer',
         margin: [0, 0, 0, 0],
         border: 'bottom 1px #000'
      },
      icon: {
         display: 'inline-block',
         width: 20,
         height: 20
      },
      title: {
         fontSize: 18,
         fontWeight: 'bold',
         fontFamily: 'monospace',
         display: 'inline-block',
         margin: [0, 0, 0, 0],
         padding: [0, 0, 0, 12]
      },
      heading: {
         fontSize: 18,
         color: theme.colors.heading,
         fontFamily: 'monospace',
         display: 'inline-block',
         margin: [0, 0, 0, 0],
         padding: [0, 0, 0, 12]
      },
      keyspace: {
         display: 'inline-block',
         color: theme.colors.keyspaceName,
         paddingLeft: 8
      }
   },
   keyspaceHelp: {
      linkContainer: {
         lineHeight: 1.5,
         fontFamily: 'monospace',
         fontSize: 16,
         marginBottom: 6,
         color: theme.colors.link
      },
      command: {
         fontFamily: 'monospace',
         lineHeight: 1.75,
         fontSize: 14
      },
      commandDescription: {
         fontFamily: 'sansserif',
         fontStyle: 'italic',
         fontSize: 15
      }
   },
   routes: {
      path: {
         fontFamily: 'monospace',
         display: 'block',
         lineHeight: 1.5
      }
   },
   help: {
      command: {
         fontFamily: 'monospace',
         lineHeight: 1.5
      },
      linkContainer: {
         lineHeight: 1.75,
         fontFamily: 'monospace'
      }
   },
   error: {
      status: {
         fontSize: 14,
         fontStyle: 'italic',
         color: theme.colors.error
      },
      message: {
         paddingTop: 0,
         fontSize: 20,
         fontWeight: 'bold'
      },
      hintContainer: {
         display: 'block',
         margin: [10, 0, 0, 0],
         lineHeight: 1.5
      },
      hintUrl: {
         fontSize: 15,
         paddingTop: 10
      },
      hintDescription: {
         fontSize: 16,
         paddingTop: 4,
         fontStyle: 'italic'
      },
      detail: {
         lineHeight: 2,
         margin: [10, 0, 5, 0],
         padding: [0, 10, 0, 10],
         borderTop: 'solid 1px #777777'
      }
   },
   result: {
      message: {
         fontFamily: "'Ubuntu', 'Open Sans', sansserif",
         fontSize: 16,
         //fontWeight: 'bold',
         color: theme.colors.message
      },
      description: {
         fontFamily: "'Ubuntu', 'Open Sans', sansserif",
         fontSize: 15,
         lineHeight: 1.4,
         marginTop: 8,
         color: theme.colors.description
      },
      commandKey: {
         fontSize: 19,
         fontStyle: 'italic',
         color: theme.colors.commandKey
      },
      commandParams: {
         display: 'inline-block',
         padding: [0, 4],
         lineHeight: 1.5,
         margin: [4, 4, 8, 16],
         fontSize: 14,
         color: theme.colors.commandParams
      },
      reqKey: {
         padding: [8, 0, 4, 4],
         fontSize: 20,
         fontWeight: 'bold'
      },
      resultString: {
         marginTop: 8,
         fontSize: 16,
         fontFamily: 'monospace',
         color: theme.colors.result
      },
      resultArray: {
         lineHeight: 2,
         margin: [10, 0, 15, 0],
         padding: [4, 8, 4, 8],
         backgroundColor: '#181818',
         borderTop: 'solid 1px #777777'
      },
      resultTable: {
         table: {
            margin: [10, 0, 0, 0],
            borderTop: 'solid 1px #777777'
         },
         tr: {
            backgroundColor: '#848484'
         },
         td: {
            backgroundColor: '#848484'
         }
      },
      hint: {
         container: {
            margin: [15, 0, 10, 0],
            fontSize: 16,
            cursor: 'pointer',
            color: theme.colors.link
         },
         message: {
            fontSize: 16
         },
         description: {
            paddingTop: 5,
            fontSize: 15,
            fontStyle: 'italic'
         },
         link: {
            fontSize: 15
         },
         uri: {
            fontSize: 14,
            fontFamily: 'monospace'
         }
      }
   }
};

module.exports = Styles.renderStyles(styles);
module.exports.source = styles;

//throw module.exports;
//# sourceMappingURL=styles.js.map