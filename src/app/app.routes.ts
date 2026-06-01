import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { AppLayoutComponent } from './layouts/app/app';
import { LaboratoriesComponent } from './pages/laboratories/laboratories.component';
import { UserExamsComponent } from './pages/user-exams/user-exams.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                component: HomeComponent,
                pathMatch: 'full'
            },
            {   
                path: 'profile',
                component: UserProfileComponent,
                canActivate: [authGuard]
            },
            {
                path: 'schedule',
                component: ScheduleComponent,
                canActivate: [authGuard]
            },
            {
                path: 'exams',
                component: UserExamsComponent,
                canActivate: [authGuard]
            },
            {
                path: 'laboratories',
                component: LaboratoriesComponent
            }
        ]
    },
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    }
];
