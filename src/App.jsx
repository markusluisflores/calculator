import { useState } from 'react'
import TabBar from './components/TabBar'
import BasicCalculator from './components/BasicCalculator'
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
      {activeTab === 'basic' && <BasicCalculator />}
      {activeTab === 'scientific' && <ScientificCalculator />}
      {activeTab === 'rates' && <RatesCalculator />}
    </div>
  )
}
