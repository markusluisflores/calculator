import { useState } from 'react'
import TabBar from './components/TabBar'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'scientific', label: 'Scientific' },
  { id: 'rates', label: 'Rates' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div>
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
        Active: {activeTab}
      </div>
    </div>
  )
}
