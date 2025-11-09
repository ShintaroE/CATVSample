'use client'

import React, { useState } from 'react'
import { AdditionalCosts } from '@/app/orders/types'
import ClosureExpansion from './ClosureExpansion'
import RoadApplication from './RoadApplication'
import OtherCompanyRepair from './OtherCompanyRepair'
import NWEquipment from './NWEquipment'
import ServiceLineApplication from './ServiceLineApplication'

interface AdditionalCostsSectionProps {
  data: AdditionalCosts
  onChange: (data: AdditionalCosts) => void
}

export default function AdditionalCostsSection({
  data,
  onChange,
}: AdditionalCostsSectionProps) {
  const [isMainOpen, setIsMainOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    closureExpansion: false,
    roadApplication: false,
    otherCompanyRepair: false,
    nwEquipment: false,
    serviceLineApplication: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsMainOpen(!isMainOpen)}
        className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
      >
        <h4 className="text-md font-medium text-gray-900">各種追加費用</h4>
        <span className="text-gray-500 text-lg">
          {isMainOpen ? '▼' : '▶'}
        </span>
      </button>

      {isMainOpen && (
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <ClosureExpansion
            data={data.closureExpansion}
            onChange={(closureExpansion) =>
              onChange({ ...data, closureExpansion })
            }
            isOpen={openSections.closureExpansion}
            onToggle={() => toggleSection('closureExpansion')}
          />

          <RoadApplication
            data={data.roadApplication}
            onChange={(roadApplication) =>
              onChange({ ...data, roadApplication })
            }
            isOpen={openSections.roadApplication}
            onToggle={() => toggleSection('roadApplication')}
          />

          <OtherCompanyRepair
            data={data.otherCompanyRepair}
            onChange={(otherCompanyRepair) =>
              onChange({ ...data, otherCompanyRepair })
            }
            isOpen={openSections.otherCompanyRepair}
            onToggle={() => toggleSection('otherCompanyRepair')}
          />

          <NWEquipment
            data={data.nwEquipment}
            onChange={(nwEquipment) => onChange({ ...data, nwEquipment })}
            isOpen={openSections.nwEquipment}
            onToggle={() => toggleSection('nwEquipment')}
          />

          <ServiceLineApplication
            data={data.serviceLineApplication}
            onChange={(serviceLineApplication) =>
              onChange({ ...data, serviceLineApplication })
            }
            isOpen={openSections.serviceLineApplication}
            onToggle={() => toggleSection('serviceLineApplication')}
          />
        </div>
      )}
    </div>
  )
}
