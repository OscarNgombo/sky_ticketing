import { createFileRoute } from '@tanstack/react-router';
import TasksPage from '../../features/tasks/pages/TasksPage';

export const Route = createFileRoute('/tasks/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TasksPage />;
}
