import { useState } from 'react'
import TabBar from './components/TabBar'
import ScientificCalculator from './components/ScientificCalculator'
import RatesCalculator from './components/RatesCalculator'

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
      {activeTab === 'basic' && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Basic calculator coming soon…</div>}
      {activeTab === 'scientific' && <ScientificCalculator />}
      {activeTab === 'rates' && <RatesCalculator />}
    </div>
  )
}
