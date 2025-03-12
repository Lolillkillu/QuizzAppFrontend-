import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizListComponent } from './components/quizlist/quizlist.component';
import { CreateQuizFormComponent } from './components/createquiz/createquiz-form.component';

const routes: Routes = [
  { path: 'quizzes', component: QuizListComponent },
  { path: 'create-quiz', component: CreateQuizFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }