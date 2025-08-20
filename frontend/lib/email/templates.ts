/**
 * メールテンプレート
 */

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function getApplicationApprovedTemplate(
  userName: string,
  dogName: string
): EmailTemplate {
  const subject = '【里山ドッグラン】利用申請が承認されました'
  
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003DA5 0%, #00A650 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #003DA5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>利用申請が承認されました</h1>
        </div>
        <div class="content">
          <p>${userName} 様</p>
          
          <p>里山ドッグランへのご登録ありがとうございます。</p>
          
          <p>お客様の利用申請が承認されましたのでお知らせいたします。</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>登録者名：</strong>${userName} 様</p>
            <p style="margin: 5px 0;"><strong>愛犬名：</strong>${dogName}</p>
          </div>
          
          <p>これより里山ドッグランをご利用いただけます。</p>
          
          <p><strong>ご利用方法：</strong></p>
          <ol>
            <li>マイページにログイン</li>
            <li>QRコードを生成</li>
            <li>施設入口でQRコードを提示</li>
          </ol>
          
          <center>
            <a href="https://satoyama-dogrun.vercel.app/login" class="button">マイページへログイン</a>
          </center>
          
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 里山ドッグラン | 今治市</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
${userName} 様

里山ドッグランへのご登録ありがとうございます。

お客様の利用申請が承認されましたのでお知らせいたします。

【登録情報】
登録者名：${userName} 様
愛犬名：${dogName}

これより里山ドッグランをご利用いただけます。

【ご利用方法】
1. マイページにログイン
2. QRコードを生成
3. 施設入口でQRコードを提示

マイページ: https://satoyama-dogrun.vercel.app/login

--
このメールは自動送信されています。
© 2024 里山ドッグラン | 今治市
  `
  
  return { subject, html, text }
}

export function getApplicationRejectedTemplate(
  userName: string,
  reason: string
): EmailTemplate {
  const subject = '【里山ドッグラン】利用申請について'
  
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .reason { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>利用申請について</h1>
        </div>
        <div class="content">
          <p>${userName} 様</p>
          
          <p>里山ドッグランへの利用申請をいただき、ありがとうございました。</p>
          
          <p>誠に申し訳ございませんが、以下の理由により、今回の申請を承認することができませんでした。</p>
          
          <div class="reason">
            <p><strong>理由：</strong></p>
            <p>${reason}</p>
          </div>
          
          <p>ご不明な点がございましたら、下記までお問い合わせください。</p>
          
          <p>
            <strong>お問い合わせ先</strong><br>
            里山ドッグラン管理事務所<br>
            Email: info@satoyama-dogrun.jp<br>
            電話: 0898-XX-XXXX
          </p>
          
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 里山ドッグラン | 今治市</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
${userName} 様

里山ドッグランへの利用申請をいただき、ありがとうございました。

誠に申し訳ございませんが、以下の理由により、今回の申請を承認することができませんでした。

【理由】
${reason}

ご不明な点がございましたら、下記までお問い合わせください。

【お問い合わせ先】
里山ドッグラン管理事務所
Email: info@satoyama-dogrun.jp
電話: 0898-XX-XXXX

--
このメールは自動送信されています。
© 2024 里山ドッグラン | 今治市
  `
  
  return { subject, html, text }
}

export function getEventNotificationTemplate(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventDescription: string
): EmailTemplate {
  const subject = `【里山ドッグラン】イベントのお知らせ「${eventTitle}」`
  
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00A650 0%, #003DA5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .event-info { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #00A650; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>イベントのお知らせ</h1>
        </div>
        <div class="content">
          <p>${userName} 様</p>
          
          <p>里山ドッグランで開催されるイベントのお知らせです。</p>
          
          <div class="event-info">
            <h2 style="margin-top: 0; color: #003DA5;">${eventTitle}</h2>
            <p><strong>開催日：</strong>${eventDate}</p>
            <p><strong>時間：</strong>${eventTime}</p>
            <p><strong>内容：</strong></p>
            <p>${eventDescription}</p>
          </div>
          
          <p>ぜひご参加ください！愛犬と一緒に楽しい時間を過ごしましょう。</p>
          
          <center>
            <a href="https://satoyama-dogrun.vercel.app/events" class="button">イベント詳細を見る</a>
          </center>
          
          <div class="footer">
            <p>配信停止をご希望の場合は、マイページから設定を変更してください。</p>
            <p>© 2024 里山ドッグラン | 今治市</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
${userName} 様

里山ドッグランで開催されるイベントのお知らせです。

【イベント情報】
イベント名：${eventTitle}
開催日：${eventDate}
時間：${eventTime}

【内容】
${eventDescription}

ぜひご参加ください！愛犬と一緒に楽しい時間を過ごしましょう。

イベント詳細: https://satoyama-dogrun.vercel.app/events

--
配信停止をご希望の場合は、マイページから設定を変更してください。
© 2024 里山ドッグラン | 今治市
  `
  
  return { subject, html, text }
}

export function getWelcomeEmailTemplate(
  userName: string
): EmailTemplate {
  const subject = '【里山ドッグラン】ご登録ありがとうございます'
  
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003DA5 0%, #00A650 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
        .steps { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ご登録ありがとうございます</h1>
        </div>
        <div class="content">
          <p>${userName} 様</p>
          
          <p>里山ドッグランへのご登録ありがとうございます。</p>
          
          <p>お客様の利用申請を受け付けました。管理者による承認が完了するまでしばらくお待ちください。</p>
          
          <div class="steps">
            <h3>今後の流れ</h3>
            <ol>
              <li>管理者が申請内容を確認します（通常1-2営業日）</li>
              <li>承認結果をメールでお知らせします</li>
              <li>承認後、マイページから施設をご利用いただけます</li>
            </ol>
          </div>
          
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 里山ドッグラン | 今治市</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
${userName} 様

里山ドッグランへのご登録ありがとうございます。

お客様の利用申請を受け付けました。管理者による承認が完了するまでしばらくお待ちください。

【今後の流れ】
1. 管理者が申請内容を確認します（通常1-2営業日）
2. 承認結果をメールでお知らせします
3. 承認後、マイページから施設をご利用いただけます

ご不明な点がございましたら、お気軽にお問い合わせください。

--
このメールは自動送信されています。
© 2024 里山ドッグラン | 今治市
  `
  
  return { subject, html, text }
}