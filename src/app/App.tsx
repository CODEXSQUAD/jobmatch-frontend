import { Route, Routes } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from '../pages/HomePage'
import { VacanciesPage } from '../pages/VacanciesPage'
import { HealthPage } from '../pages/HealthPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="vacancies" element={<VacanciesPage />} />
        <Route path="system" element={<HealthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
