import { ChangeDetectorRef, inject, ViewRef } from "@angular/core";
import { Subject } from "rxjs"

export const onDestroy = () => {
  const destroy$ = new Subject<void>();
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef.onDestroy(() => {
    destroy$.next();
    destroy$.complete();
  });

  return destroy$;
}

/*
*
@Component({
  selector: 'app-root',
  templateUrl: './app-component.html',
  styeUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userService = inject(UserService);

  ngOnInit(): void {
    this.userService.getUsers().pipe(takeUntil(onDestroy())).subscribe(console.log);
  }
}
*
*/
