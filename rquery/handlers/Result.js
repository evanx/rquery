
import styles from '../html/styles';
import * as KeyspaceHelp from '../html/KeyspaceHelp';
import {default as renderPage} from '../html/Page';

const logger = Loggers.create(module.filename);

export async function sendResult(command, req, res, reqx, result) {
   const {rquery} = global;
   logger.ndebug(Loggers.keys(rquery.config, 'config'));
   assert(rquery, 'rquery');
   const userAgent = req.get('User-Agent');
   const uaMatch = userAgent.match(/\s([A-Z][a-z]*\/[\.0-9]+)\s/);
   rquery.logger.debug('sendResult ua', !uaMatch? userAgent: uaMatch[1]);
   command = command || {};
   const mobile = rquery.isMobile(req);
   rquery.logger.debug('sendResult mobile', mobile, command.key);
   if (rquery.isDevelopment(req)) {
      rquery.logger.debug('sendResult command', command.key, req.params, lodash.isArray(result));
   } else {
   }
   if (command.sendResult) {
      if (lodash.isFunction(command.sendResult)) {
         const otherResult = await command.sendResult(req, res, reqx, result);
         if (otherResult === undefined) {
            return;
         } else {
            result = otherResult;
         }
      } else {
         throw new ValidationError('command.sendResult type: ' + typeof command.sendResult);
      }
   }
   let resultString = '';
   if (!Values.isDefined(result)) {
      rquery.logger.error('sendResult none');
   } else if (Values.isDefined(req.query.json) || (command.format === 'json' && !mobile) || rquery.isJsonDomain(req)) {
      res.json(result);
      return;
   } else if (Values.isDefined(req.query.quiet)) {
   } else if (rquery.config.defaultFormat === 'cli' || Values.isDefined(req.query.line)
   || rquery.isCliDomain(req) || command.format === 'cli') {
      res.set('Content-Type', 'text/plain');
      if (lodash.isArray(result)) {
         if (mobile) {
         } else {
            resultString = result.join('\n');
         }
      } else if (lodash.isObject(result)) {
         if (command.resultObjectType === 'KeyedArrays') {
            const lines = Object.keys(result)
            .filter(key => !['message'].includes(key))
            .map(key => {
               let value = result[key];
               if (lodash.isArray(value)) {
                  const array = value;
                  return ['', key + ':'].concat(array.map(element => element.toString()));
               } else if (typeof value === 'string') {
                  if (key === 'message') {
                     return value;
                  } else {
                     return key + ': ' + value;
                  }
               } else {
                  return ['', key + ': type ' + typeof value];
               }
            });
            if (result.message) {
               lines.splice(0, 0, 'message: ' + result.message);
            }
            resultString = lodash.flatten(lines).join('\n');
         } else {
            resultString = Object.keys(result).map(key => {
               let value = result[key];
               if (parseInt(value) === value) {
                  value = parseInt(value);
               } else {
                  value = `'${value}'`;
               }
               return [key, value].join('=');
            }).join('\n');
         }
      } else if (result === null) {
      } else {
         resultString = result.toString();
      }
   } else if (rquery.config.defaultFormat === 'plain' || Values.isDefined(req.query.plain)
   || command.format === 'plain') {
      res.set('Content-Type', 'text/plain');
      if (lodash.isArray(result)) {
         resultString = result.join('\n');
      } else {
         resultString = result.toString();
      }
   } else if (rquery.config.defaultFormat === 'json' && !mobile) {
      res.json(result);
      return;
   } else if (rquery.config.defaultFormat === 'html' || Values.isDefined(req.query.html)
   || command.format === 'html' || rquery.isHtmlDomain(req) || mobile) {
      return sendHtmlResult(command, req, res, reqx, result);
   } else {
      rquery.sendError(req, res, reqx, {message: `Invalid default format: ${rquery.config.defaultFormat}`});
      return;
   }
   res.send(resultString + '\n');
}

function sendHtmlResult(command, req, res, reqx, result) {
   const {rquery} = global;
   let title = rquery.config.serviceLabel;
   let heading, icon;
   if (reqx.account && reqx.keyspace) {
      const keyspaceLabel = KeyspaceHelp.obscureKeyspaceLabel(reqx);
      title = `${reqx.account}/${keyspaceLabel}`;
      heading = [Hc.b(reqx.account), Hs.tt(styles.header.keyspace, keyspaceLabel)].join('');
      icon = 'database';
   }
   let resultString = '';
   let resultArray = [];
   if (!Values.isDefined(result)) {
   } else if (result === null) {
   } else if (Values.isInteger(result)) {
      resultString = result.toString();
   } else if (lodash.isString(result)) {
      resultString = result;
   } else if (lodash.isArray(result)) {
      if (lodash.isFunction(command.renderHtmlEach)) {
         resultArray = result.map(element => command.renderHtmlEach(req, res, reqx, element));
      } else {
         resultArray = lodash.flatten(result.map(element => {
            if (lodash.isObject(element)) {
               if (element.url && element.content) {
                  if (rquery.isBrowser(req)) {
                     return He.a({href: element.url}, element.content);
                  } else {
                     return [element.content, element.url];
                  }
               }
            }
            return element;
         }));
      }
   } else if (lodash.isObject(result)) {
      resultArray = Object.keys(result).map(key => `<b>${key}</b> ${result[key]}`);
   } else if (result) {
      resultString = result.toString();
   }
   res.set('Content-Type', 'text/html');
   const content = [];
   rquery.logger.debug('sendResult reqx', reqx, command, resultString, resultArray.length);
   if (command.key) {
      content.push(Hso.div(styles.result.commandKey, command.key.replace(/-/g, ' ')));
   }
   if (reqx.key) {
      content.push(Hso.div(styles.result.reqKey, reqx.key));
   }
   if (command.params) {
      content.push(Hso.pre(styles.result.commandParams, command.params
         .filter(key => key !== 'key')
         .map(key => `<b>${key}</b> ${req.params[key]}`)
         .join('\n'))
      );
      rquery.logger.info('params', lodash.last(content));
   }
   let statusCode = 200;
   let emptyMessage;
   if (resultArray.length) {
      if (resultString) {
         rquery.logger.error('sendResult resultString', command, req.path);
      }
   } else if (!resultString) {
      //statusCode = 404;
      resultString = '<i>&lt;empty&gt;</i>';
   }
   if (resultString) {
      resultArray.push(resultString);
   }
   content.push(Hs.pre(styles.result.resultArray, lodash.compact(resultArray).join('\n')));
   let hints = [];
   if (command && reqx.account && reqx.keyspace && rquery.isBrowser(req)) {
      if (command.relatedCommands) {
         try {
            hints = getRelatedCommandHints(req, reqx, command.relatedCommands);
         } catch (err) {
            rquery.logger.error('related', err, err.stack);
         }
      }
      if (reqx.account !== 'hub') {
         hints.push({
            path: `/keyspaces/${reqx.account}`,
            description: 'view account keyspaces'
         });
      }
      if (false) {
         hints.push({
            url: `https://telegram.me/${rquery.config.adminBotName}?start`,
            description: `See @${rquery.config.adminBotName} on Telegram.org`
         });
      }
      if (false) {
         hints.push({
            url: `/ak/${reqx.account}/${reqx.keyspace}/help`,
            description: 'account keyspace home'
         });
      }
      let renderedPathHints = rquery.isCliDomain(req)
      ? []
      : hints.filter(hint => !hint.url)
      .map(hint => {
         if (!hint.path) {
            const path = HtmlElements.renderPath(['ak', reqx.account, reqx.keyspace, ...hint.uri].join('/'));
            hint = Object.assign({path}, hint);
         }
         return hint;
      })
      .map(hint => {
         let uriLabel;
         if (hint.uri) {
            uriLabel = [Hc.b(hint.uri[0]), ...hint.uri.slice(1)].join('/');
         } else if (hint.path && hint.path[0] === '/') {
            const parts = hint.path.split('/').slice(1);
            if (parts.length === 1) {
               uriLabel = `<b>${parts[0]}</b>`;
            } else {
               uriLabel = `<b>${parts[0]}</b>/${parts.slice(1).join('/')}`;
            }
         }
         rquery.logger.debug('hint', uriLabel, hint);
         return He.div({
            style: styles.result.hint.container,
            onClick: HtmlElements.onClick({href: hint.path})
         }, [
            Hso.div(styles.result.hint.message, hint.message),
            Hso.div(styles.result.hint.link, `Try: ` + Hs.tt(styles.result.hint.uri, uriLabel)),
            Hso.div(styles.result.hint.description, lodash.capitalize(hint.description))
         ]);
      });
      renderedPathHints = renderedPathHints.concat(hints
         .filter(hint => hint.url && !hint.uri)
         .map(hint => {
            return hint;
         })
         .map(hint => {
            let uriLabel = hint.path;
            if (hint.uri) {
               uriLabel = [Hc.b(hint.uri[0]), ...hint.uri.slice(1)].join('/');
            }
            return He.div({
               style: styles.result.hint.container,
               onClick: HtmlElements.onClick({href: hint.url})
            }, [
               He.div({
                  style: styles.result.hint.message,
                  meta: 'optional'
               }, hint.message),
               Hso.div(styles.result.hint.link),
               Hso.div(styles.result.hint.description, lodash.capitalize(hint.description))
            ]);
         }));
         rquery.logger.debug('renderedPathHints', renderedPathHints);
         content.push(renderedPathHints);
         const otherHints = hints.filter(hint => !hint.uri && hint.commandKey);
         const renderedOtherHints = otherHints.map(hint => He.div({
            style: styles.result.hint.container
         }, [
            Hso.div(styles.result.hint.message, hint.message),
            Hso.div(styles.result.hint.link, `Try: ` + Hs.tt(styles.result.hint.uri, Hc.b(hint.commandKey))),
            Hso.div(styles.result.hint.description, hint.description)
         ]));
         content.push(renderedOtherHints);
      }
      res.status(statusCode).send(renderPage({
         config: rquery.config, req, reqx, title, heading, icon, content
      }));
   }

   function getRelatedCommandHints(req, reqx, relatedCommands) {
      const {rquery} = global;
      return lodash.compact(relatedCommands
         .map(commandKey => rquery.commandMap.get(commandKey))
         .filter(command => command && command.key && command.params)
         .filter(command => !rquery.isSecureDomain(req)
         || !command.access || lodash.includes(['get', 'debug']
         , command.access))
         .map(command => {
            let uri = [command.key];
            const params = command.params
            .map(key => {
               let value = req.params[key] || [];
               if (command && command.exampleKeyParams && command.exampleKeyParams.hasOwnProperty(key)) {
                  value = command.exampleKeyParams[key]
               }
               rquery.logger.info('related', key, value);
               return value;
            });
            rquery.logger.info('related params', params);
            if (params.length !== command.params.length) {
               rquery.logger.warn('params length', command);
               return null;
            } else {
               uri = uri.concat(...params);
            }
            return {
               uri,
               description: command.description
            };
         })
      );
   }
