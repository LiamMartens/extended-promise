type ResolveFn<R> = (result: R) => void;
type RejectFn = (reason: unknown) => void;

export enum PromiseStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  FAILED = 'failed',
}

export enum ExtendedPromiseEvents {
  CHANGED = 'changed',
}

export type PromiseFailedValueType = {
  symbol: typeof PROMISE_FAILED_VALUE_SYMBOL;
  reason: unknown;
};

export type ExtendedPromiseEventDetails<R> = {
  [ExtendedPromiseEvents.CHANGED]: {
    status: PromiseStatus;
    previousStatus: PromiseStatus;
    promise: Promise<R | PromiseFailedValueType>;
  };
};

export const PROMISE_FAILED_VALUE_SYMBOL = Symbol(
  'The return value of a failed internal promise'
);

export class ExtendedPromise<R> extends EventTarget implements PromiseLike<R> {
  private $internalStatus: PromiseStatus;
  private $internalPromise: Promise<R | PromiseFailedValueType>;

  public get status() {
    return this.$internalStatus;
  }

  public get promise() {
    return this.$internalPromise;
  }

  constructor(
    fn: (resolve: ResolveFn<R>, reject: RejectFn) => void | Promise<void>
  ) {
    super();
    this.$internalStatus = PromiseStatus.PENDING;
    this.$internalPromise = new Promise<R | PromiseFailedValueType>(
      (resolve, reject) => {
        fn(
          (result) => {
            const previousStatus = this.$internalStatus;
            this.$internalStatus = PromiseStatus.RESOLVED;
            this.dispatchEvent(
              new CustomEvent(ExtendedPromiseEvents.CHANGED, {
                detail: {
                  previousStatus,
                  status: this.$internalStatus,
                  promise: this.$internalPromise,
                } satisfies ExtendedPromiseEventDetails<R>[ExtendedPromiseEvents.CHANGED],
              })
            );
            return resolve(result);
          },
          (reason) => {
            const previousStatus = this.$internalStatus;
            this.$internalStatus = PromiseStatus.FAILED;
            this.dispatchEvent(
              new CustomEvent(ExtendedPromiseEvents.CHANGED, {
                detail: {
                  previousStatus,
                  status: this.$internalStatus,
                  promise: this.$internalPromise,
                } satisfies ExtendedPromiseEventDetails<R>[ExtendedPromiseEvents.CHANGED],
              })
            );
            return reject(reason);
          }
        );
      }
    ).catch((err) => {
      return {
        symbol: PROMISE_FAILED_VALUE_SYMBOL,
        reason: err,
      };
    });
  }

  then<TResult1 = R, TResult2 = never>(
    onfulfilled?:
      | ((value: R) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): PromiseLike<TResult1> {
    return new Promise<TResult1>((resolve, reject) => {
      this.$internalPromise.then((value) => {
        if (
          value &&
          typeof value === 'object' &&
          'symbol' in value &&
          value.symbol === PROMISE_FAILED_VALUE_SYMBOL
        ) {
          const result = onrejected?.(value.reason);
          if (result) reject(result);
        } else {
          const result = onfulfilled?.(value as R);
          if (result) resolve(result);
        }
      });
    });
  }
}
