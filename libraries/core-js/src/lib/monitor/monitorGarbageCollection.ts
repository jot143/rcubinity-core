import { Observable, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

export function monitorGarbageCollection(targetObject: any) {
  return new Observable(subscriber => {
    const ref = new WeakRef(targetObject);
    const registry = new FinalizationRegistry(heldValue => {
      subscriber.next(`${heldValue} has been garbage collected`);
      subscriber.complete();
    });

    registry.register(targetObject, 'TargetObject', ref);

    // Periodically check if the object is still around
    const checkInterval = interval(1000).pipe(
      takeWhile(() => ref.deref() !== undefined)
    );

    const subscription = checkInterval.subscribe({
      next: () => {
        const derefObject = ref.deref();
        if (derefObject) {
          subscriber.next('TargetObject is still around');
        } else {
          subscriber.next('TargetObject has been dereferenced');
        }
      },
      complete: () => {
        subscriber.complete();
      }
    });

    return () => {
      subscription.unsubscribe();
      registry.unregister(ref);
    };
  });
}

// Usage
// class MyClass {
//   constructor(name) {
//     this.name = name;
//   }
// }

// let myObject = new MyClass('Example');

// const subscription = monitorGarbageCollection(myObject).subscribe({
//   next: message => console.debug(message),
//   complete: () => console.debug('Observation complete')
// });

// // Simulate dereferencing the object
// setTimeout(() => {
//   myObject = null;
// }, 3000);
