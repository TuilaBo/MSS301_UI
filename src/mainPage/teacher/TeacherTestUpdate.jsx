import TeacherTestForm from './TeacherTestForm'
import { useHashParams } from '../../hooks/useHashParams'

function TeacherTestUpdate({ onNavigate }) {
  const params = useHashParams()
  const testId = params.get('testId')

  return <TeacherTestForm onNavigate={onNavigate} mode="update" initialTestId={testId} />
}

export default TeacherTestUpdate

