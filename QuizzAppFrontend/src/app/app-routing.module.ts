import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizListComponent } from './components/quizlist/quizlist.component';

const routes: Routes = [
  { path: 'quizzes', component: QuizListComponent }
  //{ path: '', redirectTo: '/quizzes', pathMatch: 'full' },
  //{ path: '**', redirectTo: '/quizzes' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }