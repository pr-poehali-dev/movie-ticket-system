import json
import os
import random
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для авторизации пользователей через SMS-верификацию'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        
        if action == 'send_code':
            phone = body.get('phone', '').strip()
            
            if not phone or len(phone) < 10:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Некорректный номер телефона'}),
                    'isBase64Encoded': False
                }
            
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            expires_at = datetime.now() + timedelta(minutes=5)
            
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO t_p64378712_movie_ticket_system.verification_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
                    (phone, code, expires_at)
                )
                conn.commit()
            
            conn.close()
            
            print(f"SMS Code for {phone}: {code}")
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Код отправлен на номер {phone}',
                    'dev_code': code
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_code':
            phone = body.get('phone', '').strip()
            code = body.get('code', '').strip()
            name = body.get('name', '').strip()
            
            if not phone or not code:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Телефон и код обязательны'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT * FROM t_p64378712_movie_ticket_system.verification_codes 
                    WHERE phone = %s AND code = %s AND expires_at > NOW() AND verified = FALSE 
                    ORDER BY created_at DESC LIMIT 1""",
                    (phone, code)
                )
                verification = cur.fetchone()
                
                if not verification:
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный код или код истек'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "UPDATE t_p64378712_movie_ticket_system.verification_codes SET verified = TRUE WHERE id = %s",
                    (verification['id'],)
                )
                
                cur.execute(
                    "SELECT * FROM t_p64378712_movie_ticket_system.users WHERE phone = %s",
                    (phone,)
                )
                user = cur.fetchone()
                
                if not user:
                    cur.execute(
                        "INSERT INTO t_p64378712_movie_ticket_system.users (phone, name) VALUES (%s, %s) RETURNING id, phone, name",
                        (phone, name if name else None)
                    )
                    user = cur.fetchone()
                elif name and not user['name']:
                    cur.execute(
                        "UPDATE t_p64378712_movie_ticket_system.users SET name = %s WHERE phone = %s RETURNING id, phone, name",
                        (name, phone)
                    )
                    user = cur.fetchone()
                
                conn.commit()
            
            conn.close()
            
            session_token = f"{user['id']}:{phone}:{random.randint(100000, 999999)}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user['id'],
                        'phone': user['phone'],
                        'name': user['name']
                    },
                    'session_token': session_token
                }),
                'isBase64Encoded': False
            }
        
        else:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
