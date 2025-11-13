import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { adminService } from '../../service/adminService'

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch (err) {
    console.error('Không thể format thời gian:', err)
    return value
  }
}

const normalizeText = (value) => (value || '').toString().toLowerCase()

function AdminAccounts() {
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('teachers')

  useEffect(() => {
    let isMounted = true

    const fetchAccounts = async () => {
      setLoading(true)
      setError('')

      try {
        const [teacherData, studentData] = await Promise.all([
          adminService.getTeacherAccounts(),
          adminService.getStudentAccounts(),
        ])
        if (isMounted) {
          setTeachers(Array.isArray(teacherData) ? teacherData : [])
          setStudents(Array.isArray(studentData) ? studentData : [])
        }
      } catch (err) {
        console.error('Không thể tải danh sách tài khoản:', err)
        if (isMounted) {
          setError(err.message || 'Không thể tải danh sách tài khoản. Vui lòng thử lại.')
          setTeachers([])
          setStudents([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAccounts()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const dataset = activeTab === 'teachers' ? teachers : students

  const filteredAccounts = useMemo(() => {
    const keyword = normalizeText(searchTerm)
    if (!keyword) return dataset

    return dataset.filter((account) => {
      return [
        account.fullName,
        account.username,
        account.email,
        account.grade,
        account.role?.roleName || account.role,
      ]
        .filter(Boolean)
        .some((value) => normalizeText(value).includes(keyword))
    })
  }, [dataset, searchTerm])

  const activeCount = useMemo(() => filteredAccounts.filter((t) => t.active).length, [filteredAccounts])
  const inactiveCount = Math.max(filteredAccounts.length - activeCount, 0)
  const applyAccountUpdate = (updatedAccount) => {
    setTeachers(prev =>
      prev.map(item => (item.userId === updatedAccount.userId ? updatedAccount : item))
    )
    setStudents(prev =>
      prev.map(item => (item.userId === updatedAccount.userId ? updatedAccount : item))
    )
    if (selectedAccount && typeof selectedAccount === 'object' && selectedAccount.userId === updatedAccount.userId) {
      setSelectedAccount(updatedAccount)
    }
  }

  const handleToggleStatus = async (account) => {
    setStatusUpdatingId(account.userId)
    setStatusError('')
    setError('')
    try {
      const updated = await adminService.updateAccountStatus(account.userId, !account.active)
      applyAccountUpdate(updated)
    } catch (err) {
      console.error('Không thể cập nhật trạng thái tài khoản:', err)
      setStatusError(err.message || 'Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.')
    } finally {
      setStatusUpdatingId(null)
    }
  }


  const handleRefresh = () => {
    setRefreshKey(Date.now())
  }

  const headingLabel = activeTab === 'teachers' ? 'giáo viên' : 'học sinh'
  const totalLabel = activeTab === 'teachers' ? 'Tổng số giáo viên' : 'Tổng số học sinh'
  const searchPlaceholder = activeTab === 'teachers'
    ? 'Tìm giáo viên theo tên, email, username...'
    : 'Tìm học sinh theo tên, email, username...'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'teachers'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Giáo viên
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'students'
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Học sinh
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Quản lý tài khoản {headingLabel}</h1>
                <p className="text-slate-500 mt-1">
                  Theo dõi trạng thái hoạt động và thông tin liên hệ của {headingLabel} trên hệ thống.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                <span aria-hidden="true">🔄</span> Làm mới
              </button>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-5">
              <p className="text-sm text-slate-500">{totalLabel}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{filteredAccounts.length}</p>
            </div>
            <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-5">
              <p className="text-sm text-slate-500">Đang hoạt động</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{activeCount}</p>
            </div>
            <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-5">
              <p className="text-sm text-slate-500">Không hoạt động</p>
              <p className="mt-2 text-3xl font-semibold text-rose-600">{inactiveCount}</p>
            </div>
          </section>

          <section className="bg-white shadow-lg border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Danh sách {headingLabel}</h2>
                <p className="text-sm text-slate-500">
                  Theo dõi thông tin, trạng thái và chương trình đào tạo/chức danh.
                </p>
              </div>
              <div className="w-full md:w-80">
                <label className="sr-only" htmlFor="account-search">
                  Tìm kiếm tài khoản
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                  <input
                    id="account-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 hover:bg-white"
                    placeholder={searchPlaceholder}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="px-6 py-4 bg-rose-50 text-rose-700 border-y border-rose-100 text-sm">
                {error}
              </div>
            )}
            {statusError && (
              <div className="px-6 py-4 bg-amber-50 text-amber-700 border-y border-amber-100 text-sm">
                {statusError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Tên đầy đủ</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Vai trò / Lớp</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3">Ngày tạo</th>
                    <th className="px-6 py-3">Giới tính</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500 text-sm">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500 text-sm">
                        Không có {headingLabel} nào phù hợp với tiêu chí tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account) => {
                      const roleName =
                        account.role?.roleName || account.role || (activeTab === 'teachers' ? 'TEACHER' : 'STUDENT')
                      const isActive = !!account.active
                      const gender = account.gender === 'FEMALE' ? 'Nữ' : account.gender === 'MALE' ? 'Nam' : 'Khác'

                      return (
                        <tr key={account.userId} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{account.fullName || '—'}</td>
                          <td className="px-6 py-4">{account.username || '—'}</td>
                          <td className="px-6 py-4">
                            <a href={`mailto:${account.email}`} className="text-blue-600 hover:underline">
                              {account.email || '—'}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{roleName}</span>
                              <span className="text-xs text-slate-500">{account.grade || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}
                            >
                              {isActive ? 'Đang hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{formatDate(account.createdAt)}</td>
                          <td className="px-6 py-4">{gender}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(account)}
                                disabled={statusUpdatingId === account.userId}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                  account.active
                                    ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                } ${statusUpdatingId === account.userId ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {statusUpdatingId === account.userId
                                  ? 'Đang cập nhật...'
                                  : account.active
                                  ? 'Khóa'
                                  : 'Mở khóa'}
                              </button>
                              <button
                                onClick={async () => {
                                  setDetailLoading(true)
                                  setSelectedAccount(account.userId)
                                  try {
                                    const detail = await adminService.getAccountById(account.userId)
                                    setSelectedAccount(detail)
                                  } catch (err) {
                                    console.error('Không thể lấy chi tiết tài khoản:', err)
                                    setError(err.message || 'Không thể lấy chi tiết tài khoản. Vui lòng thử lại.')
                                    setSelectedAccount(null)
                                  } finally {
                                    setDetailLoading(false)
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              >
                                Xem
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {selectedAccount && !detailLoading && typeof selectedAccount === 'object' && (
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Chi tiết tài khoản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Họ và tên</p>
                    <p className="text-base font-semibold text-slate-900">{selectedAccount.fullName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Username</p>
                    <p className="text-base text-slate-800">{selectedAccount.username || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-base text-slate-800">{selectedAccount.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Vai trò</p>
                    <p className="text-base text-slate-800">
                      {typeof selectedAccount.role === 'object'
                        ? selectedAccount.role?.roleName
                        : selectedAccount.role || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ngày tạo</p>
                    <p className="text-base text-slate-800">{formatDate(selectedAccount.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Trạng thái</p>
                    <p className="text-base text-slate-800">
                      {selectedAccount.active ? 'Đang hoạt động' : 'Đã khóa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Giới tính</p>
                    <p className="text-base text-slate-800">
                      {selectedAccount.gender === 'FEMALE'
                        ? 'Nữ'
                        : selectedAccount.gender === 'MALE'
                        ? 'Nam'
                        : selectedAccount.gender === 'OTHER'
                        ? 'Khác'
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Lớp / Chức danh</p>
                    <p className="text-base text-slate-800">{selectedAccount.grade || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ngày sinh</p>
                    <p className="text-base text-slate-800">
                      {selectedAccount.birthday
                        ? new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                          }).format(new Date(selectedAccount.birthday))
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {detailLoading && (
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500">
                Đang tải chi tiết tài khoản...
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminAccounts


