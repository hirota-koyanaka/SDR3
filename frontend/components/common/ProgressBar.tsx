'use client'

import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200 -translate-y-1/2" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          
          return (
            <div key={step.number} className="relative flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 z-10
                  ${isCompleted 
                    ? 'bg-primary text-white' 
                    : isCurrent 
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? <Check size={20} /> : step.number}
              </div>
              <span className={`
                absolute -bottom-6 text-xs whitespace-nowrap
                ${isCurrent ? 'text-primary font-semibold' : 'text-gray-500'}
              `}>
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}