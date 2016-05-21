
## Destructuring RegExp

It's convenient to use ES6 destructuring for matching regexp groups:
```javascript
   const email = 'user.name@gmail.com';
   const [matching, user, domain] = email.match(
      /^([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})$/i
   ) || [];
   console.log({email, matching, user, domain});
}
```
where we ensure at least an empty array, since `match` might return `null.`

```javascript
{ email: 'user.name@gmail.com',
  matching: 'user.name@gmail.com',
  user: 'user.name',
  domain: 'gmail.com' }
```

https://twitter.com/@evanxsummers
