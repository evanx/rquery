
## hprint

I'm thinking of how to potentially express small templates in ES6, inspired by React.

Of course we must use JSX, or its `DOM` methods. This is just for fun.

### Some initial design thoughts

#### Stylesheets

Let's consider React-type stylesheets.

```javascript

export const styles = {
   resets: {
      a: {
         visited: { // recognised pseudo
            textDecoration: 'none',
            color: '#800000'
         }
      }
   },
   resultLine: {
      pseudo: 'nth-child(2)',
      background: '#c0c0c0',
   },
   status: {
      container: {
         assign: [styles.other, require('other').container],
         fontSize: 14,
         media: {
            minWidth1024: {
               padding: 10,
            },
         }
      }
   }
};
```
where we nested styles, and support custom keys:
- pseudo class names
- `assign` to coalesce styles via `Object.assign()`
- `pseudo` to specify CSS pseudo class names

We must support "media" stylesheets e.g. `minWidth1024` is a user-defined tag for some device groups, to generate a stylesheet called `minWidth1024.` That stylesheet can be included by clients on demand using a CSS media query in its `link` element.

So we might use in-line styles to be mobile-first, and provide an extra stylesheet for tablets, desktops etc.

While we could use the HTTP `Vary: User-Agent` header for CDN pages, there are very many mobile devices and that makes caching less effective.

Alternatively we could redirect non-mobile users to a different domain e.g. `w.mysite.com` which as `link rel=canonical` to `mysite.com.` Perhaps even `www.mysite.com` for non-mobile, where we promote `mysite.com` as the default ;)

#### Style objects

We should transform such stylesheets into a style object:
```javascript
  status: {
     key: 'status',
     container: {
        parentKeys: ['status'],
        key: 'container',
        css: 'fontSize:14px',
        styles: {
           fontSize: 14,
        },
```
where:
- record each set of original style properties as `styles`
- record the keys and parent keys
- cache the rendered `css`

When rendering a document, we can build class names e.g. `status-container` if we so wish.


#### Elements

Let's assume we have default HTML renderer, but can use other presets and custom renderers as well:
```javascript
const renderers = {
  injectStyle: Html.renderers.injectStyle,
  disabled: (context, name, attributes, children) => {
     if (children.length) {
       context.warn(`ignoring children (length ${children.length})`);
     }
     return '';
  }
};
```

##### Utility element construction functions

Let's consider creating objects whose properties are functions named for each HTML element:
```javascript
export function renders(names, renderer) {
   return names.reduce((accumulator, name) => {
      accumulator[name] = (...args) => renderer(name, ...args);
      return accumulator;
   }, {});
}
```
where renderers can access the context, if required.

Our default elements expect an attributes object as the first argument:
```javascript
  $.span({}, 'ipso whatsum')
```

Alternatively if the first argument is a function, then its a renderer:
```javascript
  $.style(Html.styleSheetRenderer, stylesheet)
```

Actually, the default HTML renderer should handle elements as expected:
```javascript
  if (name === 'pre') {
    return Html.preRenderer;
  }
  if (name === 'style') {
    return Html.styleRenderer;
  }
```

For example:
```javascript
const preRenderer = (context, name, attributes, children) => {
    return context.next(name, attributes,
      children.reduce((accumulator, child) => {
      return accumulator + context.renderChild(child) + '\n'
    }, ''));
  }
};
```

We might specify an array of renderers as the first argument:
```javascript
  $.pre($.composeRenderers(r.limitContentLength, r.preformattedRenderer), {}, 'first line', 'second line')
```
where we `reduce` the content via those chained renderers.

Passing in styles and renderers, we could render an HTML document as follows:
```javascript
Html.renderDocument({styles, renderers}, ($, s, r) => [
   $.html({},
      $.head({},
        $.title({}, pageTitle);
     ),
      $.body({},
         $.h2({style: s.heading}, 'My Heading')
      ),
   );
]);
```
where the declared styles and renderers are passed as the context.

We should support optional values:
```javascript
  $.div(r.omitIfEmpty, {classes}, children);
```

And optional collections:
```javascript
  $.div(r.map(message => $.p({}, message)), {}, messages)
```

##### Utility atributes reducer

Perhaps the renderers and attributes object can be collected into array:
```javascript
  $.p([r.omitIfEmpty, $.classes('red')], errorMessage)
```
where the array can be reduced into the `attributes` object by the default reducer:
```javascript
  const utilityReducer = (context, name, array, children) => {
    const renderers = array.filter(item => lodash.isFunction(item));
    const attributes = array.filter(item => !renderers.includes(item));
    const errors = attributes.map(attribute => context.validateAttribute(attribute));
    if (errors.length) throw {message: 'Invalid attributes'};
    return context.next(renderers,
       attributes.reduce((accumulator, attribute) => {
         accumulator[attribute.key] = attribute.value;
         return accumulator;           
        }, {});
     );
   };
```

https://twitter.com/evanxsummers
