import { createClient } from './client'

const supabase = createClient()

export type UploadFileType = 'vaccination' | 'rabies' | 'profile' | 'post'

interface UploadOptions {
  bucket?: string
  folder?: string
  fileName?: string
}

/**
 * ファイルをSupabase Storageにアップロード
 */
export async function uploadFile(
  file: File,
  type: UploadFileType,
  options?: UploadOptions
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // バケット名を決定
    const bucket = options?.bucket || 'satoyama-files'
    
    // フォルダパスを決定
    const folderMap: Record<UploadFileType, string> = {
      vaccination: 'vaccinations',
      rabies: 'rabies',
      profile: 'profiles',
      post: 'posts'
    }
    const folder = options?.folder || folderMap[type]
    
    // ファイル名を生成（タイムスタンプ付き）
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = options?.fileName || `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // ファイルパス
    const filePath = `${folder}/${fileName}`
    
    // アップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return { url: null, error }
    }
    
    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, error: error as Error }
  }
}

/**
 * ファイルを削除
 */
export async function deleteFile(
  fileUrl: string,
  bucket: string = 'satoyama-files'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // URLからファイルパスを抽出
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf(bucket)
    if (bucketIndex === -1) {
      return { success: false, error: new Error('Invalid file URL') }
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    // ファイルを削除
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Delete error:', error)
      return { success: false, error }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: error as Error }
  }
}

/**
 * 複数ファイルをアップロード
 */
export async function uploadMultipleFiles(
  files: File[],
  type: UploadFileType,
  options?: UploadOptions
): Promise<{ urls: string[]; errors: Error[] }> {
  const urls: string[] = []
  const errors: Error[] = []
  
  for (const file of files) {
    const { url, error } = await uploadFile(file, type, options)
    if (url) {
      urls.push(url)
    }
    if (error) {
      errors.push(error)
    }
  }
  
  return { urls, errors }
}

/**
 * ファイルサイズとタイプの検証
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): { valid: boolean; error?: string } {
  // ファイルサイズチェック
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `ファイルサイズは${maxSizeMB}MB以下にしてください` }
  }
  
  // ファイルタイプチェック
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '許可されていないファイル形式です' }
  }
  
  return { valid: true }
}