
function iconBackgroundImage(name) {
   return `url(https://test.redishub.com/assets/icomoon/png20-38/${name}.png)`
}

const styles = {
   resets: {
      body: {
         padding: 10,
         fontFamily: 'verdana'
      },
      a: {
         textDecoration: 'none'
      },
      img_icon: {
         backgroundPosition: [0, 0],
         backgroundRepeat: 'no-repeat',
         backgroundColor: 'transparent',
         backgroundImage: iconBackgroundImage('home')
      },
      article: {
         clear: 'both',
         cursor: 'pointer',
         marginTop: 10
      },
      pre: {
         backgroundColor: '#f0f0f0'
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
   header: {
      container: {
         minHeight: 30,
         clear: 'both',
         //position: 'relative',
         cursor: 'pointer',
         margin: [0, 0, 0, 0],
         border: 'bottom 1px #000'
      },
      icon: {
         //float: 'left',
         display: 'inline-block',
         width: 20,
         height: 20
      },
      title: {
         fontFamily: 'monospace',
         //float: 'left',
         display: 'inline-block',
         margin: [0, 0, 0, 0],
         padding: [0, 0, 0, 12],
         fontSize: 18,
         color: '#808080',
         fontWeight: 'bold'
      },
      heading: {
         fontFamily: 'monospace',
         //float: 'left',
         display: 'inline-block',
         margin: [0, 0, 0, 0],
         padding: [0, 0, 0, 12],
         fontSize: 18,
         color: '#808080'
      },
      keyspace: {
         display: 'inline-block',
         paddingLeft: 8
      }
   },
   keyspaceHelp: {
      command: {
         display: 'block',
         fontFamily: 'monospace',
         lineHeight: 1.5
      }
   },
   routes: {
      path: {
         lineHeight: 2
      }
   },
   error: {
      status: {
         fontSize: 14,
         fontStyle: 'italic',
         color: '#424242'
      },
      message: {
         paddingTop: 4,
         fontSize: 20,
         fontWeight: 'bold'
      },
      detail: {
         lineHeight: 2,
         margin: [10, 0, 0, 0],
         borderTop: 'solid 1px #777777'
      }
   },
   result: {
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
         padding: 5,
         backgroundColor: '#f0f0f0',
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
      }
   }
};

module.exports = Styles.renderStyles(styles);
module.exports.source = styles;


   //throw module.exports;
