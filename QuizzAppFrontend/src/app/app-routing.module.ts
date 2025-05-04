import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizListComponent } from './components/quizlist/quizlist.component';
import { CreateQuizFormComponent } from './components/createquiz/createquiz-form.component';
import { AddQuestionComponent } from './components/addquestion/addquestion.component';
import { DeleteQuizComponent } from './components/deletequiz/deletequiz.component';
import { QuizDetailComponent } from './components/quizdetail/quizdetail.component';
import { EditQuestionComponent } from './components/editquestion/editquestion.component';
import { EditAnswerComponent } from './components/editanswer/editanswer.component';

const routes: Routes = [
  { path: 'quizzes', component: QuizListComponent },
  { path: 'create-quiz', component: CreateQuizFormComponent },
  { path: 'quizzes/:quizId/add-question', component: AddQuestionComponent },
  { path: 'delete-quiz', component: DeleteQuizComponent },
  { path: 'quizzes/:id', component: QuizDetailComponent },
  { path: 'quizzes/:quizId/editquestion/:questionId', component: EditQuestionComponent },
  { path: 'quizzes/:quizId/questions/:questionId/answers/:answerId/edit', component: EditAnswerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }