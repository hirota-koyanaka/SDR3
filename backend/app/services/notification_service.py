from app.core.supabase import supabase
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import json


class NotificationService:
    @staticmethod
    async def notify_admin_new_application(application: Dict[str, Any]) -> None:
        """
        新規申請を管理者に通知
        """
        try:
            # 管理者一覧を取得
            admins = supabase.table("admin_users").select("email, name").eq("is_active", True).execute()
            
            if not admins.data:
                return
            
            # 通知内容
            subject = "新しい利用申請があります"
            message = f"""
            新しい利用申請が提出されました。

            申請者: {application.get('name')}
            メール: {application.get('email')}
            電話番号: {application.get('phone')}
            住所: {application.get('address')}
            今治市民: {'はい' if application.get('is_imabari_resident') else 'いいえ'}

            管理画面で確認してください。
            """
            
            # 各管理者にメール送信
            for admin in admins.data:
                await NotificationService._send_email(
                    admin["email"],
                    subject,
                    message
                )
                
        except Exception as e:
            # 通知エラーはログに記録するが、メイン処理は継続
            print(f"管理者通知エラー: {str(e)}")
    
    @staticmethod
    async def send_approval_email(application: Dict[str, Any]) -> None:
        """
        申請承認メールを送信
        """
        try:
            subject = "里山ドッグラン利用申請が承認されました"
            message = f"""
            {application.get('name')} 様

            里山ドッグランの利用申請が承認されました。

            これで里山ドッグランをご利用いただけます。
            ご利用の際は、以下の点にご注意ください：

            1. 事前にQRコードを生成してお越しください
            2. ワクチン接種証明書をご持参ください
            3. 営業時間内にご利用ください

            ご不明な点がございましたら、お気軽にお問い合わせください。

            里山ドッグラン管理チーム
            """
            
            await NotificationService._send_email(
                application["email"],
                subject,
                message
            )
            
        except Exception as e:
            print(f"承認メール送信エラー: {str(e)}")
    
    @staticmethod
    async def send_rejection_email(application: Dict[str, Any], reason: str) -> None:
        """
        申請却下メールを送信
        """
        try:
            subject = "里山ドッグラン利用申請について"
            message = f"""
            {application.get('name')} 様

            里山ドッグランの利用申請を拝見いたしましたが、
            誠に申し訳ございませんが、下記の理由により承認いたしかねます。

            却下理由:
            {reason}

            ご不明な点やご質問がございましたら、お気軽にお問い合わせください。

            里山ドッグラン管理チーム
            """
            
            await NotificationService._send_email(
                application["email"],
                subject,
                message
            )
            
        except Exception as e:
            print(f"却下メール送信エラー: {str(e)}")
    
    @staticmethod
    async def notify_new_event(event: Dict[str, Any]) -> None:
        """
        新しいイベントを全ユーザーに通知
        """
        try:
            # アクティブなユーザー一覧を取得
            users = supabase.table("users").select("email, name").eq("status", "active").execute()
            
            if not users.data:
                return
            
            # 通知内容
            subject = f"新しいイベント: {event.get('title')}"
            message = f"""
            新しいイベントのお知らせです。

            イベント名: {event.get('title')}
            開催日時: {event.get('event_date')}
            場所: {event.get('location') or '里山ドッグラン'}
            説明: {event.get('description', '')}

            詳細はアプリでご確認ください。

            里山ドッグラン管理チーム
            """
            
            # バッチでメール送信（並列処理）
            email_tasks = []
            for user in users.data:
                task = NotificationService._send_email(
                    user["email"],
                    subject,
                    message.replace("{{name}}", user["name"])
                )
                email_tasks.append(task)
            
            # 最大10件ずつ並列処理
            for i in range(0, len(email_tasks), 10):
                batch = email_tasks[i:i+10]
                await asyncio.gather(*batch, return_exceptions=True)
                
        except Exception as e:
            print(f"イベント通知エラー: {str(e)}")
    
    @staticmethod
    async def send_push_notification(announcement: Dict[str, Any]) -> None:
        """
        プッシュ通知を送信
        """
        try:
            # TODO: プッシュ通知サービス（Firebase, OneSignal等）の実装
            # 現在はメール通知で代用
            
            # アクティブなユーザー一覧を取得
            users = supabase.table("users").select("email, name").eq("status", "active").execute()
            
            if not users.data:
                return
            
            priority_text = {
                "high": "重要",
                "urgent": "緊急"
            }.get(announcement.get("priority"), "")
            
            subject = f"【{priority_text}】{announcement.get('title')}"
            message = f"""
            {announcement.get('content')}

            里山ドッグラン管理チーム
            """
            
            # 緊急度が高い場合は即座に送信
            if announcement.get("priority") == "urgent":
                # 並列処理で高速送信
                email_tasks = []
                for user in users.data:
                    task = NotificationService._send_email(
                        user["email"],
                        subject,
                        message
                    )
                    email_tasks.append(task)
                
                # 5件ずつ並列処理（サーバー負荷を考慮）
                for i in range(0, len(email_tasks), 5):
                    batch = email_tasks[i:i+5]
                    await asyncio.gather(*batch, return_exceptions=True)
                    
        except Exception as e:
            print(f"プッシュ通知エラー: {str(e)}")
    
    @staticmethod
    async def _send_email(to_email: str, subject: str, body: str) -> bool:
        """
        メール送信（内部メソッド）
        """
        try:
            # TODO: 実際のメールサービス（SendGrid, AWS SES等）の実装
            # 現在は仮実装
            
            print(f"[EMAIL] To: {to_email}")
            print(f"[EMAIL] Subject: {subject}")
            print(f"[EMAIL] Body: {body[:100]}...")
            
            # メール送信ログをDBに記録
            log = {
                "recipient": to_email,
                "subject": subject,
                "body": body,
                "sent_at": datetime.utcnow().isoformat(),
                "status": "sent"
            }
            
            # TODO: email_logsテーブルに保存
            # supabase.table("email_logs").insert(log).execute()
            
            return True
            
        except Exception as e:
            print(f"メール送信エラー: {str(e)}")
            return False
    
    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str) -> None:
        """
        パスワードリセットメールを送信
        """
        try:
            subject = "パスワードリセットのご案内"
            # TODO: フロントエンドのリセットページURLを設定
            reset_url = f"https://your-frontend-domain.com/reset-password?token={reset_token}"
            
            message = f"""
            パスワードリセットのリクエストを受け付けました。

            以下のリンクをクリックして、新しいパスワードを設定してください：
            {reset_url}

            このリンクは24時間有効です。

            心当たりがない場合は、このメールを無視してください。

            里山ドッグラン管理チーム
            """
            
            await NotificationService._send_email(email, subject, message)
            
        except Exception as e:
            print(f"パスワードリセットメール送信エラー: {str(e)}")
    
    @staticmethod
    async def send_vaccination_reminder(user_id: str, dog_name: str, vaccine_type: str) -> None:
        """
        ワクチン接種リマインダーを送信
        """
        try:
            # ユーザー情報を取得
            user = supabase.table("users").select("email, name").eq("id", user_id).execute()
            
            if not user.data:
                return
            
            subject = f"{dog_name}のワクチン接種期限が近づいています"
            message = f"""
            {user.data[0]['name']} 様

            {dog_name}の{vaccine_type}ワクチン接種期限が近づいています。

            ドッグランを安全にご利用いただくため、
            お早めにワクチン接種を受けていただきますようお願いいたします。

            接種後は、アプリからワクチン記録を更新してください。

            里山ドッグラン管理チーム
            """
            
            await NotificationService._send_email(
                user.data[0]["email"],
                subject,
                message
            )
            
        except Exception as e:
            print(f"ワクチンリマインダー送信エラー: {str(e)}")
    
    @staticmethod
    async def broadcast_realtime_update(channel: str, event: str, data: Dict[str, Any]) -> None:
        """
        リアルタイム更新をブロードキャスト
        """
        try:
            # TODO: Supabase Realtimeチャンネルでブロードキャスト
            # または WebSocket実装
            
            print(f"[REALTIME] Channel: {channel}, Event: {event}")
            print(f"[REALTIME] Data: {json.dumps(data, ensure_ascii=False)}")
            
            # Supabase Realtimeを使用する場合の実装例
            # supabase.realtime.channel(channel).send({
            #     "type": "broadcast",
            #     "event": event,
            #     "payload": data
            # })
            
        except Exception as e:
            print(f"リアルタイム通知エラー: {str(e)}")


# リアルタイム更新用のヘルパー関数
async def broadcast_entry_update():
    """入退場情報の更新をブロードキャスト"""
    try:
        # 現在の利用者数を取得
        current = supabase.table("entry_logs").select("id", count="exact").is_("exit_time", None).execute()
        count = current.count if hasattr(current, 'count') else 0
        
        await NotificationService.broadcast_realtime_update(
            "entries",
            "visitor_count_updated",
            {"current_visitors": count}
        )
    except Exception as e:
        print(f"入退場更新ブロードキャストエラー: {str(e)}")


async def broadcast_new_post(post: Dict[str, Any]):
    """新規投稿をブロードキャスト"""
    try:
        await NotificationService.broadcast_realtime_update(
            "posts",
            "new_post",
            {"post": post}
        )
    except Exception as e:
        print(f"新規投稿ブロードキャストエラー: {str(e)}")