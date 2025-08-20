import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import hashlib
import secrets


def generate_uuid() -> str:
    """UUID4を生成"""
    return str(uuid.uuid4())


def generate_secure_token(length: int = 32) -> str:
    """安全なランダムトークンを生成"""
    return secrets.token_urlsafe(length)


def hash_password(password: str) -> str:
    """パスワードをハッシュ化"""
    # 実際のアプリケーションではより強固なハッシュ化（bcrypt等）を使用
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ':' + salt


def verify_password(password: str, hashed: str) -> bool:
    """パスワードを検証"""
    try:
        password_hash, salt = hashed.split(':')
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() == password_hash
    except:
        return False


def get_jst_now() -> datetime:
    """日本時間の現在時刻を取得"""
    jst = timezone(timedelta(hours=9))
    return datetime.now(jst)


def format_datetime_jst(dt: datetime) -> str:
    """日本時間でのフォーマット"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    jst = timezone(timedelta(hours=9))
    jst_dt = dt.astimezone(jst)
    return jst_dt.strftime('%Y年%m月%d日 %H:%M')


def calculate_age_from_birth_date(birth_date: str) -> Optional[int]:
    """生年月日から年齢を計算"""
    try:
        birth = datetime.fromisoformat(birth_date.replace('Z', '+00:00')).date()
        today = datetime.now().date()
        age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        return age
    except:
        return None


def paginate_results(items: List[Any], page: int, per_page: int) -> Dict[str, Any]:
    """結果をページネーション"""
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        "total": total,
        "items": items[start:end],
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


def mask_email(email: str) -> str:
    """メールアドレスをマスク"""
    if '@' not in email:
        return email
    
    local, domain = email.split('@')
    if len(local) <= 2:
        masked_local = local
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"


def mask_phone(phone: str) -> str:
    """電話番号をマスク"""
    # ハイフンを除去
    digits = ''.join(filter(str.isdigit, phone))
    
    if len(digits) >= 7:
        return digits[:3] + '-****-' + digits[-4:]
    else:
        return '*' * len(digits)


def extract_hashtags(text: str) -> List[str]:
    """テキストからハッシュタグを抽出"""
    import re
    pattern = r'#([a-zA-Z0-9ひらがなカタカナ漢字]+)'
    hashtags = re.findall(pattern, text)
    return list(set(hashtags))  # 重複を除去


def clean_filename(filename: str) -> str:
    """ファイル名をクリーンアップ"""
    import re
    # 危険な文字を除去
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # 連続するアンダースコアを1つに
    filename = re.sub(r'_+', '_', filename)
    # 最大255文字に制限
    return filename[:255]


def generate_qr_filename(user_id: str) -> str:
    """QRコード用のファイル名を生成"""
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    return f"qr_{user_id}_{timestamp}.png"


def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """2点間の距離を計算（km単位）"""
    import math
    
    # Haversine公式
    R = 6371  # 地球の半径（km）
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def is_business_hours(current_time: datetime, day_hours: Dict[str, Any]) -> bool:
    """現在時刻が営業時間内かチェック"""
    try:
        if day_hours.get('is_closed', False):
            return False
        
        open_time = day_hours.get('open_time')
        close_time = day_hours.get('close_time')
        
        if not open_time or not close_time:
            return False
        
        current_time_str = current_time.strftime('%H:%M')
        
        return open_time <= current_time_str <= close_time
        
    except:
        return False


def format_stay_duration(minutes: int) -> str:
    """滞在時間をフォーマット"""
    if minutes < 60:
        return f"{minutes}分"
    
    hours = minutes // 60
    remaining_minutes = minutes % 60
    
    if remaining_minutes == 0:
        return f"{hours}時間"
    else:
        return f"{hours}時間{remaining_minutes}分"


def validate_imabari_address(address: str) -> bool:
    """今治市の住所かチェック"""
    # 簡易チェック（実際には郵便番号APIなどを使用することを推奨）
    imabari_keywords = ['今治市', '今治']
    return any(keyword in address for keyword in imabari_keywords)


def generate_application_number() -> str:
    """申請番号を生成"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    random_suffix = secrets.token_hex(3).upper()
    return f"APP-{timestamp}-{random_suffix}"