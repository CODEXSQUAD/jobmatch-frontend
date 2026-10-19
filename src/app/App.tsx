import { Route, Routes } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from '../pages/HomePage'
import { VacanciesPage } from '../pages/VacanciesPage'
import { HealthPage } from '../pages/HealthPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AuthPage } from '../pages/AuthPage'
import { ResumePage } from '../pages/ResumePage'
import { ApplicationsPage } from '../pages/ApplicationsPage'
import { CompanyPage } from '../pages/CompanyPage'
import { EmployerVacanciesPage } from '../pages/EmployerVacanciesPage'
import { EmployerApplicationsPage } from '../pages/EmployerApplicationsPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="vacancies" element={<VacanciesPage />} />
        <Route path="system" element={<HealthPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="company" element={<CompanyPage />} />
        <Route path="employer/vacancies" element={<EmployerVacanciesPage />} />
        <Route path="employer/vacancies/:vacancyId/applications" element={<EmployerApplicationsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
