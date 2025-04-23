import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizListComponent } from './components/quizlist/quizlist.component';
import { CreateQuizFormComponent } from './components/createquiz/createquiz-form.component';
import { AddQuestionComponent } from './components/addquestion/addquestion.component';
import { DeleteQuizComponent } from './components/deletequiz/deletequiz.component';
import { QuizDetailComponent } from './components/quizdetail/quizdetail.component';

const routes: Routes = [
  { path: 'quizzes', component: QuizListComponent },
  { path: 'create-quiz', component: CreateQuizFormComponent },
  { path: 'quizzes/:quizId/add-question', component: AddQuestionComponent },
  { path: 'delete-quiz', component: DeleteQuizComponent },
  { path: 'quizzes/:id', component: QuizDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }