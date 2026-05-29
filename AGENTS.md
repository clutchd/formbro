# FormBro Agent Guide

Read the code to understand what's going on, yes even node_modules.

## Mission

FormBro is the open-source form layer for serious workflows.

## Philosophy

We have a few philosophies we should always honor:

### Performance above all else

When in doubt, do the thing that makes the app feel the fastest to use.

- Optimistic updates
- Avoiding waterfalls
- etc.

### Good defaults

Users should expect things to behave well by default. Less config is best.

### Convenience

We should not compromise on simplicity and good ux. We want to be pleasant to use with as little friction as possible.

- Less clicks to get to where you want to go
- Minimize blocking states to let users perform actions asap

### Security

We want to make things convenient, but we don't want to be insecure. Be thoughtful about how things are implemented.
