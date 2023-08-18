/// <reference path="../node_modules/bun-types/types.d.ts" />

import { expect, test } from 'bun:test';
import { ExtendedPromise, ExtendedPromiseEventDetails, ExtendedPromiseEvents, PromiseStatus } from '../';

test('promise can fail', () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    reject(new Error('reason'));
  });
  expect(promise.status).toBe(PromiseStatus.FAILED);
});

test('promise can pass', () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    resolve('OK');
  });
  expect(promise.status).toBe(PromiseStatus.RESOLVED);
});

test('promise can pass later', async () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('OK')
    }, 1000);
  });
  expect(promise.status).toBe(PromiseStatus.PENDING);
  await promise;
  expect(promise.status).toBe(PromiseStatus.RESOLVED);
});

test('promise is thenable', async () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    resolve('OK');
  });
  const result = await promise;
  expect(result).toBe('OK');
});

test('promise is thenable (reject)', async () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    reject(new Error('error'));
  });
  try {
    await promise;
  } catch (err) {
    expect((err as Error).message).toBe('error');
  }
});

test('can subscribe to events', async () => {
  const promise = new ExtendedPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('OK')
    }, 1000);
  });
  promise.addEventListener(ExtendedPromiseEvents.CHANGED, (event) => {
    const customEvent = event as CustomEvent<ExtendedPromiseEventDetails<unknown>[ExtendedPromiseEvents.CHANGED]>;
    expect(customEvent.detail.status).toBe(PromiseStatus.RESOLVED);
  });
  await promise;
});
