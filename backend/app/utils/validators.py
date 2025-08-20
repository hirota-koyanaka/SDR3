import re
from typing import Optional
from datetime import datetime, date


def validate_email(email: str) -> bool:
    """メールアドレスの形式を検証"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """電話番号の形式を検証（日本の形式）"""
    # ハイフンあり/なし両方に対応
    pattern = r'^(0\d{1,4}-?\d{1,4}-?\d{4}|0[789]0-?\d{4}-?\d{4})$'
    return re.match(pattern, phone.replace('-', '').replace(' ', '')) is not None


def validate_password(password: str) -> tuple[bool, str]:
    """パスワードの強度を検証"""
    if len(password) < 8:
        return False, "パスワードは8文字以上である必要があります"
    
    if not re.search(r'[A-Za-z]', password):
        return False, "パスワードには英字を含める必要があります"
    
    if not re.search(r'\d', password):
        return False, "パスワードには数字を含める必要があります"
    
    return True, ""


def validate_imabari_resident(is_resident: bool, residence_years: Optional[int]) -> bool:
    """今治市民情報の整合性を検証"""
    if is_resident and (residence_years is None or residence_years < 0):
        return False
    
    if not is_resident and residence_years is not None:
        return False
    
    return True


def validate_dog_weight(weight: Optional[float]) -> bool:
    """犬の体重を検証"""
    if weight is None:
        return True  # オプション項目
    
    return 0.1 <= weight <= 100.0  # 0.1kg〜100kgの範囲


def validate_birth_date(birth_date: Optional[date]) -> bool:
    """生年月日を検証"""
    if birth_date is None:
        return True  # オプション項目
    
    today = date.today()
    # 未来の日付は不可、100年前より古い日付も不可
    min_date = date(today.year - 100, 1, 1)
    
    return min_date <= birth_date <= today


def validate_event_date(event_date: datetime) -> bool:
    """イベント日時を検証"""
    # 現在時刻より未来である必要がある
    return event_date > datetime.utcnow()


def validate_registration_deadline(deadline: Optional[datetime], event_date: datetime) -> bool:
    """登録締切日時を検証"""
    if deadline is None:
        return True  # オプション項目
    
    # 締切はイベント日時より前である必要がある
    return deadline < event_date


def validate_hashtag(tag: str) -> bool:
    """ハッシュタグの形式を検証"""
    if not tag:
        return False
    
    # 英数字、ひらがな、カタカナ、漢字のみ許可（記号は除外）
    pattern = r'^[a-zA-Z0-9ひらがなカタカナ漢字]+$'
    return len(tag) <= 50 and re.match(pattern, tag) is not None


def validate_content_length(content: str, max_length: int = 1000) -> bool:
    """投稿内容の長さを検証"""
    return 1 <= len(content) <= max_length


def sanitize_html(content: str) -> str:
    """HTMLタグをサニタイズ"""
    # 基本的なHTMLエスケープ
    content = content.replace('&', '&amp;')
    content = content.replace('<', '&lt;')
    content = content.replace('>', '&gt;')
    content = content.replace('"', '&quot;')
    content = content.replace("'", '&#x27;')
    return content


def validate_file_size(size: int, max_size: int = 5 * 1024 * 1024) -> bool:
    """ファイルサイズを検証（デフォルト5MB）"""
    return 0 < size <= max_size


def validate_image_type(content_type: str) -> bool:
    """画像ファイルタイプを検証"""
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return content_type in allowed_types


def validate_document_type(content_type: str) -> bool:
    """ドキュメントファイルタイプを検証"""
    allowed_types = ['application/pdf']
    return content_type in allowed_types