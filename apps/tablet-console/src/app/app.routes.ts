import { Routes } from '@angular/router';
import { HomeConsoleComponent } from './components/home-console/home-console';
import { UnityMailPocComponent } from './components/unity-mail-poc/unity-mail-poc';

export const routes: Routes = [
  { path: '', component: HomeConsoleComponent },
  { path: 'unity-mail', component: UnityMailPocComponent },
  { path: '**', redirectTo: '' }
];
