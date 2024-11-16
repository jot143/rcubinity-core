import { Observable, Subject } from 'rxjs';

import { Injectable, Injector } from '@angular/core';

/*
Adding and Using Actions:

constructor(private hookService: HookService) {
   this.hookService.addAction('firstHook', 10).subscribe((data) => {
      console.info(data); //use data
   });

   this.hookService.addAction('firstHook', 5).subscribe((data) => {
      console.info(data); //use data
   });
}

async triggerAction() {
  const initialData = { someData: 'test' };
  await this.hookService.doAction('myAction', initialData);
}
*/

/*
Adding and Using Filters:

constructor(private hookService: HookService) {
 this.hookService.addFilter('myFilter', async data => {
    return await { ...data, filteredBy1: 'filter1' }; // Modify data
  }, 5);

  this.hookService.addFilter('myFilter', async data => {
    return await { ...data, filteredBy2: 'filter2' }; // Further modify data
  }, 10);
}

applyFilters() {
  const initialData = { someData: 'test' };
  const filteredData = await this.hookService.applyFilter('myFilter', initialData);
  console.info('Filtered Data:', filteredData);
}
*/

/*
Add and using Function Filters:
  @applyFnFilter('myFilter') // Replacing the method with filtered arguments
  async myOtherFunction(arg1: any, arg2: any) {
    // Original function logic using filtered arguments
    return arg1 + arg2;
  }

  this.hookService.addFilterHandler(
      'myFilter',
      async (args: any) => {
        return await args.reduce((a: any, b: any) => a * b, 1); // Modify data
      },
      5
  );
*/

export function applyFnFilter(filterName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // const injector = Injector.create({ providers: [{ provide: HookService, deps: [] }] });
      // const hookService = injector.get(HookService);

      const hookService = (this as any).hookService as HookService;

      if (hookService && hookService instanceof HookService) {
        if (hookService.filterHandlers) {
          for (const handler of hookService.filterHandlers[filterName]) {
            return await handler.filterFn(args);
          }
        }
      } else {
        console.error('hookService is not inject in this class');
      }

      // Execute the original method
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

@Injectable({
  providedIn: 'root',
})
export class HookService {
  private actions: { [key: string]: { priority: number; subject: Subject<any> }[] } = {};
  private filters: { [key: string]: { priority: number; filterFn: (data: any) => any }[] } = {};
  public filterHandlers: { [key: string]: { priority: number; filterFn: (data: any) => any }[] } = {};

  // Add an action
  addAction(actionName: string, priority: number = 10): Observable<any> {
    if (!this.actions[actionName]) {
      this.actions[actionName] = [];
    }

    const subject = new Subject<any>();
    this.actions[actionName].push({ priority, subject });

    // Sort actions by priority
    this.actions[actionName].sort((a, b) => a.priority - b.priority);

    return subject.asObservable();
  }

  // Execute all actions
  async doAction(actionName: string, data: any = null) {
    if (this.actions[actionName]) {
      for (const hook of this.actions[actionName]) {
        hook.subject.next(data);
        hook.subject.complete();
      }
    }

    return data;
  }

  // Add a filter
  addFilter(filterName: string, filterFn: (data: any) => any, priority: number = 10) {
    if (!this.filters[filterName]) {
      this.filters[filterName] = [];
    }

    this.filters[filterName].push({ priority, filterFn });

    // Sort filters by priority
    this.filters[filterName].sort((a, b) => a.priority - b.priority);
  }

  // Apply all filters
  async applyFilter(filterName: string, data: any): Promise<any> {
    if (this.filters[filterName]) {
      for (const filter of this.filters[filterName]) {
        data = await filter.filterFn(data);
      }
    }
    return data;
  }

  // Add a filter handler
  addFilterHandler(filterName: string, filterFn: (data: any) => any, priority: number = 10) {
    if (!this.filterHandlers[filterName]) {
      this.filterHandlers[filterName] = [];
    }

    this.filterHandlers[filterName].push({ priority, filterFn });

    // Sort filter handlers by priority
    this.filterHandlers[filterName].sort((a, b) => a.priority - b.priority);
  }
}
