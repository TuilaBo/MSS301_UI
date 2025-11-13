import { useSearchParams } from 'react-router-dom'
import TeacherTestForm from './TeacherTestForm'

function TeacherTestUpdate({ onNavigate }) {
  const [searchParams] = useSearchParams()
  const testId = searchParams.get('testId')

  return <TeacherTestForm onNavigate={onNavigate} mode="update" initialTestId={testId} />
}

export default TeacherTestUpdate

