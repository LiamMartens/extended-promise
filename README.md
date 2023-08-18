# Extended Promise

This library provides an extended Promise with status management

## Usage
```js
import { ExtendedPromise, PromiseStatus } from 'extended-promise';

/**
 * @README the internal promise will always resolve
 * for a rejecting promise you can use the ExtendedPromise itself since it implements `PromiseLike`
 * Additionally, the extended promise class extends EventTarget and emits a `changed` event for status changes
 */
const promise = new ExtendedPromise((resolve, reject) => {
  reject(new Error('Error'))
});
expect(promise.status).toBe(PromiseStatus.FAILED);
```
