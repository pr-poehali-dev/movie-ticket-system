import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления заказами билетов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        session_token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
        
        if not session_token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        user_id = int(session_token.split(':')[0])
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            movie_title = body.get('movie_title')
            showtime = body.get('showtime')
            show_date = body.get('show_date')
            seats = body.get('seats', [])
            ticket_count = body.get('ticket_count', 1)
            total_price = body.get('total_price', 0)
            
            if not all([movie_title, showtime, show_date, seats]):
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не все поля заполнены'}),
                    'isBase64Encoded': False
                }
            
            seats_str = ','.join(map(str, seats))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """INSERT INTO t_p64378712_movie_ticket_system.orders 
                    (user_id, movie_title, showtime, show_date, seats, ticket_count, total_price) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s) 
                    RETURNING id, movie_title, showtime, show_date, seats, ticket_count, total_price, status, created_at""",
                    (user_id, movie_title, showtime, show_date, seats_str, ticket_count, total_price)
                )
                order = cur.fetchone()
                conn.commit()
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'order': {
                        'id': order['id'],
                        'movie_title': order['movie_title'],
                        'showtime': order['showtime'],
                        'show_date': order['show_date'].isoformat() if order['show_date'] else None,
                        'seats': order['seats'],
                        'ticket_count': order['ticket_count'],
                        'total_price': order['total_price'],
                        'status': order['status'],
                        'created_at': order['created_at'].isoformat() if order['created_at'] else None
                    }
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT id, movie_title, showtime, show_date, seats, ticket_count, total_price, status, created_at 
                    FROM t_p64378712_movie_ticket_system.orders 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC""",
                    (user_id,)
                )
                orders = cur.fetchall()
            
            conn.close()
            
            orders_list = []
            for order in orders:
                orders_list.append({
                    'id': order['id'],
                    'movie_title': order['movie_title'],
                    'showtime': order['showtime'],
                    'show_date': order['show_date'].isoformat() if order['show_date'] else None,
                    'seats': order['seats'],
                    'ticket_count': order['ticket_count'],
                    'total_price': order['total_price'],
                    'status': order['status'],
                    'created_at': order['created_at'].isoformat() if order['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'orders': orders_list}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
