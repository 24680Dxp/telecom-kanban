import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProjectList from './pages/ProjectList'
import KanbanBoard from './pages/KanbanBoard'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: '#001529', color: '#fff', padding: '0 24px',
          height: 56, display: 'flex', alignItems: 'center', fontSize: 18,
          fontWeight: 'bold', flexShrink: 0,
        }}>
          项目看板
        </header>
        <main style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', padding: 24 }}>
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:id" element={<KanbanBoard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
