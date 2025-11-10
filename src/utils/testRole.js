// Temporary utility to set user role for testing
// In real app, this would come from backend authentication

export const setTestRole = (role) => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      user.role = role
      localStorage.setItem('userInfo', JSON.stringify(user))
    } catch (e) {
      // If no valid userInfo, create a basic one
      const basicUser = {
        id: localStorage.getItem('userId') || 'test_user',
        role: role
      }
      localStorage.setItem('userInfo', JSON.stringify(basicUser))
    }
  } else {
    // Create basic user info
    const basicUser = {
      id: localStorage.getItem('userId') || 'test_user',
      role: role
    }
    localStorage.setItem('userInfo', JSON.stringify(basicUser))
  }
  
  // Reload page to apply changes
  window.location.reload()
}

export const createRoleTestButtons = () => {
  const container = document.createElement('div')
  container.className = 'fixed bottom-4 right-4 space-y-2 z-50'
  container.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `

  const teacherBtn = document.createElement('button')
  teacherBtn.textContent = 'Set Teacher'
  teacherBtn.className = 'px-3 py-1 bg-green-600 text-white text-xs rounded'
  teacherBtn.style.cssText = `
    padding: 0.25rem 0.75rem;
    background-color: #059669;
    color: white;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
  `
  teacherBtn.onclick = () => setTestRole('teacher')

  const studentBtn = document.createElement('button')
  studentBtn.textContent = 'Set Student'
  studentBtn.className = 'px-3 py-1 bg-blue-600 text-white text-xs rounded'
  studentBtn.style.cssText = `
    padding: 0.25rem 0.75rem;
    background-color: #2563eb;
    color: white;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
  `
  studentBtn.onclick = () => setTestRole('student')

  container.appendChild(teacherBtn)
  container.appendChild(studentBtn)
  
  return container
}