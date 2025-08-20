'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicationStep1 } from '@/components/user/application/Step1Basic'
import { ApplicationStep2 } from '@/components/user/application/Step2Address'
import { ApplicationStep3 } from '@/components/user/application/Step3Dogs'
import { ApplicationStep4 } from '@/components/user/application/Step4Documents'
import { ApplicationStep5 } from '@/components/user/application/Step5Confirm'
import { ProgressBar } from '@/components/common/ProgressBar'
import { applicationService } from '@/lib/api/services/application-service'
import { withErrorHandling } from '@/lib/error-handler'
import { toast } from 'react-hot-toast'

export default function ApplicationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基本情報
    name: '',
    email: '',
    phone: '',
    emergency_contact: '',
    // 住所情報
    postal_code: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    is_imabari_resident: false,
    residence_years: 0,
    // 犬情報
    dogs: [],
    // 書類
    vaccination_certificates: [],
    residence_proof: null,
  })
  
  const steps = [
    { number: 1, title: '基本情報' },
    { number: 2, title: '住所確認' },
    { number: 3, title: '犬情報' },
    { number: 4, title: '必要書類' },
    { number: 5, title: '確認' },
  ]
  
  const handleNext = (stepData: any) => {
    setFormData({ ...formData, ...stepData })
    setCurrentStep(currentStep + 1)
  }
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }
  
  const handleSubmit = async () => {
    const result = await withErrorHandling(async () => {
      // APIに送信するデータを整形
      const applicationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.prefecture}${formData.city}${formData.address}${formData.building || ''}`,
        postal_code: formData.postal_code,
        city_resident: formData.is_imabari_resident,
        dogs: formData.dogs.map((dog: any) => ({
          name: dog.name,
          breed: dog.breed,
          gender: dog.gender,
          age: parseInt(dog.age),
          weight: parseFloat(dog.weight),
          neutered: dog.neutered,
          rabies_vaccine_date: dog.rabies_vaccine_date,
          mixed_vaccine_date: dog.mixed_vaccine_date,
          microchip_number: dog.microchip_number,
        })),
        residence_proof: formData.residence_proof,
      }

      const response = await applicationService.createApplication(applicationData)
      toast.success('申請が送信されました')
      router.push(`/application/status?id=${response.id}`)
      return response
    })

    if (!result) {
      console.error('申請の送信に失敗しました')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          里山ドッグラン利用申請
        </h1>
        
        <div className="mb-12">
          <ProgressBar steps={steps} currentStep={currentStep} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {currentStep === 1 && (
            <ApplicationStep1
              data={formData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <ApplicationStep2
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <ApplicationStep3
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <ApplicationStep4
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <ApplicationStep5
              data={formData}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}