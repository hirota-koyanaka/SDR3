import { NextResponse } from 'next/server'
import { 
  getApplicationApprovedTemplate,
  getApplicationRejectedTemplate,
  getEventNotificationTemplate,
  getWelcomeEmailTemplate
} from '@/lib/email/templates'

export async function POST(request: Request) {
  try {
    const { type, to, data } = await request.json()
    
    let emailTemplate
    
    switch (type) {
      case 'application_approved':
        emailTemplate = getApplicationApprovedTemplate(
          data.userName,
          data.dogName
        )
        break
        
      case 'application_rejected':
        emailTemplate = getApplicationRejectedTemplate(
          data.userName,
          data.reason
        )
        break
        
      case 'event_notification':
        emailTemplate = getEventNotificationTemplate(
          data.userName,
          data.eventTitle,
          data.eventDate,
          data.eventTime,
          data.eventDescription
        )
        break
        
      case 'welcome':
        emailTemplate = getWelcomeEmailTemplate(data.userName)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }
    
    // 実際のメール送信処理
    // 本番環境では、SendGrid、Resend、AWS SESなどのサービスを使用
    // ここではログ出力のみ（デモ用）
    console.log('📧 Email would be sent:', {
      to,
      subject: emailTemplate.subject,
      type
    })
    
    // Supabaseのメール機能を使用する場合
    // const { error } = await supabase.auth.admin.sendEmail({
    //   email: to,
    //   subject: emailTemplate.subject,
    //   html: emailTemplate.html,
    // })
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      preview: {
        to,
        subject: emailTemplate.subject,
        type
      }
    })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}