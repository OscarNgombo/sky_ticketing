import { createFileRoute } from '@tanstack/react-router'
import TasksPage from '../../../features/tasks/pages/TasksPage'

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: () => <TasksPage />,
})

