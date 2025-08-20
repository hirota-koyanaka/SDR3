'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Upload, File, X, AlertCircle } from 'lucide-react'

interface Step4Props {
  data: any
  onNext: (data: any) => void
  onBack: () => void
}

export function ApplicationStep4({ data, onNext, onBack }: Step4Props) {
  const [vaccinationCertificates, setVaccinationCertificates] = useState<File[]>(
    data.vaccination_certificates || []
  )
  const [residenceProof, setResidenceProof] = useState<File | null>(
    data.residence_proof || null
  )
  
  const onDropVaccination = useCallback((acceptedFiles: File[]) => {
    setVaccinationCertificates(prev => [...prev, ...acceptedFiles])
  }, [])
  
  const onDropResidence = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setResidenceProof(acceptedFiles[0])
    }
  }, [])
  
  const { getRootProps: getVaccinationProps, getInputProps: getVaccinationInput, isDragActive: isVaccinationDragActive } = useDropzone({
    onDrop: onDropVaccination,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })
  
  const { getRootProps: getResidenceProps, getInputProps: getResidenceInput, isDragActive: isResidenceDragActive } = useDropzone({
    onDrop: onDropResidence,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  })
  
  const removeVaccinationFile = (index: number) => {
    setVaccinationCertificates(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleNext = () => {
    if (vaccinationCertificates.length === 0) {
      alert('ワクチン接種証明書をアップロードしてください')
      return
    }
    if (!residenceProof) {
      alert('住民票をアップロードしてください')
      return
    }
    onNext({ 
      vaccination_certificates: vaccinationCertificates,
      residence_proof: residenceProof
    })
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">必要書類のアップロード</h2>
      <p className="text-gray-600 mb-6">
        申請に必要な書類をアップロードしてください。
      </p>
      
      <div className="space-y-6">
        {/* ワクチン接種証明書 */}
        <div>
          <h3 className="font-semibold mb-2">
            ワクチン接種証明書 <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            登録した犬全頭分の狂犬病ワクチン接種証明書をアップロードしてください。
          </p>
          
          <div
            {...getVaccinationProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${isVaccinationDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <input {...getVaccinationInput()} />
            <Upload className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-gray-600">
              クリックまたはドラッグ&ドロップでファイルを選択
            </p>
            <p className="text-xs text-gray-500 mt-1">
              対応形式: JPG, PNG, PDF (最大5MB)
            </p>
          </div>
          
          {vaccinationCertificates.length > 0 && (
            <div className="mt-4 space-y-2">
              {vaccinationCertificates.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <File className="mr-2 text-gray-500" size={16} />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeVaccinationFile(index)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 住民票 */}
        <div>
          <h3 className="font-semibold mb-2">
            住民票 <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            今治市在住を証明する住民票（3ヶ月以内に発行されたもの）をアップロードしてください。
          </p>
          
          <div
            {...getResidenceProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${isResidenceDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <input {...getResidenceInput()} />
            <Upload className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-gray-600">
              クリックまたはドラッグ&ドロップでファイルを選択
            </p>
            <p className="text-xs text-gray-500 mt-1">
              対応形式: JPG, PNG, PDF (最大5MB)
            </p>
          </div>
          
          {residenceProof && (
            <div className="mt-4">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <File className="mr-2 text-gray-500" size={16} />
                  <span className="text-sm">{residenceProof.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(residenceProof.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => setResidenceProof(null)}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" size={20} />
            <div>
              <p className="text-blue-800 font-semibold">アップロードに関する注意事項</p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>ファイルサイズは1ファイルあたり5MB以下にしてください</li>
                <li>書類の文字が鮮明に読み取れる画像をアップロードしてください</li>
                <li>個人情報は適切に管理され、審査以外の目的では使用されません</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} size="lg" type="button">
          戻る
        </Button>
        <Button onClick={handleNext} size="lg" type="button">
          次へ
        </Button>
      </div>
    </div>
  )
}